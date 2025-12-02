import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionList from '../components/TransactionList';
import type { Transaction, Payment } from '../types';

describe('TransactionList Component', () => {
    const mockTransactions: Transaction[] = [
        {
            id: 1,
            payer_id: 1,
            payer_name: 'ユーザー1',
            amount: 1000,
            description: 'テスト経費1',
            date: '2024-01-01'
        },
        {
            id: 2,
            payer_id: 2,
            payer_name: 'ユーザー2',
            amount: 2000,
            description: 'テスト経費2',
            date: '2024-01-02'
        }
    ];

    const mockPayments: Payment[] = [
        {
            id: 1,
            from_user_id: 1,
            to_user_id: 2,
            from_user_name: 'ユーザー1',
            to_user_name: 'ユーザー2',
            amount: 500,
            description: 'テスト返済',
            date: '2024-01-03'
        }
    ];

    const mockDeleteTransaction = vi.fn().mockResolvedValue(true);
    const mockDeletePayment = vi.fn().mockResolvedValue(true);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('最近の取引タイトルが表示される', () => {
        render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
            />
        );

        expect(screen.getByText('最近の取引')).toBeInTheDocument();
    });

    it('経費が正しく表示される', () => {
        render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
            />
        );

        expect(screen.getByText('テスト経費1')).toBeInTheDocument();
        expect(screen.getByText('テスト経費2')).toBeInTheDocument();
    });

    it('返済が正しく表示される', () => {
        render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
            />
        );

        expect(screen.getByText('テスト返済')).toBeInTheDocument();
    });

    it('金額が表示される', () => {
        render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
            />
        );

        // Check for formatted amounts
        const amounts1000 = screen.getAllByText(/1,000/);
        expect(amounts1000.length).toBeGreaterThan(0);

        const amounts2000 = screen.getAllByText(/2,000/);
        expect(amounts2000.length).toBeGreaterThan(0);
    });

    it('取引がない場合にメッセージが表示される', () => {
        render(
            <TransactionList
                transactions={[]}
                payments={[]}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
            />
        );

        expect(screen.getByText('まだ取引がありません。')).toBeInTheDocument();
    });

    it('削除ボタンが表示される', () => {
        const { container } = render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
            />
        );

        // Check that delete buttons exist
        const deleteButtons = container.querySelectorAll('button');
        expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('複数の取引が表示される', () => {
        const { container } = render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
            />
        );

        // Check that multiple items are rendered
        const items = container.querySelectorAll('[style*="padding"]');
        expect(items.length).toBeGreaterThan(0);
    });
});
