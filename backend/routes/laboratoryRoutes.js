const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/laboratories - List all laboratories with equipment statistics
router.get('/', async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        l.lab_id,
        l.lab_name,
        l.department,
        l.location,
        l.capacity,
        l.in_charge,
        COUNT(e.equipment_id) AS total_equipment,
        SUM(CASE WHEN e.status = 'Available' THEN 1 ELSE 0 END) AS available_equipment,
        SUM(CASE WHEN e.status = 'In Use' THEN 1 ELSE 0 END) AS in_use_equipment,
        SUM(CASE WHEN e.status = 'Under Maintenance' THEN 1 ELSE 0 END) AS maintenance_equipment,
        SUM(CASE WHEN e.status = 'Damaged' THEN 1 ELSE 0 END) AS damaged_equipment
      FROM laboratories l
      LEFT JOIN equipment e ON l.lab_id = e.lab_id
      GROUP BY l.lab_id, l.lab_name
      ORDER BY l.lab_id ASC
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

// POST /api/laboratories - Create laboratory
router.post('/', async (req, res, next) => {
  try {
    const { lab_name, department, location, capacity = 30, in_charge } = req.body;
    if (!lab_name || !department || !in_charge) {
      return res.status(400).json({ success: false, message: 'Lab name, department, and in-charge are required' });
    }

    const result = await db.query(
      'INSERT INTO laboratories (lab_name, department, location, capacity, in_charge) VALUES (?, ?, ?, ?, ?)',
      [lab_name.trim(), department.trim(), location || 'Main Block', capacity, in_charge.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Laboratory added successfully',
      data: { lab_id: result.insertId, lab_name, department, location, capacity, in_charge }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
