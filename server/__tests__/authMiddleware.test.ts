/**
 * authMiddleware.ts のユニットテスト
 * 認証・認可ミドルウェアのテスト
 */

import { Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../authMiddleware';
import { generateToken, JWTPayload } from '../auth';

// Express のモック
const mockRequest = (headers: Record<string, string> = {}, user?: JWTPayload): Partial<Request> => ({
    headers,
    user
});

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext: NextFunction = jest.fn();

describe('Auth Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('authenticate', () => {
        it('有効なトークンで次のミドルウェアを呼ぶ', () => {
            const payload: JWTPayload = { userId: 1, email: 'test@example.com', role: 'user' };
            const token = generateToken(payload);
            const req = mockRequest({ authorization: `Bearer ${token}` }) as Request;
            const res = mockResponse() as Response;

            authenticate(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('トークンなしで401を返す', () => {
            const req = mockRequest({}) as Request;
            const res = mockResponse() as Response;

            authenticate(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('Bearer プレフィックスなしで401を返す', () => {
            const payload: JWTPayload = { userId: 1, email: 'test@example.com', role: 'user' };
            const token = generateToken(payload);
            const req = mockRequest({ authorization: token }) as Request; // 'Bearer ' なし
            const res = mockResponse() as Response;

            authenticate(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('無効なトークンで401を返す', () => {
            const req = mockRequest({ authorization: 'Bearer invalid.token.here' }) as Request;
            const res = mockResponse() as Response;

            authenticate(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('req.user にペイロードを設定する', () => {
            const payload: JWTPayload = { userId: 42, email: 'admin@example.com', role: 'admin' };
            const token = generateToken(payload);
            const req = mockRequest({ authorization: `Bearer ${token}` }) as Request;
            const res = mockResponse() as Response;

            authenticate(req, res, mockNext);

            expect(req.user).toBeDefined();
            expect(req.user!.userId).toBe(42);
            expect(req.user!.email).toBe('admin@example.com');
            expect(req.user!.role).toBe('admin');
        });

        it('Basic認証ではなくBearerトークンを期待する', () => {
            const req = mockRequest({ authorization: 'Basic dXNlcjpwYXNz' }) as Request;
            const res = mockResponse() as Response;

            authenticate(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('requireAdmin', () => {
        it('admin権限で次のミドルウェアを呼ぶ', () => {
            const req = mockRequest({}, { userId: 1, email: 'admin@example.com', role: 'admin' }) as Request;
            const res = mockResponse() as Response;

            requireAdmin(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('user権限で403を返す', () => {
            const req = mockRequest({}, { userId: 2, email: 'user@example.com', role: 'user' }) as Request;
            const res = mockResponse() as Response;

            requireAdmin(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('未認証（req.userなし）で401を返す', () => {
            const req = mockRequest({}) as Request;
            const res = mockResponse() as Response;

            requireAdmin(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('moderator権限で403を返す（adminのみ許可）', () => {
            const req = mockRequest({}, { userId: 3, email: 'mod@example.com', role: 'moderator' }) as Request;
            const res = mockResponse() as Response;

            requireAdmin(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
