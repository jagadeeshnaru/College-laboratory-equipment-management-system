const db = require('../config/database');

async function seedDatabase() {
  console.log('🔄 Initializing database tables and default records...');

  // Create Users Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'Student',
      department TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Laboratories Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS laboratories (
      lab_id INTEGER PRIMARY KEY AUTOINCREMENT,
      lab_name TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      location TEXT NOT NULL,
      capacity INTEGER DEFAULT 30,
      in_charge TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Categories Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS categories (
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Equipment Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS equipment (
      equipment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      lab_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Available',
      purchase_date TEXT,
      warranty TEXT DEFAULT '3 Years',
      model_number TEXT,
      serial_number TEXT,
      description TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
      FOREIGN KEY (lab_id) REFERENCES laboratories(lab_id) ON DELETE CASCADE
    )
  `);

  // Create Allocations Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS allocations (
      allocation_id INTEGER PRIMARY KEY AUTOINCREMENT,
      allocation_code TEXT NOT NULL UNIQUE,
      equipment_id INTEGER NOT NULL,
      allocated_to_name TEXT NOT NULL,
      allocated_to_role TEXT NOT NULL,
      department TEXT NOT NULL,
      from_date TEXT NOT NULL,
      to_date TEXT NOT NULL,
      purpose TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      returned_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id) ON DELETE CASCADE
    )
  `);

  // Create Maintenance Table
  await db.query(`
    CREATE TABLE IF NOT EXISTS maintenance (
      maintenance_id INTEGER PRIMARY KEY AUTOINCREMENT,
      maintenance_code TEXT NOT NULL UNIQUE,
      equipment_id INTEGER NOT NULL,
      issue_description TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Medium',
      reported_by TEXT NOT NULL,
      reported_date TEXT NOT NULL,
      resolved_date TEXT,
      cost REAL DEFAULT 0.00,
      status TEXT NOT NULL DEFAULT 'Under Maintenance',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id) ON DELETE CASCADE
    )
  `);

  // Check if initial categories exist
  const catCheck = await db.query('SELECT COUNT(*) as count FROM categories');
  if (catCheck.rows[0].count === 0) {
    console.log('🌱 Seeding initial categories...');
    const categories = [
      ['Computer', 'Desktop computers, laptops, monitors, workstations and peripherals'],
      ['Networking', 'Routers, switches, patch panels, firewalls, and networking tools'],
      ['Electronics', 'Oscilloscopes, function generators, multimeters, microcontrollers'],
      ['Software', 'Development IDEs, Simulation tool licenses, OS licenses'],
      ['Others', 'Projectors, printers, scanners, UPS, interactive displays']
    ];
    for (const cat of categories) {
      await db.query('INSERT INTO categories (category_name, description) VALUES (?, ?)', cat);
    }
  }

  // Check if laboratories exist
  const labCheck = await db.query('SELECT COUNT(*) as count FROM laboratories');
  if (labCheck.rows[0].count === 0) {
    console.log('🌱 Seeding initial laboratories...');
    const labs = [
      ['CSE Lab', 'Computer Science', 'Block A, 2nd Floor', 45, 'Dr. Ramesh Kumar'],
      ['Networking Lab', 'Information Technology', 'Block B, 1st Floor', 35, 'Mr. Anand Verma'],
      ['ECE Lab', 'Electronics & Comm', 'Block C, Ground Floor', 40, 'Prof. Sunita Rao'],
      ['Admin Lab', 'Administration', 'Main Building, Room 102', 20, 'Mrs. Lakshmi Devi'],
      ['Seminar Hall', 'General', 'Auditorium Complex', 100, 'Dr. V. Prasad']
    ];
    for (const lab of labs) {
      await db.query('INSERT INTO laboratories (lab_name, department, location, capacity, in_charge) VALUES (?, ?, ?, ?, ?)', lab);
    }
  }

  // Check if users exist
  const userCheck = await db.query('SELECT COUNT(*) as count FROM users');
  if (userCheck.rows[0].count === 0) {
    console.log('🌱 Seeding initial users...');
    const users = [
      ['admin', 'admin123', 'Administrator', 'admin@college.edu', 'Admin', 'Computer Science'],
      ['faculty1', 'faculty123', 'Dr. Ramesh Kumar', 'ramesh@college.edu', 'Faculty', 'Computer Science'],
      ['faculty2', 'faculty123', 'Prof. Sunita Rao', 'sunita@college.edu', 'Faculty', 'ECE'],
      ['24691A05J1', 'student123', 'SHAIK IRFAN', '24691A05J1@college.edu', 'Student', 'CSE'],
      ['24691A05J2', 'student123', 'EDAGOTTI JAGADEESH', '24691A05J2@college.edu', 'Student', 'CSE'],
      ['24691A05J3', 'student123', 'NARU JAGADEESH', '24691A05J3@college.edu', 'Student', 'CSE'],
      ['24691A05J4', 'student123', 'BARAKI JAHNAVI', '24691A05J4@college.edu', 'Student', 'CSE'],
      ['24691A05J5', 'student123', 'BATHULA JAHNAVI', '24691A05J5@college.edu', 'Student', 'CSE'],
      ['24691A05J6', 'student123', 'KONDA JAHNAVI', '24691A05J6@college.edu', 'Student', 'CSE'],
      ['24691A05J7', 'student123', 'KOTHAPALLI BHARATH REDDY', '24691A05J7@college.edu', 'Student', 'CSE']
    ];
    for (const u of users) {
      await db.query('INSERT INTO users (username, password, full_name, email, role, department) VALUES (?, ?, ?, ?, ?, ?)', u);
    }
  }

  // Check if equipment exists
  const eqCheck = await db.query('SELECT COUNT(*) as count FROM equipment');
  if (eqCheck.rows[0].count === 0) {
    console.log('🌱 Seeding initial equipment items...');
    const equipmentItems = [
      ['EQ001', 'Dell Desktop', 1, 1, 'Available', '2024-08-12', '3 Years', 'OptiPlex 7090', 'DL-7090-8812', 'Dell OptiPlex Desktop with 8GB RAM, 512GB SSD', 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80'],
      ['EQ002', 'Cisco Switch', 2, 2, 'In Use', '2024-06-15', '5 Years', 'Catalyst 2960X', 'CS-2960-4491', '24-port Gigabit managed network switch for LAN routing and VLAN segmentation', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80'],
      ['EQ003', 'Oscilloscope', 3, 3, 'Under Maintenance', '2023-11-20', '2 Years', 'Keysight DSOX1102G', 'KS-1102-7723', '100 MHz 2-Channel Digital Storage Oscilloscope with waveform generator', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'],
      ['EQ004', 'Printer', 5, 4, 'Available', '2024-01-10', '1 Year', 'HP LaserJet Pro M404dn', 'HP-M404-3310', 'High speed duplex network laser printer for lab documentation', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80'],
      ['EQ005', 'Projector', 5, 5, 'Damaged', '2023-09-05', '2 Years', 'Epson EB-X06 XGA', 'EP-X06-9905', 'Epson 3600 Lumens HDMI presentation ceiling projector in Seminar Hall', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80'],
      ['EQ006', 'Dell Laptop', 1, 1, 'Available', '2024-10-01', '3 Years', 'Latitude 5440', 'DL-5440-6677', 'High performance laptop for student and faculty research projects.', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80'],
      ['EQ007', 'Wi-Fi Access Point', 2, 2, 'Available', '2024-05-18', '3 Years', 'Aruba AP-505', 'AR-505-1204', 'Dual-radio Wi-Fi 6 enterprise access point for networking infrastructure.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80'],
      ['EQ008', 'Function Generator', 3, 3, 'Available', '2023-12-01', '2 Years', 'Rigol DG1022Z', 'RG-1022-8819', '25 MHz Arbitrary Waveform Generator with dual independent output channels.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'],
      ['EQ009', 'MATLAB Campus License', 4, 1, 'In Use', '2024-01-01', 'Annual Subscription', 'MATLAB R2024b', 'LIC-MTLB-2024', 'Concurrent network license with Simulink and DSP toolboxes.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80'],
      ['EQ010', 'Networking Kit', 2, 2, 'In Use', '2024-02-14', '2 Years', 'Cisco Packet Tool', 'CS-PKT-2201', 'Crimping tools, RJ45 testers, punchdown tools and patch cords bundle.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80'],
      ['EQ011', 'Desktop PC', 1, 1, 'Under Maintenance', '2024-02-10', '3 Years', 'Lenovo ThinkCentre M70q', 'LN-M70-1102', 'Mini PC equipped with Core i5 and 16GB RAM for embedded labs.', 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80'],
      ['EQ012', 'Digital Multimeter', 3, 3, 'Available', '2023-08-15', '1 Year', 'Fluke 115', 'FL-115-9920', 'True-RMS digital multimeter with backlight and resistance test probe.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80']
    ];

    for (const item of equipmentItems) {
      await db.query(`
        INSERT INTO equipment (equipment_code, name, category_id, lab_id, status, purchase_date, warranty, model_number, serial_number, description, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, item);
    }
  }

  // Check if allocations exist
  const allocCheck = await db.query('SELECT COUNT(*) as count FROM allocations');
  if (allocCheck.rows[0].count === 0) {
    console.log('🌱 Seeding initial allocations...');
    const allocations = [
      ['A001', 1, 'Student (CSE)', 'Student (CSE)', 'CSE', '2026-09-01', '2026-09-30', 'Final Year Mini Project Development', 'Active', null],
      ['A002', 5, 'Faculty', 'Faculty', 'CSE', '2026-09-10', '2026-09-12', 'Guest Lecture on Cloud Computing', 'Completed', '2026-09-12'],
      ['A003', 10, 'Student (ECE)', 'Student (ECE)', 'ECE', '2026-09-15', '2026-09-25', 'Computer Networks Practical Assignment', 'Active', null],
      ['A004', 6, 'Student (CSE)', 'Student (CSE)', 'CSE', '2026-09-01', '2026-09-15', 'Distributed Systems Lab Evaluation', 'Completed', '2026-09-15']
    ];
    for (const a of allocations) {
      await db.query(`
        INSERT INTO allocations (allocation_code, equipment_id, allocated_to_name, allocated_to_role, department, from_date, to_date, purpose, status, returned_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, a);
    }
  }

  // Check if maintenance records exist
  const maintCheck = await db.query('SELECT COUNT(*) as count FROM maintenance');
  if (maintCheck.rows[0].count === 0) {
    console.log('🌱 Seeding initial maintenance records...');
    const records = [
      ['M001', 3, 'Screen not working', 'High', 'Prof. Sunita Rao', '2026-09-10', null, 1500.0, 'Under Maintenance', 'Sent to Keysight authorized service center.'],
      ['M002', 5, 'Lamp replaced', 'Medium', 'Mr. Anand Verma', '2026-09-05', '2026-09-08', 3200.0, 'Resolved', 'New OEM lamp installed and calibrated.'],
      ['M003', 11, 'No power', 'High', 'Dr. Ramesh Kumar', '2026-09-01', null, 2400.0, 'In Progress', 'Replacement SMPS ordered from vendor.'],
      ['M004', 2, 'Port issue', 'Medium', 'Mr. Anand Verma', '2026-08-28', '2026-08-30', 0.0, 'Resolved', 'Re-crimped RJ45 patch cable.'],
      ['M005', 4, 'Paper jam', 'Low', 'Mrs. Lakshmi Devi', '2026-08-20', '2026-08-22', 450.0, 'Resolved', 'Paper roller cleaned and serviced.']
    ];
    for (const m of records) {
      await db.query(`
        INSERT INTO maintenance (maintenance_code, equipment_id, issue_description, priority, reported_by, reported_date, resolved_date, cost, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, m);
    }
  }

  console.log('✅ Database tables and seed data ready!');
}

module.exports = { seedDatabase };
