import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Zodスキーマを使用してリクエストボディをバリデーションするミドルウェア
 */
export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                res.status(400).json({
                    error: 'バリデーションエラー',
                    details: errorMessages
                });
                return;
            }
            res.status(500).json({ error: '予期しないエラーが発生しました' });
        }
    };
};

/**
 * Zodスキーマを使用してリクエストパラメータをバリデーションするミドルウェア
 */
export const validateParams = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const validated = schema.parse(req.params);
            // Override params with validated data
            Object.assign(req.params, validated);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                res.status(400).json({
                    error: 'バリデーションエラー',
                    details: errorMessages
                });
                return;
            }
            res.status(500).json({ error: '予期しないエラーが発生しました' });
        }
    };
};
