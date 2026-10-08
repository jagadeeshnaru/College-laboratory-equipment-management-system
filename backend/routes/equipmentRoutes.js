const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validate, equipmentValidationRules } = require('../middleware/validation');

// GET /api/equipment/stats/summary - Dashboard KPI metrics
router.get('/stats/summary', async (req, res, next) => {
  try {
    const summaryQuery = `
      SELECT 
        COUNT(*) AS total_equipment,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN status = 'In Use' THEN 1 ELSE 0 END) AS in_use,
        SUM(CASE WHEN status = 'Under Maintenance' THEN 1 ELSE 0 END) AS under_maintenance,
        SUM(CASE WHEN status = 'Damaged' THEN 1 ELSE 0 END) AS damaged
      FROM equipment
    `;
    const result = await db.query(summaryQuery);
    const data = result.rows[0] || {
      total_equipment: 0,
      available: 0,
      in_use: 0,
      under_maintenance: 0,
      damaged: 0
    };

    res.json({
      success: true,
      data: {
        total_equipment: parseInt(data.total_equipment || 0, 10),
        available: parseInt(data.available || 0, 10),
        in_use: parseInt(data.in_use || 0, 10),
        under_maintenance: parseInt(data.under_maintenance || 0, 10),
        damaged: parseInt(data.damaged || 0, 10)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/equipment - List with Search, Filter & Multi-table JOIN
router.get('/', async (req, res, next) => {
  try {
    const { search, lab_id, category_id, status } = req.query;

    let sql = `
      SELECT 
        e.equipment_id,
        e.equipment_code,
        e.name,
        e.category_id,
        c.category_name,
        e.lab_id,
        l.lab_name,
        l.location AS lab_location,
        l.in_charge AS lab_in_charge,
        e.status,
        e.purchase_date,
        e.warranty,
        e.model_number,
        e.serial_number,
        e.description,
        e.image_url,
        e.created_at,
        e.updated_at
      FROM equipment e
      INNER JOIN categories c ON e.category_id = c.category_id
      INNER JOIN laboratories l ON e.lab_id = l.lab_id
      WHERE 1=1
    `;

    const params = [];

    if (search && search.trim() !== '') {
      sql += ` AND (e.name LIKE ? OR e.equipment_code LIKE ? OR e.model_number LIKE ? OR e.description LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (lab_id && lab_id !== 'all' && lab_id !== '') {
      sql += ` AND e.lab_id = ?`;
      params.push(lab_id);
    }

    if (category_id && category_id !== 'all' && category_id !== '') {
      sql += ` AND e.category_id = ?`;
      params.push(category_id);
    }

    if (status && status !== 'all' && status !== '') {
      sql += ` AND e.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY e.equipment_id ASC`;

    const result = await db.query(sql, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/equipment/:id - Single equipment detail
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        e.equipment_id,
        e.equipment_code,
        e.name,
        e.category_id,
        c.category_name,
        e.lab_id,
        l.lab_name,
        l.location AS lab_location,
        l.in_charge AS lab_in_charge,
        e.status,
        e.purchase_date,
        e.warranty,
        e.model_number,
        e.serial_number,
        e.description,
        e.image_url,
        e.created_at,
        e.updated_at
      FROM equipment e
      INNER JOIN categories c ON e.category_id = c.category_id
      INNER JOIN laboratories l ON e.lab_id = l.lab_id
      WHERE e.equipment_id = ? OR e.equipment_code = ?
    `;

    const result = await db.query(sql, [id, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Also fetch allocation and maintenance history
    const equipment = result.rows[0];

    const allocations = await db.query(
      'SELECT * FROM allocations WHERE equipment_id = ? ORDER BY allocation_id DESC',
      [equipment.equipment_id]
    );

    const maintenance = await db.query(
      'SELECT * FROM maintenance WHERE equipment_id = ? ORDER BY maintenance_id DESC',
      [equipment.equipment_id]
    );

    res.json({
      success: true,
      data: {
        ...equipment,
        allocations: allocations.rows,
        maintenance: maintenance.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/equipment - Add new Equipment
router.post('/', validate(equipmentValidationRules), async (req, res, next) => {
  try {
    const {
      name,
      category_id,
      lab_id,
      status = 'Available',
      purchase_date,
      warranty = '3 Years',
      model_number = '',
      serial_number = '',
      description = '',
      image_url = 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80'
    } = req.body;

    // Generate unique equipment code like EQ013
    const maxRes = await db.query('SELECT MAX(equipment_id) as maxId FROM equipment');
    const nextNum = (maxRes.rows[0]?.maxId || 0) + 1;
    const equipment_code = `EQ${String(nextNum).padStart(3, '0')}`;

    const insertSql = `
      INSERT INTO equipment (equipment_code, name, category_id, lab_id, status, purchase_date, warranty, model_number, serial_number, description, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(insertSql, [
      equipment_code,
      name,
      category_id,
      lab_id,
      status,
      purchase_date || new Date().toISOString().split('T')[0],
      warranty,
      model_number,
      serial_number,
      description,
      image_url
    ]);

    const newId = result.insertId || nextNum;

    res.status(201).json({
      success: true,
      message: 'Equipment registered successfully',
      data: {
        equipment_id: newId,
        equipment_code,
        name,
        category_id,
        lab_id,
        status,
        purchase_date,
        warranty,
        description
      }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/equipment/:id - Update Equipment
router.put('/:id', validate(equipmentValidationRules), async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      category_id,
      lab_id,
      status,
      purchase_date,
      warranty,
      model_number,
      serial_number,
      description,
      image_url
    } = req.body;

    const updateSql = `
      UPDATE equipment
      SET name = ?, category_id = ?, lab_id = ?, status = ?, purchase_date = ?, warranty = ?, model_number = ?, serial_number = ?, description = ?, image_url = COALESCE(?, image_url), updated_at = CURRENT_TIMESTAMP
      WHERE equipment_id = ?
    `;

    const result = await db.query(updateSql, [
      name,
      category_id,
      lab_id,
      status,
      purchase_date,
      warranty,
      model_number,
      serial_number,
      description,
      image_url,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found for update'
      });
    }

    res.json({
      success: true,
      message: 'Equipment updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/equipment/:id - Delete Equipment
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM equipment WHERE equipment_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found for deletion'
      });
    }

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
