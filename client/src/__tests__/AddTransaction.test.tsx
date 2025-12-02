import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTransaction from '../components/AddTransaction';
import type { User } from '../types';

describe('AddTransaction Component', () => {
    const mockUsers: User[] = [
        { id: 1, name: 'ユーザー1', avatar: 'https://example.com/avatar1.png' },
        { id: 2, name: 'ユーザー2', avatar: 'https://example.com/avatar2.png' }
    ];

    const mockAddTransaction = vi.fn().mockResolvedValue(true);
    const mockAddPayment = vi.fn().mockResolvedValue(true);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('経費追加タブが表示される', () => {
        render(
            <AddTransaction
                users={mockUsers}
                onAddTransaction={mockAddTransaction}
                onAddPayment={mockAddPayment}
            />
        );

        expect(screen.getByText('経費を追加')).toBeInTheDocument();
    });

    it('返済タブが表示される', () => {
        render(
            <AddTransaction
                users={mockUsers}
                onAddTransaction={mockAddTransaction}
                onAddPayment={mockAddPayment}
            />
        );

        expect(screen.getByText('返済を記録')).toBeInTheDocument();
    });

    it('返済タブに切り替えられる', async () => {
        const user = userEvent.setup();
        render(
            <AddTransaction
                users={mockUsers}
                onAddTransaction={mockAddTransaction}
                onAddPayment={mockAddPayment}
            />
        );

        // Click the payment tab
        const paymentTab = screen.getByText('返済を記録');
        await user.click(paymentTab);

        // Check if payment-specific elements are visible
        expect(screen.getByText('支払った人')).toBeInTheDocument();
        expect(screen.getByText('受け取った人')).toBeInTheDocument();
    });
});
