const { Pool } = require('pg');

// Use PostgreSQL in production, SQLite in development
const isProduction = process.env.NODE_ENV === 'production';

let db;

if (isProduction) {
  // PostgreSQL for production
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  // Initialize tables
  const initDB = async () => {
    try {
      await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    avatar TEXT
                )
            `);

      await pool.query(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id SERIAL PRIMARY KEY,
                    payer_id INTEGER NOT NULL,
                    amount REAL NOT NULL,
                    description TEXT NOT NULL,
                    date TEXT NOT NULL,
                    FOREIGN KEY(payer_id) REFERENCES users(id)
                )
            `);

      // Check if users table is empty and seed if needed
      const result = await pool.query('SELECT COUNT(*) as count FROM users');
      if (parseInt(result.rows[0].count) === 0) {
        console.log('Seeding initial users...');
        await pool.query(
          'INSERT INTO users (name, avatar) VALUES ($1, $2), ($3, $4)',
          [
            'User A', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            'User B', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka'
          ]
        );
      }

      console.log('Connected to PostgreSQL database.');
    } catch (err) {
      console.error('Error initializing database:', err);
    }
  };

  initDB();

  // Wrapper to make PostgreSQL work like SQLite
  db = {
    all: (sql, params, callback) => {
      // Convert ? to $1, $2, etc.
      let paramIndex = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

      pool.query(pgSql, params)
        .then(result => callback(null, result.rows))
        .catch(err => callback(err));
    },
    get: (sql, params, callback) => {
      // Convert ? to $1, $2, etc.
      let paramIndex = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

      pool.query(pgSql, params)
        .then(result => callback(null, result.rows[0]))
        .catch(err => callback(err));
    },
    run: function (sql, params, callback) {
      // Convert ? to $1, $2, etc.
      let paramIndex = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

      // For INSERT queries, add RETURNING id
      let finalSql = pgSql;
      if (pgSql.trim().toUpperCase().startsWith('INSERT')) {
        finalSql = pgSql + ' RETURNING id';
      }

      pool.query(finalSql, params)
        .then(result => {
          if (callback) {
            const lastID = result.rows[0]?.id || null;
            callback.call({
              lastID: lastID,
              changes: result.rowCount
            }, null, result);
          }
        })
        .catch(err => {
          if (callback) callback(err);
        });
    }
  };

} else {
  // SQLite for development
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const dbPath = path.resolve(__dirname, 'expenses.db');

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
      console.log('Connected to the SQLite database.');
    }
  });

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            avatar TEXT
        )`);

    db.run(`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payer_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            description TEXT NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY(payer_id) REFERENCES users(id)
        )`);

    // Seed initial users if empty
    db.get("SELECT count(*) as count FROM users", (err, row) => {
      if (row && row.count === 0) {
        console.log("Seeding initial users...");
        const stmt = db.prepare("INSERT INTO users (name, avatar) VALUES (?, ?)");
        stmt.run("User A", "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix");
        stmt.run("User B", "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka");
        stmt.finalize();
      }
    });
  });
}

module.exports = db;
