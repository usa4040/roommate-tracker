import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import db from './db';
import { validateBody, validateParams } from './middleware';
import {
    userInputSchema,
    userUpdateSchema,
    transactionInputSchema,
    paymentInputSchema,
    idParamSchema
} from './schemas';
import type {
    User,
    UserInput,
    Transaction,
    TransactionInput,
    Payment,
    PaymentInput,
    Balance,
    ApiResponse,
    ApiError,
    UserRow,
    BalanceRow
} from './types';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
    origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
};

// Socket.IO setup with CORS
const io = new SocketIOServer(server, {
    cors: corsOptions
});

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Get all users
app.get('/api/users', (_req: Request, res: Response) => {
    db.all("SELECT * FROM users", [], (err, rows?: UserRow[]) => {
        if (err) {
            res.status(400).json({ error: err.message } as ApiError);
            return;
        }
        res.json({
            message: "success",
            data: rows || []
        } as ApiResponse<UserRow[]>);
    });
});

// Create a new user
app.post('/api/users', validateBody(userInputSchema), (req: Request, res: Response) => {
    const { name, avatar } = req.body as Partial<UserInput & { avatar?: string }>;
    const sql = 'INSERT INTO users (name, avatar) VALUES (?,?)';
    // Use a default avatar if none provided
    const avatarUrl = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
    const params = [name, avatarUrl];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message } as ApiError);
            return;
        }
        res.json({
            message: "success",
            data: { id: this.lastID, name, avatar: avatarUrl },
            id: this.lastID
        } as ApiResponse<User> & { id: number });
    });
});

// Update a user
app.put('/api/users/:id', validateParams(idParamSchema), validateBody(userUpdateSchema), (req: Request, res: Response) => {
    const { name, avatar } = req.body as Partial<UserInput & { avatar?: string }>;
    const sql = 'UPDATE users SET name = COALESCE(?, name), avatar = COALESCE(?, avatar) WHERE id = ?';
    const params = [name, avatar, req.params.id];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message } as ApiError);
            return;
        }
        res.json({
            message: "success",
            data: { id: parseInt(req.params.id), name, avatar },
            changes: this.changes
        } as ApiResponse<Partial<User>> & { changes: number });
    });
});

// Delete a user
app.delete('/api/users/:id', validateParams(idParamSchema), (req: Request, res: Response) => {
    const userId = req.params.id;

    // First delete all transactions for this user
    db.run('DELETE FROM transactions WHERE payer_id = ?', [userId], function (err) {
        if (err) {
            res.status(400).json({ error: err.message } as ApiError);
            return;
        }

        // Then delete the user
        db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
            if (err) {
                res.status(400).json({ error: err.message } as ApiError);
                return;
            }
            res.json({ message: "deleted", changes: this.changes });
        });
    });
});

// Get all transactions
app.get('/api/transactions', (_req: Request, res: Response) => {
    const sql = `
    SELECT t.*, u.name as payer_name 
    FROM transactions t 
    JOIN users u ON t.payer_id = u.id 
    ORDER BY date DESC
  `;
    db.all(sql, [], (err, rows?: Transaction[]) => {
        if (err) {
            res.status(400).json({ error: err.message } as ApiError);
            return;
        }
        res.json({
            message: "success",
            data: rows || []
        } as ApiResponse<Transaction[]>);
    });
});

// Create a new transaction
app.post('/api/transactions', validateBody(transactionInputSchema), (req: Request, res: Response) => {
    const { payer_id, amount, description, date } = req.body as TransactionInput;
    const sql = 'INSERT INTO transactions (payer_id, amount, description, date) VALUES (?,?,?,?)';
    const params = [payer_id, amount, description, date];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message } as ApiError);
            return;
        }

        const newTransaction: Partial<Transaction> = {
            id: this.lastID,
            ...req.body
        };

        res.json({
            message: "success",
            data: newTransaction,
            id: this.lastID
        } as ApiResponse<Partial<Transaction>> & { id: number });

        // Notify all clients about the data update
        io.emit('data-updated', { type: 'transaction-added', data: newTransaction });
    });
});

// Delete a transaction
app.delete('/api/transactions/:id', validateParams(idParamSchema), (req: Request, res: Response) => {
    const transactionId = req.params.id;

    db.run('DELETE FROM transactions WHERE id = ?', [transactionId], function (err) {
        if (err) {
            res.status(400).json({ error: err.message } as ApiError);
            return;
        }
        res.json({ message: "deleted", changes: this.changes });

        // Notify all clients about the data update
        io.emit('data-updated', { type: 'transaction-deleted', id: transactionId });
    });
});

