const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validate, allocationValidationRules } = require('../middleware/validation');

// GET /api/allocations - List all allocations with JOINed equipment details
router.get('/', async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        a.allocation_id,
        a.allocation_code,
        a.equipment_id,
        e.equipment_code,
        e.name AS equipment_name,
        c.category_name,
        l.lab_name,
        a.allocated_to_name,
        a.allocated_to_role,
        a.department,
        a.from_date,
        a.to_date,
        a.purpose,
        a.status,
        a.returned_date,
        a.created_at
      FROM allocations a
      INNER JOIN equipment e ON a.equipment_id = e.equipment_id
      LEFT JOIN categories c ON e.category_id = c.category_id
      LEFT JOIN laboratories l ON e.lab_id = l.lab_id
      ORDER BY a.allocation_id DESC
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

// POST /api/allocations - Add new allocation
router.post('/', validate(allocationValidationRules), async (req, res, next) => {
  try {
    const {
      equipment_id,
      allocated_to_name,
      allocated_to_role = 'Faculty',
      department = 'CSE',
      from_date,
      to_date,
      purpose = ''
    } = req.body;

    // Check equipment status
    const eqRes = await db.query('SELECT * FROM equipment WHERE equipment_id = ?', [equipment_id]);
    if (eqRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    const eq = eqRes.rows[0];
    if (eq.status === 'Under Maintenance' || eq.status === 'Damaged') {
      return res.status(400).json({
        success: false,
        message: `Cannot allocate equipment. Current status is '${eq.status}'`
      });
    }

    // Generate allocation code like A005
    const maxRes = await db.query('SELECT MAX(allocation_id) as maxId FROM allocations');
    const nextNum = (maxRes.rows[0]?.maxId || 0) + 1;
    const allocation_code = `A${String(nextNum).padStart(3, '0')}`;

    // Insert allocation
    const insertSql = `
      INSERT INTO allocations (allocation_code, equipment_id, allocated_to_name, allocated_to_role, department, from_date, to_date, purpose, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
    `;
    const result = await db.query(insertSql, [
      allocation_code,
      equipment_id,
      allocated_to_name,
      allocated_to_role,
      department,
      from_date,
      to_date,
      purpose
    ]);

    // Update equipment status to 'In Use'
    await db.query("UPDATE equipment SET status = 'In Use', updated_at = CURRENT_TIMESTAMP WHERE equipment_id = ?", [equipment_id]);

    res.status(201).json({
      success: true,
      message: 'Equipment allocated successfully',
      data: {
        allocation_id: result.insertId || nextNum,
        allocation_code,
        equipment_id,
        allocated_to_name,
        status: 'Active'
      }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/allocations/:id/return - Return allocated equipment
router.put('/:id/return', async (req, res, next) => {
  try {
    const { id } = req.params;
    const allocRes = await db.query('SELECT * FROM allocations WHERE allocation_id = ?', [id]);
    if (allocRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Allocation record not found' });
    }

    const alloc = allocRes.rows[0];
    const today = new Date().toISOString().split('T')[0];

    // Mark allocation completed
    await db.query(
      "UPDATE allocations SET status = 'Completed', returned_date = ? WHERE allocation_id = ?",
      [today, id]
    );

    // Set equipment back to Available if it was In Use
    await db.query(
      "UPDATE equipment SET status = 'Available', updated_at = CURRENT_TIMESTAMP WHERE equipment_id = ? AND status = 'In Use'",
      [alloc.equipment_id]
    );

    res.json({
      success: true,
      message: 'Equipment returned and status updated to Available'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/allocations/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM allocations WHERE allocation_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }
    res.json({ success: true, message: 'Allocation record deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
