const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/users - List all users / students / faculty
router.get('/', async (req, res, next) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT user_id, username, full_name, email, role, department, created_at FROM users';
    const params = [];

    if (role && role !== 'all') {
      sql += ' WHERE role = ?';
      params.push(role);
    }

    sql += ' ORDER BY role ASC, full_name ASC';

    const result = await db.query(sql, params);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create User
router.post('/', async (req, res, next) => {
  try {
    const { username, password = 'password123', full_name, email, role = 'Student', department = 'CSE' } = req.body;

    if (!username || !full_name || !email) {
      return res.status(400).json({ success: false, message: 'Username, Full Name, and Email are required' });
    }

    const insertSql = `
      INSERT INTO users (username, password, full_name, email, role, department)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(insertSql, [username, password, full_name, email, role, department]);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user_id: result.insertId,
        username,
        full_name,
        email,
        role,
        department
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
