import { describe, it, expect } from 'vitest';
import {
    userInputSchema,
    transactionInputSchema,
    paymentInputSchema
} from '../schemas';

describe('Frontend Validation Schemas', () => {
    describe('userInputSchema', () => {
        it('有効なユーザー入力を受け入れる', () => {
            const validInput = { name: '太郎' };
            expect(() => userInputSchema.parse(validInput)).not.toThrow();
        });

        it('空の名前を拒否する', () => {
            const invalidInput = { name: '' };
            expect(() => userInputSchema.parse(invalidInput)).toThrow();
        });

        it('50文字を超える名前を拒否する', () => {
            const invalidInput = { name: 'a'.repeat(51) };
            expect(() => userInputSchema.parse(invalidInput)).toThrow();
        });
    });

    describe('transactionInputSchema', () => {
        const validTransaction = {
            payer_id: 1,
            amount: 1000,
            description: 'テスト経費',
            date: '2024-01-01'
        };

        it('有効な経費入力を受け入れる', () => {
            expect(() => transactionInputSchema.parse(validTransaction)).not.toThrow();
        });

        it('負の金額を拒否する', () => {
            const invalidInput = { ...validTransaction, amount: -100 };
            expect(() => transactionInputSchema.parse(invalidInput)).toThrow();
        });

        it('ゼロの金額を拒否する', () => {
            const invalidInput = { ...validTransaction, amount: 0 };
            expect(() => transactionInputSchema.parse(invalidInput)).toThrow();
        });
    });

    describe('paymentInputSchema', () => {
        const validPayment = {
            from_user_id: 1,
            to_user_id: 2,
            amount: 1000,
            description: 'テスト返済',
            date: '2024-01-01'
        };

        it('有効な返済入力を受け入れる', () => {
            expect(() => paymentInputSchema.parse(validPayment)).not.toThrow();
        });

        it('同じユーザー間の返済を拒否する', () => {
            const invalidInput = { ...validPayment, from_user_id: 1, to_user_id: 1 };
            expect(() => paymentInputSchema.parse(invalidInput)).toThrow();
        });
    });
});
