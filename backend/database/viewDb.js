const db = require('../config/database');

async function viewDatabase() {
  await db.initDatabase();
  const tableArg = process.argv[2] ? process.argv[2].toLowerCase() : null;

  const tables = [
    { name: 'users', query: 'SELECT user_id, username, full_name, email, role, department FROM users' },
    { name: 'laboratories', query: 'SELECT lab_id, lab_name, department, location, capacity, in_charge FROM laboratories' },
    { name: 'categories', query: 'SELECT category_id, category_name, description FROM categories' },
    { name: 'equipment', query: 'SELECT equipment_id, equipment_code, name, category_id, lab_id, status, model_number, serial_number FROM equipment' },
    { name: 'allocations', query: 'SELECT allocation_id, allocation_code, equipment_id, allocated_to_name, department, from_date, to_date, status FROM allocations' },
    { name: 'maintenance', query: 'SELECT maintenance_id, maintenance_code, equipment_id, issue_description, priority, reported_by, cost, status FROM maintenance' }
  ];

  console.log('\n========================================================================');
  console.log('             📊 COLLEGE LAB EMS - DATABASE VIEWER');
  console.log('========================================================================\n');

  for (const t of tables) {
    if (tableArg && tableArg !== t.name) continue;

    try {
      const res = await db.query(t.query);
      console.log(`📌 TABLE: ${t.name.toUpperCase()} (${res.rows.length} records)`);
      if (res.rows.length > 0) {
        console.table(res.rows);
      } else {
        console.log('  (Empty table)\n');
      }
    } catch (err) {
      console.error(`❌ Error reading table ${t.name}:`, err.message);
    }
  }

  console.log('========================================================================\n');
  process.exit(0);
}

viewDatabase().catch(err => {
  console.error('Database viewer error:', err);
  process.exit(1);
});
