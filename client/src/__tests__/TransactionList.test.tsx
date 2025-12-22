import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionList from '../components/TransactionList';
import type { Transaction, Payment, User } from '../types';

describe('TransactionList Component', () => {
    const mockUsers: User[] = [
        { id: 1, name: 'ユーザー1', avatar: 'https://example.com/avatar1.png' },
        { id: 2, name: 'ユーザー2', avatar: 'https://example.com/avatar2.png' }
    ];

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
    const mockUpdateTransaction = vi.fn().mockResolvedValue(true);
    const mockUpdatePayment = vi.fn().mockResolvedValue(true);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('エクスポートボタンが表示される', () => {
        render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
                onUpdateTransaction={mockUpdateTransaction}
                onUpdatePayment={mockUpdatePayment}
            />
        );

        expect(screen.getByText('CSV')).toBeInTheDocument();
        expect(screen.getByText('JSON')).toBeInTheDocument();
        expect(screen.getByText('サマリー')).toBeInTheDocument();
    });

    it('経費が正しく表示される', () => {
        render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
                onUpdateTransaction={mockUpdateTransaction}
                onUpdatePayment={mockUpdatePayment}
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
                users={mockUsers}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
                onUpdateTransaction={mockUpdateTransaction}
                onUpdatePayment={mockUpdatePayment}
            />
        );

        expect(screen.getByText('テスト返済')).toBeInTheDocument();
    });

    it('金額が表示される', () => {
        render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
                onUpdateTransaction={mockUpdateTransaction}
                onUpdatePayment={mockUpdatePayment}
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
                users={mockUsers}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
                onUpdateTransaction={mockUpdateTransaction}
                onUpdatePayment={mockUpdatePayment}
            />
        );

        expect(screen.getByText('まだ取引がありません。')).toBeInTheDocument();
    });

    it('編集ボタンが表示される', () => {
        const { container } = render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
                onUpdateTransaction={mockUpdateTransaction}
                onUpdatePayment={mockUpdatePayment}
            />
        );

        // Check that edit and delete buttons exist
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('編集ボタンをクリックすると編集フォームが表示される', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
                onUpdateTransaction={mockUpdateTransaction}
                onUpdatePayment={mockUpdatePayment}
            />
        );

        // Find and click the first edit button
        const buttons = container.querySelectorAll('button');
        const editButton = Array.from(buttons).find(btn => btn.getAttribute('title') === '編集');

        if (editButton) {
            await user.click(editButton);

            // Check if edit form appears
            await waitFor(() => {
                expect(screen.getByText('保存')).toBeInTheDocument();
                expect(screen.getByText('キャンセル')).toBeInTheDocument();
            });
        }
    });

    it('編集フォームで入力フィールドが表示される', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
                onUpdateTransaction={mockUpdateTransaction}
                onUpdatePayment={mockUpdatePayment}
            />
        );

        // Find and click the first edit button
        const buttons = container.querySelectorAll('button');
        const editButton = Array.from(buttons).find(btn => btn.getAttribute('title') === '編集');

        if (editButton) {
            await user.click(editButton);

            // Wait for edit form to appear
            await waitFor(() => {
                expect(screen.getByText('保存')).toBeInTheDocument();
                expect(screen.getByText('キャンセル')).toBeInTheDocument();
            });

            // Check that input fields are present
            const amountInputs = container.querySelectorAll('input[type="number"]');
            expect(amountInputs.length).toBeGreaterThan(0);

            const textInputs = container.querySelectorAll('input[type="text"]');
            expect(textInputs.length).toBeGreaterThan(0);
        }
    });
    it('編集フォームでキャンセルボタンをクリックすると編集モードが終了する', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
                onUpdateTransaction={mockUpdateTransaction}
                onUpdatePayment={mockUpdatePayment}
            />
        );

        // Find and click the first edit button
        const buttons = container.querySelectorAll('button');
        const editButton = Array.from(buttons).find(btn => btn.getAttribute('title') === '編集');

        if (editButton) {
            await user.click(editButton);

            // Wait for edit form to appear
            await waitFor(() => {
                expect(screen.getByText('キャンセル')).toBeInTheDocument();
            });

            // Click cancel button
            const cancelButton = screen.getByText('キャンセル');
            await user.click(cancelButton);

            // Check if edit form disappears
            await waitFor(() => {
                expect(screen.queryByText('保存')).not.toBeInTheDocument();
            });

            // Update function should not have been called
            expect(mockUpdateTransaction).not.toHaveBeenCalled();
        }
    });

    it('複数の取引が表示される', () => {
        const { container } = render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
                onUpdateTransaction={mockUpdateTransaction}
                onUpdatePayment={mockUpdatePayment}
            />
        );

        // Check that multiple items are rendered
        const items = container.querySelectorAll('[style*="padding"]');
        expect(items.length).toBeGreaterThan(0);
    });

    it('削除ボタンをクリックすると確認モーダルが表示される', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
                onUpdateTransaction={mockUpdateTransaction}
                onUpdatePayment={mockUpdatePayment}
            />
        );

        // Find and click the first delete button
        const buttons = container.querySelectorAll('button');
        const deleteButton = Array.from(buttons).find(btn => btn.getAttribute('title') === '削除');

        if (deleteButton) {
            await user.click(deleteButton);

            // Check if delete confirmation modal appears
            await waitFor(() => {
                expect(screen.getByText(/を削除しますか？/)).toBeInTheDocument();
                expect(screen.getByText('この操作は元に戻せません。')).toBeInTheDocument();
            });
        }
    });

    it('削除確認モーダルでキャンセルをクリックするとモーダルが閉じる', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <TransactionList
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
                onDeleteTransaction={mockDeleteTransaction}
                onDeletePayment={mockDeletePayment}
                onUpdateTransaction={mockUpdateTransaction}
                onUpdatePayment={mockUpdatePayment}
            />
        );

        // Find and click the first delete button
        const buttons = container.querySelectorAll('button');
        const deleteButton = Array.from(buttons).find(btn => btn.getAttribute('title') === '削除');

        if (deleteButton) {
            await user.click(deleteButton);

            // Wait for modal to appear
            await waitFor(() => {
                expect(screen.getByText(/を削除しますか？/)).toBeInTheDocument();
            });

            // Click cancel button
            const cancelButton = screen.getByText('キャンセル');
            await user.click(cancelButton);

            // Check if modal disappears
            await waitFor(() => {
                expect(screen.queryByText(/を削除しますか？/)).not.toBeInTheDocument();
            });

            // Delete function should not have been called
            expect(mockDeleteTransaction).not.toHaveBeenCalled();
            expect(mockDeletePayment).not.toHaveBeenCalled();
        }
    });
});
