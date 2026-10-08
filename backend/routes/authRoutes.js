const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Query user by username
    const result = await db.query(
      'SELECT user_id, username, password, full_name, email, role, department FROM users WHERE username = ?',
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or credentials'
      });
    }

    const user = result.rows[0];

    // Simple password check (in dev/demo mode)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Role check if provided
    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `User is registered as ${user.role}, not ${role}`
      });
    }

    // Remove password before sending
    const { password: _, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Login successful',
      user: safeUser,
      token: 'lab_ems_jwt_token_' + user.user_id + '_' + Date.now()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
