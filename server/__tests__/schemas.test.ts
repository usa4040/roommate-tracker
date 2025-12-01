import {
    userInputSchema,
    transactionInputSchema,
    paymentInputSchema,
    idParamSchema
} from '../schemas';

describe('Validation Schemas', () => {
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

        it('名前の前後の空白をトリミングする', () => {
            const input = { name: '  太郎  ' };
            const result = userInputSchema.parse(input);
            expect(result.name).toBe('太郎');
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

        it('1000万円を超える金額を拒否する', () => {
            const invalidInput = { ...validTransaction, amount: 10000001 };
            expect(() => transactionInputSchema.parse(invalidInput)).toThrow();
        });

        it('空の内容を拒否する', () => {
            const invalidInput = { ...validTransaction, description: '' };
            expect(() => transactionInputSchema.parse(invalidInput)).toThrow();
        });

        it('200文字を超える内容を拒否する', () => {
            const invalidInput = { ...validTransaction, description: 'a'.repeat(201) };
            expect(() => transactionInputSchema.parse(invalidInput)).toThrow();
        });

        it('無効な日付形式を拒否する', () => {
            const invalidInput = { ...validTransaction, date: '2024/01/01' };
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

        it('内容が空でも受け入れる', () => {
            const input = { ...validPayment, description: '' };
            expect(() => paymentInputSchema.parse(input)).not.toThrow();
        });

        it('内容がundefinedでも受け入れる', () => {
            const { description, ...input } = validPayment;
            expect(() => paymentInputSchema.parse(input)).not.toThrow();
        });
    });

    describe('idParamSchema', () => {
        it('有効な数値IDを受け入れる', () => {
            const validInput = { id: '123' };
            const result = idParamSchema.parse(validInput);
            expect(result.id).toBe(123);
        });

        it('文字列IDを数値に変換する', () => {
            const input = { id: '456' };
            const result = idParamSchema.parse(input);
            expect(typeof result.id).toBe('number');
        });

        it('非数値IDを拒否する', () => {
            const invalidInput = { id: 'abc' };
            expect(() => idParamSchema.parse(invalidInput)).toThrow();
        });
    });
});
