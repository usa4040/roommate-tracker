const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Get all users
app.get('/api/users', (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Create a new user
app.post('/api/users', (req, res) => {
    const { name, avatar } = req.body;
    const sql = 'INSERT INTO users (name, avatar) VALUES (?,?)';
    // Use a default avatar if none provided
    const avatarUrl = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
    const params = [name, avatarUrl];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, name, avatar: avatarUrl },
            "id": this.lastID
        });
    });
});

// Update a user
app.put('/api/users/:id', (req, res) => {
    const { name, avatar } = req.body;
    const sql = 'UPDATE users SET name = COALESCE(?, name), avatar = COALESCE(?, avatar) WHERE id = ?';
    const params = [name, avatar, req.params.id];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: req.params.id, name, avatar },
            "changes": this.changes
        });
    });
});

// Delete a user
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;

    // First delete all transactions for this user
    db.run('DELETE FROM transactions WHERE payer_id = ?', [userId], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        // Then delete the user
        db.run('DELETE FROM users WHERE id = ?', [userId], function (err, result) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({ "message": "deleted", changes: this.changes });
        });
    });
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
    const sql = `
    SELECT t.*, u.name as payer_name 
    FROM transactions t 
    JOIN users u ON t.payer_id = u.id 
    ORDER BY date DESC
  `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Create a new transaction
app.post('/api/transactions', (req, res) => {
    const { payer_id, amount, description, date } = req.body;
    const sql = 'INSERT INTO transactions (payer_id, amount, description, date) VALUES (?,?,?,?)';
    const params = [payer_id, amount, description, date];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        // For MVP, assume 50/50 split between 2 users.
        // We need to fetch all users to know who to split with.
        // Ideally, the frontend sends the split info.
        // For now, let's just save the transaction. The balance calculation will handle the logic.

        res.json({
            "message": "success",
            "data": { id: this.lastID, ...req.body },
            "id": this.lastID
        });
    });
});

// Delete a transaction
app.delete('/api/transactions/:id', (req, res) => {
    const transactionId = req.params.id;

    db.run('DELETE FROM transactions WHERE id = ?', [transactionId], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// Get Balance
// Simple logic: Total paid by A, Total paid by B. 
// If A paid 1000, B owes 500.
// If B paid 0, A owes 0.
// Net: B owes A 500.
app.get('/api/balance', (req, res) => {
    const sql = `
        SELECT payer_id, SUM(amount) as total_paid 
        FROM transactions 
        GROUP BY payer_id
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        // Calculate split (assuming equal split among all users for now)
        // We need total users count.
        db.all("SELECT count(*) as count FROM users", [], (err, userRows) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }

            // Handle both SQLite and PostgreSQL count results
            const userCount = parseInt(userRows[0]?.count || 0);

            if (userCount === 0) {
                res.json({
                    "message": "success",
                    "data": [],
                    "total_spent": 0,
                    "share_per_person": 0
                });
                return;
            }

            const totalSpent = rows.reduce((acc, row) => acc + row.total_paid, 0);
            const sharePerPerson = totalSpent / userCount;

            const balances = {};

            // Initialize all users with 0
            db.all("SELECT id FROM users", [], (err, allUsers) => {
                allUsers.forEach(u => balances[u.id] = 0);

                rows.forEach(row => {
                    balances[row.payer_id] = row.total_paid;
                });

                const netBalances = [];
                for (const [userId, paid] of Object.entries(balances)) {
                    netBalances.push({
                        user_id: parseInt(userId),
                        paid: paid,
                        diff: paid - sharePerPerson // Positive means they are owed money, Negative means they owe money
                    });
                }

                res.json({
                    "message": "success",
                    "data": netBalances,
                    "total_spent": totalSpent,
                    "share_per_person": sharePerPerson
                });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
