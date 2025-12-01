import { z } from 'zod';

// User schemas
export const userInputSchema = z.object({
    name: z.string()
        .min(1, '名前を入力してください')
        .max(50, '名前は50文字以内で入力してください')
        .trim(),
    avatar: z.string().url('有効なURLを入力してください').optional()
});

export const userUpdateSchema = z.object({
    name: z.string()
        .min(1, '名前を入力してください')
        .max(50, '名前は50文字以内で入力してください')
        .trim()
        .optional(),
    avatar: z.string().url('有効なURLを入力してください').optional()
});

// Transaction schemas
export const transactionInputSchema = z.object({
    payer_id: z.number()
        .int('ユーザーIDは整数である必要があります')
        .positive('有効なユーザーを選択してください'),
    amount: z.number()
        .positive('金額は0より大きい値を入力してください')
        .max(10000000, '金額は1000万円以内で入力してください'),
    description: z.string()
        .min(1, '内容を入力してください')
        .max(200, '内容は200文字以内で入力してください')
        .trim(),
    date: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません (YYYY-MM-DD)')
});

// Payment schemas
export const paymentInputSchema = z.object({
    from_user_id: z.number()
        .int('ユーザーIDは整数である必要があります')
        .positive('有効なユーザーを選択してください'),
    to_user_id: z.number()
        .int('ユーザーIDは整数である必要があります')
        .positive('有効なユーザーを選択してください'),
    amount: z.number()
        .positive('金額は0より大きい値を入力してください')
        .max(10000000, '金額は1000万円以内で入力してください'),
    description: z.string()
        .max(200, '内容は200文字以内で入力してください')
        .trim()
        .optional(),
    date: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません (YYYY-MM-DD)')
}).refine(
    (data) => data.from_user_id !== data.to_user_id,
    {
        message: '同じユーザー間での返済はできません',
        path: ['to_user_id']
    }
);

// ID parameter schema
export const idParamSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, 'IDは数値である必要があります')
        .transform(Number)
});

// Type inference from schemas
export type UserInput = z.infer<typeof userInputSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type TransactionInput = z.infer<typeof transactionInputSchema>;
export type PaymentInput = z.infer<typeof paymentInputSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
