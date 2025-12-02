import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { validateBody, validateParams } from '../middleware';
import {
    userInputSchema,
    transactionInputSchema,
    paymentInputSchema,
    idParamSchema
} from '../schemas';

// Create a test app without Socket.IO and database
const createTestApp = () => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());

    // Mock database
    let users = [
        { id: 1, name: 'テストユーザー1', avatar: 'https://example.com/avatar1.png' },
        { id: 2, name: 'テストユーザー2', avatar: 'https://example.com/avatar2.png' }
    ];
    let transactions: any[] = [];
    let payments: any[] = [];
    let nextUserId = 3;
    let nextTransactionId = 1;
    let nextPaymentId = 1;

    // Users endpoints
    app.get('/api/users', (_req, res) => {
        res.json({ message: 'success', data: users });
    });

    app.post('/api/users', validateBody(userInputSchema), (req, res) => {
        const { name } = req.body;
        const newUser = {
            id: nextUserId++,
            name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        };
        users.push(newUser);
        res.json({ message: 'success', data: newUser, id: newUser.id });
    });

    app.put('/api/users/:id', validateParams(idParamSchema), validateBody(userInputSchema), (req, res) => {
        const userId = parseInt(req.params.id);
        const { name } = req.body;
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        users[userIndex].name = name;
        res.json({ message: 'success', data: users[userIndex], changes: 1 });
    });

    app.delete('/api/users/:id', validateParams(idParamSchema), (req, res) => {
        const userId = parseInt(req.params.id);
        const initialLength = users.length;
        users = users.filter(u => u.id !== userId);
        transactions = transactions.filter(t => t.payer_id !== userId);

        res.json({ message: 'deleted', changes: initialLength - users.length });
    });

    // Transactions endpoints
    app.get('/api/transactions', (_req, res) => {
        const transactionsWithNames = transactions.map(t => ({
            ...t,
            payer_name: users.find(u => u.id === t.payer_id)?.name || 'Unknown'
        }));
        res.json({ message: 'success', data: transactionsWithNames });
    });

    app.post('/api/transactions', validateBody(transactionInputSchema), (req, res) => {
        const newTransaction = {
            id: nextTransactionId++,
            ...req.body
        };
        transactions.push(newTransaction);
        res.json({ message: 'success', data: newTransaction, id: newTransaction.id });
    });

    app.delete('/api/transactions/:id', validateParams(idParamSchema), (req, res) => {
        const transactionId = parseInt(req.params.id);
        const initialLength = transactions.length;
        transactions = transactions.filter(t => t.id !== transactionId);

        res.json({ message: 'deleted', changes: initialLength - transactions.length });
    });

    app.put('/api/transactions/:id', validateParams(idParamSchema), validateBody(transactionInputSchema), (req, res) => {
        const transactionId = parseInt(req.params.id);
        const { payer_id, amount, description, date } = req.body;
        const transactionIndex = transactions.findIndex(t => t.id === transactionId);

        if (transactionIndex === -1) {
            res.status(404).json({ error: 'Transaction not found' });
            return;
        }

        transactions[transactionIndex] = {
            ...transactions[transactionIndex],
            payer_id,
            amount,
            description,
            date
        };

        res.json({
            message: 'success',
            data: transactions[transactionIndex],
            changes: 1
        });
    });

    // Payments endpoints
    app.get('/api/payments', (_req, res) => {
        const paymentsWithNames = payments.map(p => ({
            ...p,
            from_user_name: users.find(u => u.id === p.from_user_id)?.name || 'Unknown',
        }));
        res.json({ message: 'success', data: paymentsWithNames });
    });

    app.post('/api/payments', validateBody(paymentInputSchema), (req, res) => {
        const newPayment = {
            id: nextPaymentId++,
            ...req.body
        };
        payments.push(newPayment);
        res.json({ message: 'success', data: newPayment, id: newPayment.id });
    });

    app.delete('/api/payments/:id', validateParams(idParamSchema), (req, res) => {
        const paymentId = parseInt(req.params.id);
        const initialLength = payments.length;
        payments = payments.filter(p => p.id !== paymentId);

        res.json({ message: 'deleted', changes: initialLength - payments.length });
    });

    app.put('/api/payments/:id', validateParams(idParamSchema), validateBody(paymentInputSchema), (req, res) => {
        const paymentId = parseInt(req.params.id);
        const { from_user_id, to_user_id, amount, description, date } = req.body;
        const paymentIndex = payments.findIndex(p => p.id === paymentId);

        if (paymentIndex === -1) {
            res.status(404).json({ error: 'Payment not found' });
            return;
        }

        payments[paymentIndex] = {
            ...payments[paymentIndex],
            from_user_id,
            to_user_id,
            amount,
            description,
            date
        };

        res.json({
            message: 'success',
            data: payments[paymentIndex],
            changes: 1
        });
    });

    return app;
};

