const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validate, damageReportValidationRules, maintenanceUpdateValidationRules } = require('../middleware/validation');

// GET /api/maintenance - List all maintenance records with JOINed equipment details
router.get('/', async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        m.maintenance_id,
        m.maintenance_code,
        m.equipment_id,
        e.equipment_code,
        e.name AS equipment_name,
        c.category_name,
        l.lab_name,
        m.issue_description,
        m.priority,
        m.reported_by,
        m.reported_date,
        m.resolved_date,
        m.cost,
        m.status,
        m.notes,
        m.created_at
      FROM maintenance m
      INNER JOIN equipment e ON m.equipment_id = e.equipment_id
      LEFT JOIN categories c ON e.category_id = c.category_id
      LEFT JOIN laboratories l ON e.lab_id = l.lab_id
      ORDER BY m.maintenance_id DESC
    `;
    const result = await db.query(sql);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/maintenance/report - Report Damage or Service Issue (Modal Screen 7)
router.post('/report', validate(damageReportValidationRules), async (req, res, next) => {
  try {
    const {
      equipment_id,
      issue_description,
      priority = 'High',
      reported_by = 'Staff / Student',
      notes = ''
    } = req.body;

    // Check if equipment exists
    const eqRes = await db.query('SELECT * FROM equipment WHERE equipment_id = ?', [equipment_id]);
    if (eqRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    // Generate maintenance code like M006
    const maxRes = await db.query('SELECT MAX(maintenance_id) as maxId FROM maintenance');
    const nextNum = (maxRes.rows[0]?.maxId || 0) + 1;
    const maintenance_code = `M${String(nextNum).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const insertSql = `
      INSERT INTO maintenance (maintenance_code, equipment_id, issue_description, priority, reported_by, reported_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, 'Under Maintenance', ?)
    `;

    const result = await db.query(insertSql, [
      maintenance_code,
      equipment_id,
      issue_description,
      priority,
      reported_by,
      today,
      notes
    ]);

    // Update equipment status to 'Under Maintenance' or 'Damaged' based on priority
    const newStatus = priority === 'Critical' ? 'Damaged' : 'Under Maintenance';
    await db.query(
      'UPDATE equipment SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE equipment_id = ?',
      [newStatus, equipment_id]
    );

    res.status(201).json({
      success: true,
      message: 'Damage report logged and equipment moved to Under Maintenance',
      data: {
        maintenance_id: result.insertId || nextNum,
        maintenance_code,
        equipment_id,
        issue_description,
        priority,
        status: 'Under Maintenance'
      }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/maintenance/:id/status - Update Maintenance Status / Resolve
router.put('/:id/status', validate(maintenanceUpdateValidationRules), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cost = 0.0, notes = '', resolved_date } = req.body;

    const maintRes = await db.query('SELECT * FROM maintenance WHERE maintenance_id = ?', [id]);
    if (maintRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    const maint = maintRes.rows[0];
    const today = new Date().toISOString().split('T')[0];
    const actualResolvedDate = status === 'Resolved' ? (resolved_date || today) : null;

    const updateSql = `
      UPDATE maintenance
      SET status = ?, cost = ?, notes = ?, resolved_date = ?
      WHERE maintenance_id = ?
    `;

    await db.query(updateSql, [status, cost, notes, actualResolvedDate, id]);

    // If resolved, return equipment status back to Available
    if (status === 'Resolved') {
      await db.query(
        "UPDATE equipment SET status = 'Available', updated_at = CURRENT_TIMESTAMP WHERE equipment_id = ?",
        [maint.equipment_id]
      );
    } else if (status === 'In Progress' || status === 'Under Maintenance') {
      await db.query(
        "UPDATE equipment SET status = 'Under Maintenance', updated_at = CURRENT_TIMESTAMP WHERE equipment_id = ?",
        [maint.equipment_id]
      );
    }

    res.json({
      success: true,
      message: `Maintenance status updated to ${status}`
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/maintenance/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM maintenance WHERE maintenance_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }
    res.json({ success: true, message: 'Maintenance record deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
