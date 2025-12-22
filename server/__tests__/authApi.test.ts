/**
 * 認証API エンドポイントのテスト
 * /api/auth/* のテスト
 */

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { hashPassword, comparePassword, generateToken } from '../auth';
import { authenticate } from '../authMiddleware';

// モックユーザーデータ
interface MockUser {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: string;
    avatar: string;
}

// モックデータを使用したテスト用アプリ
const createAuthTestApp = () => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(cookieParser());

    // モックデータベース
    let users: MockUser[] = [];
    let nextUserId = 1;

    // Helper: モックでユーザーを事前登録
    const seedUser = async (name: string, email: string, password: string, role: string = 'user') => {
        const password_hash = await hashPassword(password);
        const user: MockUser = {
            id: nextUserId++,
            name,
            email,
            password_hash,
            role,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        };
        users.push(user);
        return user;
    };

    // テスト前にシードデータを追加するためのエンドポイント
    app.post('/test/seed', async (req, res) => {
        const { name, email, password, role } = req.body;
        const user = await seedUser(name, email, password, role);
        res.json({ user });
    });

    // テストリセット
    app.post('/test/reset', (_req, res) => {
        users = [];
        nextUserId = 1;
        res.json({ message: 'reset' });
    });

    // Login
    app.post('/api/auth/login', async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const user = users.find(u => u.email === email);
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isValid = await comparePassword(password, user.password_hash);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        res.json({
            message: 'success',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    });

    // Register
    app.post('/api/auth/register', async (req, res) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ error: 'Name, email, and password are required' });
            return;
        }

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }

        const password_hash = await hashPassword(password);
        const newUser: MockUser = {
            id: nextUserId++,
            name,
            email,
            password_hash,
            role: 'user',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        };
        users.push(newUser);

        const token = generateToken({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role
        });

        res.json({
            message: 'success',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                avatar: newUser.avatar
            }
        });
    });

    // Get current user
    app.get('/api/auth/me', authenticate, (req, res) => {
        const user = users.find(u => u.id === req.user!.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            message: 'success',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    });

    // Logout
    app.post('/api/auth/logout', authenticate, (_req, res) => {
        // JWTベースなので、サーバー側では特に何もしない
        res.json({ message: 'Logged out successfully' });
    });

    return app;
};

describe('Auth API Integration Tests', () => {
    let app: express.Application;

    beforeEach(async () => {
        app = createAuthTestApp();
        // リセット
        await request(app).post('/test/reset');
    });

    describe('POST /api/auth/register', () => {
        it('新規ユーザーを登録できる', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: '新規ユーザー',
                    email: 'newuser@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.token).toBeDefined();
            expect(response.body.user).toBeDefined();
            expect(response.body.user.name).toBe('新規ユーザー');
            expect(response.body.user.email).toBe('newuser@example.com');
            expect(response.body.user.role).toBe('user');
        });

        it('名前が欠落で400を返す', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'newuser@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Name, email, and password are required');
        });

        it('メールが欠落で400を返す', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: '新規ユーザー',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
        });

        it('パスワードが欠落で400を返す', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: '新規ユーザー',
                    email: 'newuser@example.com'
                });

            expect(response.status).toBe(400);
        });

        it('既存メールで400を返す', async () => {
            // 最初のユーザーを登録
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'ユーザー1',
                    email: 'duplicate@example.com',
                    password: 'password123'
                });

            // 同じメールで再登録
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'ユーザー2',
                    email: 'duplicate@example.com',
                    password: 'password456'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Email already registered');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // テスト用ユーザーをシード
            await request(app)
                .post('/test/seed')
                .send({
                    name: 'テストユーザー',
                    email: 'test@example.com',
                    password: 'correctpassword',
                    role: 'user'
                });
        });

        it('有効な認証情報でログインできる', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'correctpassword'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.token).toBeDefined();
            expect(response.body.user.email).toBe('test@example.com');
        });

        it('間違ったパスワードで401を返す', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid credentials');
        });

        it('存在しないユーザーで401を返す', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'somepassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid credentials');
        });

        it('メールとパスワードなしで400を返す', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Email and password are required');
        });
    });

    describe('GET /api/auth/me', () => {
        let authToken: string;

        beforeEach(async () => {
            // テスト用ユーザーをシードしてトークン取得
            await request(app)
                .post('/test/seed')
                .send({
                    name: 'テストユーザー',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'admin'
                });

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            authToken = loginResponse.body.token;
        });

        it('認証済みユーザー情報を取得できる', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.user.email).toBe('test@example.com');
            expect(response.body.user.role).toBe('admin');
        });

        it('未認証で401を返す', async () => {
            const response = await request(app)
                .get('/api/auth/me');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('No token provided');
        });

        it('無効なトークンで401を返す', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid.token.here');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid or expired token');
        });
    });

    describe('POST /api/auth/logout', () => {
        let authToken: string;

        beforeEach(async () => {
            await request(app)
                .post('/test/seed')
                .send({
                    name: 'テストユーザー',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'user'
                });

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            authToken = loginResponse.body.token;
        });

        it('ログアウトできる', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Logged out successfully');
        });

        it('未認証でログアウトは401を返す', async () => {
            const response = await request(app)
                .post('/api/auth/logout');

            expect(response.status).toBe(401);
        });
    });
});
