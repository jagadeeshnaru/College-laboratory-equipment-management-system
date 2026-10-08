const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/users - List all users / faculty / admin
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

// POST /api/users - Create User (Faculty / Admin)
router.post('/', async (req, res, next) => {
  try {
    const { username, password = 'faculty123', full_name, email, role = 'Faculty', department = 'CSE' } = req.body;

    if (!username || !full_name || !email) {
      return res.status(400).json({ success: false, message: 'Username, Full Name, and Email are required' });
    }

    // Check if username or email already exists
    const existing = await db.query('SELECT user_id FROM users WHERE username = ? OR email = ?', [username.trim(), email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'A user with this username or email already exists' });
    }

    const insertSql = `
      INSERT INTO users (username, password, full_name, email, role, department)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(insertSql, [username.trim(), password, full_name.trim(), email.trim(), role, department]);

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
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

// DELETE /api/users/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRes = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (userRes.rows[0].username === 'admin') {
      return res.status(400).json({ success: false, message: 'Primary admin user cannot be deleted' });
    }

    await db.query('DELETE FROM users WHERE user_id = ?', [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