// Get all payments
app.get('/api/payments', (_req: Request, res: Response) => {
    const sql = `
        SELECT p.*, 
               u1.name as from_user_name,
               u2.name as to_user_name
        FROM payments p
        JOIN users u1 ON p.from_user_id = u1.id
        JOIN users u2 ON p.to_user_id = u2.id
        ORDER BY date DESC
    `;
    db.all(sql, [], (err, rows?: Payment[]) => {
        if (err) {
            res.status(400).json({ error: err.message } as ApiError);
            return;
        }
        res.json({
            message: "success",
            data: rows || []
        } as ApiResponse<Payment[]>);
    });
});

// Create a new payment
app.post('/api/payments', validateBody(paymentInputSchema), (req: Request, res: Response) => {
    const { from_user_id, to_user_id, amount, description, date } = req.body as PaymentInput;
    const sql = 'INSERT INTO payments (from_user_id, to_user_id, amount, description, date) VALUES (?,?,?,?,?)';
    const params = [from_user_id, to_user_id, amount, description || '', date];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message } as ApiError);
            return;
        }

        const newPayment: Partial<Payment> = {
            id: this.lastID,
            ...req.body
        };

        res.json({
            message: "success",
            data: newPayment,
            id: this.lastID
        } as ApiResponse<Partial<Payment>> & { id: number });

        // Notify all clients about the data update
        io.emit('data-updated', { type: 'payment-added', data: newPayment });
    });
});

// Delete a payment
app.delete('/api/payments/:id', validateParams(idParamSchema), (req: Request, res: Response) => {
    const paymentId = req.params.id;

    db.run('DELETE FROM payments WHERE id = ?', [paymentId], function (err) {
        if (err) {
            res.status(400).json({ error: err.message } as ApiError);
            return;
        }
        res.json({ message: "deleted", changes: this.changes });

        // Notify all clients about the data update
        io.emit('data-updated', { type: 'payment-deleted', id: paymentId });
    });
});

// Get Balance
// Calculate balance considering both transactions and payments
app.get('/api/balance', (_req: Request, res: Response) => {
    const sql = `
        SELECT payer_id, SUM(amount) as total_paid 
        FROM transactions 
        GROUP BY payer_id
    `;

    db.all(sql, [], (err, rows?: BalanceRow[]) => {
        if (err) {
            res.status(400).json({ error: err.message } as ApiError);
            return;
        }
        const balanceRows = rows || [];

        // Get all payments
        const paymentsSql = `
            SELECT from_user_id, to_user_id, SUM(amount) as total_amount
            FROM payments
            GROUP BY from_user_id, to_user_id
        `;

        db.all(paymentsSql, [], (err, paymentRows?: Array<{ from_user_id: number; to_user_id: number; total_amount: number }>) => {
            if (err) {
                res.status(400).json({ error: err.message } as ApiError);
                return;
            }
            const payments = paymentRows || [];

            // Calculate split (assuming equal split among all users for now)
            db.all("SELECT count(*) as count FROM users", [], (err, userRows?: Array<{ count: number }>) => {
                if (err) {
                    res.status(400).json({ error: err.message } as ApiError);
                    return;
                }
                const userCountRows = userRows || [];

                // Handle both SQLite and PostgreSQL count results
                const userCount = parseInt(String(userCountRows[0]?.count || 0));

                if (userCount === 0) {
                    res.json({
                        message: "success",
                        data: [],
                        total_spent: 0,
                        share_per_person: 0
                    });
                    return;
                }

                const totalSpent = balanceRows.reduce((acc, row) => acc + row.total_paid, 0);
                const sharePerPerson = totalSpent / userCount;

                const balances: Record<number, number> = {};

                // Initialize all users with 0
                db.all("SELECT id FROM users", [], (_err, allUsers?: Array<{ id: number }>) => {
                    const users = allUsers || [];
                    users.forEach(u => balances[u.id] = 0);

                    // Add transaction amounts
                    balanceRows.forEach(row => {
                        balances[row.user_id] = row.total_paid;
                    });

                    // Adjust for payments
                    payments.forEach(payment => {
                        const fromId = payment.from_user_id;
                        const toId = payment.to_user_id;
                        const amount = payment.total_amount;

                        // The person who paid (from) has returned money, reducing their debt
                        balances[fromId] = (balances[fromId] || 0) + amount;
                        // The person who received (to) has been paid back, reducing what they're owed
                        balances[toId] = (balances[toId] || 0) - amount;
                    });

                    const netBalances: Balance[] = [];
                    for (const [userId, paid] of Object.entries(balances)) {
                        netBalances.push({
                            user_id: parseInt(userId),
                            paid: paid,
                            owed: 0, // Not used in current implementation
                            diff: paid - sharePerPerson // Positive means they are owed money, Negative means they owe money
                        });
                    }

                    res.json({
                        message: "success",
                        data: netBalances,
                        total_spent: totalSpent,
                        share_per_person: sharePerPerson
                    });
                });
            });
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
