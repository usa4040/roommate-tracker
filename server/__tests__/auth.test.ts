/**
 * auth.ts のユニットテスト
 * パスワードハッシュとJWT生成・検証のテスト
 */

import { hashPassword, comparePassword, generateToken, verifyToken, JWTPayload } from '../auth';

describe('Auth Utilities', () => {
    describe('hashPassword', () => {
        it('パスワードをハッシュできる', async () => {
            const password = 'testpassword123';
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(typeof hash).toBe('string');
            expect(hash).not.toBe(password);
            expect(hash.startsWith('$2b$')).toBe(true); // bcrypt prefix
        });

        it('同じパスワードでも異なるハッシュを生成', async () => {
            const password = 'testpassword123';
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);

            expect(hash1).not.toBe(hash2); // ソルトが異なるため
        });

        it('空のパスワードもハッシュできる', async () => {
            const password = '';
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash.startsWith('$2b$')).toBe(true);
        });
    });

    describe('comparePassword', () => {
        it('正しいパスワードでtrueを返す', async () => {
            const password = 'correctpassword';
            const hash = await hashPassword(password);

            const result = await comparePassword(password, hash);
            expect(result).toBe(true);
        });

        it('間違ったパスワードでfalseを返す', async () => {
            const password = 'correctpassword';
            const wrongPassword = 'wrongpassword';
            const hash = await hashPassword(password);

            const result = await comparePassword(wrongPassword, hash);
            expect(result).toBe(false);
        });

        it('大文字小文字の違いでfalseを返す', async () => {
            const password = 'TestPassword';
            const hash = await hashPassword(password);

            const result = await comparePassword('testpassword', hash);
            expect(result).toBe(false);
        });
    });

    describe('generateToken', () => {
        const testPayload: JWTPayload = {
            userId: 1,
            email: 'test@example.com',
            role: 'user'
        };

        it('有効なJWTを生成できる', () => {
            const token = generateToken(testPayload);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            // JWT format: header.payload.signature
            expect(token.split('.').length).toBe(3);
        });

        it('ペイロードを正しく含む', () => {
            const token = generateToken(testPayload);
            const decoded = verifyToken(token);

            expect(decoded).not.toBeNull();
            expect(decoded!.userId).toBe(testPayload.userId);
            expect(decoded!.email).toBe(testPayload.email);
            expect(decoded!.role).toBe(testPayload.role);
        });

        it('異なるペイロードで異なるトークンを生成', () => {
            const payload1: JWTPayload = { userId: 1, email: 'user1@example.com', role: 'user' };
            const payload2: JWTPayload = { userId: 2, email: 'user2@example.com', role: 'admin' };

            const token1 = generateToken(payload1);
            const token2 = generateToken(payload2);

            expect(token1).not.toBe(token2);
        });
    });

    describe('verifyToken', () => {
        const testPayload: JWTPayload = {
            userId: 1,
            email: 'test@example.com',
            role: 'admin'
        };

        it('有効なトークンを検証できる', () => {
            const token = generateToken(testPayload);
            const decoded = verifyToken(token);

            expect(decoded).not.toBeNull();
            expect(decoded!.userId).toBe(testPayload.userId);
            expect(decoded!.email).toBe(testPayload.email);
            expect(decoded!.role).toBe(testPayload.role);
        });

        it('無効なトークンでnullを返す', () => {
            const invalidToken = 'invalid.token.here';
            const result = verifyToken(invalidToken);

            expect(result).toBeNull();
        });

        it('改ざんされたトークンでnullを返す', () => {
            const token = generateToken(testPayload);
            // トークンの一部を改ざん
            const tamperedToken = token.slice(0, -5) + 'xxxxx';
            const result = verifyToken(tamperedToken);

            expect(result).toBeNull();
        });

        it('空のトークンでnullを返す', () => {
            const result = verifyToken('');
            expect(result).toBeNull();
        });

        it('JWTにexp（有効期限）が含まれる', () => {
            const token = generateToken(testPayload);
            const decoded = verifyToken(token);

            expect(decoded).not.toBeNull();
            // jwt.signで付与されるexpフィールド
            expect((decoded as any).exp).toBeDefined();
        });
    });
});
