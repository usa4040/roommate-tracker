const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'expenses.db');

const db = new sqlite3.Database(dbPath, (err) => {
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

  db.run(`CREATE TABLE IF NOT EXISTS transaction_splits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY(transaction_id) REFERENCES transactions(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  
  // Seed initial users if empty
  db.get("SELECT count(*) as count FROM users", (err, row) => {
      if (row.count === 0) {
          console.log("Seeding initial users...");
          const stmt = db.prepare("INSERT INTO users (name, avatar) VALUES (?, ?)");
          stmt.run("User A", "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix");
          stmt.run("User B", "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka");
          stmt.finalize();
      }
  });
});

module.exports = db;
