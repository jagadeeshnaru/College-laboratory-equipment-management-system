const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/reports/by-laboratory (Mockup Screen 9: By Laboratory Report)
router.get('/by-laboratory', async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        l.lab_id,
        l.lab_name AS laboratory,
        l.department,
        COUNT(e.equipment_id) AS total_equipment,
        SUM(CASE WHEN e.status = 'Available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN e.status = 'In Use' THEN 1 ELSE 0 END) AS in_use,
        SUM(CASE WHEN e.status = 'Under Maintenance' THEN 1 ELSE 0 END) AS under_maintenance,
        SUM(CASE WHEN e.status = 'Damaged' THEN 1 ELSE 0 END) AS damaged
      FROM laboratories l
      LEFT JOIN equipment e ON l.lab_id = e.lab_id
      GROUP BY l.lab_id, l.lab_name
      ORDER BY total_equipment DESC
    `;

    const result = await db.query(sql);

    // Calculate overall totals
    const totals = result.rows.reduce(
      (acc, row) => ({
        total_equipment: acc.total_equipment + parseInt(row.total_equipment || 0, 10),
        available: acc.available + parseInt(row.available || 0, 10),
        in_use: acc.in_use + parseInt(row.in_use || 0, 10),
        under_maintenance: acc.under_maintenance + parseInt(row.under_maintenance || 0, 10),
        damaged: acc.damaged + parseInt(row.damaged || 0, 10)
      }),
      { total_equipment: 0, available: 0, in_use: 0, under_maintenance: 0, damaged: 0 }
    );

    res.json({
      success: true,
      data: result.rows,
      totals
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/by-category (Mockup Screen 9: By Category Report & Donut Chart)
router.get('/by-category', async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        c.category_id,
        c.category_name AS category,
        COUNT(e.equipment_id) AS total_equipment,
        SUM(CASE WHEN e.status = 'Available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN e.status = 'In Use' THEN 1 ELSE 0 END) AS in_use,
        SUM(CASE WHEN e.status = 'Under Maintenance' THEN 1 ELSE 0 END) AS under_maintenance,
        SUM(CASE WHEN e.status = 'Damaged' THEN 1 ELSE 0 END) AS damaged
      FROM categories c
      LEFT JOIN equipment e ON c.category_id = e.category_id
      GROUP BY c.category_id, c.category_name
      ORDER BY total_equipment DESC
    `;

    const result = await db.query(sql);

    const totals = result.rows.reduce(
      (acc, row) => ({
        total_equipment: acc.total_equipment + parseInt(row.total_equipment || 0, 10),
        available: acc.available + parseInt(row.available || 0, 10),
        in_use: acc.in_use + parseInt(row.in_use || 0, 10),
        under_maintenance: acc.under_maintenance + parseInt(row.under_maintenance || 0, 10),
        damaged: acc.damaged + parseInt(row.damaged || 0, 10)
      }),
      { total_equipment: 0, available: 0, in_use: 0, under_maintenance: 0, damaged: 0 }
    );

    res.json({
      success: true,
      data: result.rows,
      totals
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/maintenance-summary (Mockup Screen 2 & 9: Maintenance Status Distribution)
router.get('/maintenance-summary', async (req, res, next) => {
  try {
    // 1. Distribution by status
    const statusSql = `
      SELECT 
        m.status,
        COUNT(*) AS count,
        COALESCE(SUM(m.cost), 0.0) AS total_cost
      FROM maintenance m
      GROUP BY m.status
    `;
    const statusResult = await db.query(statusSql);

    // 2. Full active tickets
    const activeSql = `
      SELECT 
        m.maintenance_id,
        m.maintenance_code,
        e.equipment_code,
        e.name AS equipment_name,
        l.lab_name,
        m.issue_description,
        m.priority,
        m.reported_by,
        m.reported_date,
        m.cost,
        m.status
      FROM maintenance m
      INNER JOIN equipment e ON m.equipment_id = e.equipment_id
      LEFT JOIN laboratories l ON e.lab_id = l.lab_id
      ORDER BY m.reported_date DESC
    `;
    const activeResult = await db.query(activeSql);

    res.json({
      success: true,
      statusDistribution: statusResult.rows,
      records: activeResult.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/damaged (Mockup Screen 9: Damaged Tab)
router.get('/damaged', async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        e.equipment_id,
        e.equipment_code,
        e.name AS equipment_name,
        c.category_name,
        l.lab_name,
        e.status,
        m.issue_description,
        m.priority,
        m.reported_by,
        m.reported_date
      FROM equipment e
      INNER JOIN categories c ON e.category_id = c.category_id
      INNER JOIN laboratories l ON e.lab_id = l.lab_id
      LEFT JOIN maintenance m ON e.equipment_id = m.equipment_id AND m.status != 'Resolved'
      WHERE e.status = 'Damaged' OR e.status = 'Under Maintenance'
      ORDER BY e.equipment_id ASC
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

module.exports = router;
