const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
let mysql = null;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  // mysql2 optional
}

const DB_TYPE = process.env.DB_TYPE || 'sqlite'; // 'mysql' or 'sqlite'
let pool = null;
let sqliteDb = null;

const dbPath = path.join(__dirname, '..', 'database', 'lab_ems.sqlite');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let activeEngine = 'sqlite';

async function initDatabase() {
  if (DB_TYPE === 'mysql' && mysql) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lab_ems_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      // Test connection
      await pool.query('SELECT 1');
      console.log(' Connected to MySQL database:', process.env.DB_NAME || 'lab_ems_db');
      activeEngine = 'mysql';
      return;
    } catch (err) {
      console.warn('⚠️ MySQL connection failed (' + err.message + '). Falling back to SQLite local database.');
    }
  }

  // SQLite Initialization
  activeEngine = 'sqlite';
  return new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Failed to open SQLite database:', err.message);
        reject(err);
      } else {
        console.log(' Connected to SQLite embedded database at:', dbPath);
        // Enable foreign keys
        sqliteDb.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
          if (pragmaErr) console.warn('Could not enable foreign keys:', pragmaErr);
          resolve();
        });
      }
    });
  });
}

// Unified Query Function
async function query(sql, params = []) {
  if (activeEngine === 'mysql' && pool) {
    try {
      const [results] = await pool.query(sql, params);
      return {
        rows: Array.isArray(results) ? results : [],
        insertId: results?.insertId || null,
        affectedRows: results?.affectedRows || 0
      };
    } catch (error) {
      console.error('MySQL Query Error:', error.message, 'SQL:', sql);
      throw error;
    }
  }

  // SQLite execution
  return new Promise((resolve, reject) => {
    if (!sqliteDb) {
      return reject(new Error('SQLite database is not initialized yet.'));
    }

    const trimmedSql = sql.trim();
    const isSelect = /^(SELECT|PRAGMA)/i.test(trimmedSql);
    const isInsert = /^INSERT/i.test(trimmedSql);
    const isUpdateOrDelete = /^(UPDATE|DELETE)/i.test(trimmedSql);

    if (isSelect) {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) {
          console.error('SQLite Select Error:', err.message, 'SQL:', sql);
          return reject(err);
        }
        resolve({ rows: rows || [], insertId: null, affectedRows: 0 });
      });
    } else {
      sqliteDb.run(sql, params, function (err) {
        if (err) {
          console.error('SQLite Exec Error:', err.message, 'SQL:', sql);
          return reject(err);
        }
        resolve({
          rows: [],
          insertId: this.lastID || null,
          affectedRows: this.changes || 0
        });
      });
    }
  });
}

module.exports = {
  initDatabase,
  query,
  getActiveEngine: () => activeEngine
};