describe('API Integration Tests', () => {
    let app: express.Application;

    beforeEach(() => {
        app = createTestApp();
    });

    describe('GET /api/users', () => {
        it('全ユーザーを取得できる', async () => {
            const response = await request(app).get('/api/users');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0]).toHaveProperty('name');
        });
    });

    describe('POST /api/users', () => {
        it('有効なユーザーを作成できる', async () => {
            const newUser = { name: '新しいユーザー' };
            const response = await request(app)
                .post('/api/users')
                .send(newUser);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.data.name).toBe(newUser.name);
            expect(response.body.data).toHaveProperty('id');
        });

        it('空の名前でユーザー作成を拒否する', async () => {
            const invalidUser = { name: '' };
            const response = await request(app)
                .post('/api/users')
                .send(invalidUser);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('バリデーションエラー');
        });
    });

    describe('PUT /api/users/:id', () => {
        it('ユーザー名を更新できる', async () => {
            const updatedName = { name: '更新されたユーザー' };
            const response = await request(app)
                .put('/api/users/1')
                .send(updatedName);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.data.name).toBe(updatedName.name);
        });

        it('存在しないユーザーの更新で404を返す', async () => {
            const updatedName = { name: '更新されたユーザー' };
            const response = await request(app)
                .put('/api/users/999')
                .send(updatedName);

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('ユーザーを削除できる', async () => {
            const response = await request(app).delete('/api/users/1');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('deleted');
            expect(response.body.changes).toBe(1);
        });
    });

    describe('POST /api/transactions', () => {
        it('有効な経費を作成できる', async () => {
            const newTransaction = {
                payer_id: 1,
                amount: 1000,
                description: 'テスト経費',
                date: '2024-01-01'
            };
            const response = await request(app)
                .post('/api/transactions')
                .send(newTransaction);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.data.amount).toBe(newTransaction.amount);
        });

        it('負の金額で経費作成を拒否する', async () => {
            const invalidTransaction = {
                payer_id: 1,
                amount: -100,
                description: 'テスト経費',
                date: '2024-01-01'
            };
            const response = await request(app)
                .post('/api/transactions')
                .send(invalidTransaction);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('バリデーションエラー');
        });
    });

    describe('POST /api/payments', () => {
        it('有効な返済を作成できる', async () => {
            const newPayment = {
                from_user_id: 1,
                to_user_id: 2,
                amount: 500,
                description: 'テスト返済',
                date: '2024-01-01'
            };
            const response = await request(app)
                .post('/api/payments')
                .send(newPayment);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.data.amount).toBe(newPayment.amount);
        });

        it('同じユーザー間の返済を拒否する', async () => {
            const invalidPayment = {
                from_user_id: 1,
                to_user_id: 1,
                amount: 500,
                description: 'テスト返済',
                date: '2024-01-01'
            };
            const response = await request(app)
                .post('/api/payments')
                .send(invalidPayment);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('バリデーションエラー');
        });
    });

    describe('GET /api/transactions', () => {
        it('全経費を取得できる', async () => {
            // First create a transaction
            await request(app)
                .post('/api/transactions')
                .send({
                    payer_id: 1,
                    amount: 1000,
                    description: 'テスト経費',
                    date: '2024-01-01'
                });

            const response = await request(app).get('/api/transactions');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0]).toHaveProperty('payer_name');
        });
    });

    describe('DELETE /api/transactions/:id', () => {
        it('経費を削除できる', async () => {
            // First create a transaction
            const createResponse = await request(app)
                .post('/api/transactions')
                .send({
                    payer_id: 1,
                    amount: 1000,
                    description: 'テスト経費',
                    date: '2024-01-01'
                });

            const transactionId = createResponse.body.data.id;
            const response = await request(app).delete(`/api/transactions/${transactionId}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('deleted');
        });
    });

    describe('PUT /api/transactions/:id', () => {
        it('経費を更新できる', async () => {
            // First create a transaction
            const createResponse = await request(app)
                .post('/api/transactions')
                .send({
                    payer_id: 1,
                    amount: 1000,
                    description: 'テスト経費',
                    date: '2024-01-01'
                });

            const transactionId = createResponse.body.data.id;
            const updatedData = {
                payer_id: 2,
                amount: 2000,
                description: '更新された経費',
                date: '2024-01-02'
            };

            const response = await request(app)
                .put(`/api/transactions/${transactionId}`)
                .send(updatedData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.data.amount).toBe(updatedData.amount);
            expect(response.body.data.description).toBe(updatedData.description);
            expect(response.body.changes).toBe(1);
        });

        it('存在しない経費の更新で404を返す', async () => {
            const updatedData = {
                payer_id: 1,
                amount: 2000,
                description: '更新された経費',
                date: '2024-01-02'
            };

            const response = await request(app)
                .put('/api/transactions/999')
                .send(updatedData);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Transaction not found');
        });

        it('無効なデータで経費更新を拒否する', async () => {
            // First create a transaction
            const createResponse = await request(app)
                .post('/api/transactions')
                .send({
                    payer_id: 1,
                    amount: 1000,
                    description: 'テスト経費',
                    date: '2024-01-01'
                });

            const transactionId = createResponse.body.data.id;
            const invalidData = {
                payer_id: 1,
                amount: -100, // 負の金額
                description: 'テスト経費',
                date: '2024-01-01'
            };

            const response = await request(app)
                .put(`/api/transactions/${transactionId}`)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('バリデーションエラー');
        });
    });

    describe('PUT /api/payments/:id', () => {
        it('返済を更新できる', async () => {
            // First create a payment
            const createResponse = await request(app)
                .post('/api/payments')
                .send({
                    from_user_id: 1,
                    to_user_id: 2,
                    amount: 500,
                    description: 'テスト返済',
                    date: '2024-01-01'
                });

            const paymentId = createResponse.body.data.id;
            const updatedData = {
                from_user_id: 2,
                to_user_id: 1,
                amount: 1000,
                description: '更新された返済',
                date: '2024-01-02'
            };

            const response = await request(app)
                .put(`/api/payments/${paymentId}`)
                .send(updatedData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.data.amount).toBe(updatedData.amount);
            expect(response.body.data.description).toBe(updatedData.description);
            expect(response.body.changes).toBe(1);
        });

        it('存在しない返済の更新で404を返す', async () => {
            const updatedData = {
                from_user_id: 1,
                to_user_id: 2,
                amount: 1000,
                description: '更新された返済',
                date: '2024-01-02'
            };

            const response = await request(app)
                .put('/api/payments/999')
                .send(updatedData);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Payment not found');
        });

        it('同じユーザー間の返済更新を拒否する', async () => {
            // First create a payment
            const createResponse = await request(app)
                .post('/api/payments')
                .send({
                    from_user_id: 1,
                    to_user_id: 2,
                    amount: 500,
                    description: 'テスト返済',
                    date: '2024-01-01'
                });

            const paymentId = createResponse.body.data.id;
            const invalidData = {
                from_user_id: 1,
                to_user_id: 1, // 同じユーザー
                amount: 1000,
                description: 'テスト返済',
                date: '2024-01-02'
            };

            const response = await request(app)
                .put(`/api/payments/${paymentId}`)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('バリデーションエラー');
        });
    });
});
