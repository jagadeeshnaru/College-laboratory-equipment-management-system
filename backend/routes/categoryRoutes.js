const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/categories - List all categories with equipment counts
router.get('/', async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        c.category_id,
        c.category_name,
        c.description,
        COUNT(e.equipment_id) AS equipment_count
      FROM categories c
      LEFT JOIN equipment e ON c.category_id = e.category_id
      GROUP BY c.category_id, c.category_name
      ORDER BY c.category_id ASC
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

// POST /api/categories - Add category
router.post('/', async (req, res, next) => {
  try {
    const { category_name, description } = req.body;
    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const result = await db.query(
      'INSERT INTO categories (category_name, description) VALUES (?, ?)',
      [category_name.trim(), description || '']
    );

    res.status(201).json({
      success: true,
      message: 'Category created',
      data: { category_id: result.insertId, category_name, description }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
