/**
 * middleware.ts のユニットテスト
 * Zodバリデーションミドルウェアのテスト
 */

import { Request, Response, NextFunction } from 'express';
import { validateBody, validateParams } from '../middleware';
import { z } from 'zod';

// Express のモック
const mockRequest = (body: any = {}, params: any = {}): Partial<Request> => ({
    body,
    params
});

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext: NextFunction = jest.fn();

// テスト用スキーマ
const testBodySchema = z.object({
    name: z.string().min(1, '名前は必須です').max(50, '名前は50文字以内'),
    email: z.string().email('有効なメールアドレスを入力してください'),
    age: z.number().min(0, '年齢は0以上').optional()
});

const testParamsSchema = z.object({
    id: z.string().regex(/^\d+$/, 'IDは数値である必要があります').transform(Number)
});

describe('Validation Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateBody', () => {
        it('有効なデータで次のミドルウェアを呼ぶ', () => {
            const req = mockRequest({ name: 'テストユーザー', email: 'test@example.com' }) as Request;
            const res = mockResponse() as Response;

            const middleware = validateBody(testBodySchema);
            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('無効なデータで400を返す', () => {
            const req = mockRequest({ name: '', email: 'invalid-email' }) as Request;
            const res = mockResponse() as Response;

            const middleware = validateBody(testBodySchema);
            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('バリデーションエラーの詳細を返す', () => {
            const req = mockRequest({ name: '', email: 'test@example.com' }) as Request;
            const res = mockResponse() as Response;

            const middleware = validateBody(testBodySchema);
            middleware(req, res, mockNext);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'バリデーションエラー',
                    details: expect.arrayContaining([
                        expect.objectContaining({
                            field: 'name'
                        })
                    ])
                })
            );
        });

        it('バリデーション後のデータをreq.bodyに設定', () => {
            const req = mockRequest({ name: '  テストユーザー  ', email: 'test@example.com', extra: 'ignored' }) as Request;
            const res = mockResponse() as Response;

            // トリミングするスキーマ
            const trimSchema = z.object({
                name: z.string().trim(),
                email: z.string().email()
            });

            const middleware = validateBody(trimSchema);
            middleware(req, res, mockNext);

            expect(req.body.name).toBe('テストユーザー'); // トリミングされている
            expect(req.body.extra).toBeUndefined(); // 余分なフィールドは除外
        });

        it('オプショナルフィールドなしでも通過', () => {
            const req = mockRequest({ name: 'テスト', email: 'test@example.com' }) as Request;
            const res = mockResponse() as Response;

            const middleware = validateBody(testBodySchema);
            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('複数のバリデーションエラーを返す', () => {
            const req = mockRequest({ name: '', email: 'invalid' }) as Request;
            const res = mockResponse() as Response;

            const middleware = validateBody(testBodySchema);
            middleware(req, res, mockNext);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    details: expect.arrayContaining([
                        expect.objectContaining({ field: 'name' }),
                        expect.objectContaining({ field: 'email' })
                    ])
                })
            );
        });
    });

    describe('validateParams', () => {
        it('有効なパラメータで次のミドルウェアを呼ぶ', () => {
            const req = mockRequest({}, { id: '123' }) as Request;
            const res = mockResponse() as Response;

            const middleware = validateParams(testParamsSchema);
            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('無効なパラメータで400を返す', () => {
            const req = mockRequest({}, { id: 'abc' }) as Request;
            const res = mockResponse() as Response;

            const middleware = validateParams(testParamsSchema);
            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'バリデーションエラー'
                })
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('数値に変換されたパラメータをreq.paramsに設定', () => {
            const req = mockRequest({}, { id: '456' }) as Request;
            const res = mockResponse() as Response;

            const middleware = validateParams(testParamsSchema);
            middleware(req, res, mockNext);

            // transformでNumberに変換される
            expect(req.params.id).toBe(456);
        });

        it('パラメータが欠落している場合400を返す', () => {
            const req = mockRequest({}, {}) as Request;
            const res = mockResponse() as Response;

            const middleware = validateParams(testParamsSchema);
            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
