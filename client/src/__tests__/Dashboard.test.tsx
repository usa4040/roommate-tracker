import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../components/Dashboard';
import type { User, Balance } from '../types';

describe('Dashboard Component', () => {
    const mockUsers: User[] = [
        { id: 1, name: 'ユーザー1', avatar: 'https://example.com/avatar1.png' },
        { id: 2, name: 'ユーザー2', avatar: 'https://example.com/avatar2.png' }
    ];

    const mockBalance: Balance[] = [
        { user_id: 1, paid: 5000, owed: 0, diff: 2500 },
        { user_id: 2, paid: 2500, owed: 0, diff: 0 }
    ];

    it('収支サマリータイトルが表示される', () => {
        render(<Dashboard users={mockUsers} balance={mockBalance} />);
        expect(screen.getByText('収支サマリー')).toBeInTheDocument();
    });

    it('全ユーザーの収支が表示される', () => {
        render(<Dashboard users={mockUsers} balance={mockBalance} />);

        expect(screen.getByText('ユーザー1')).toBeInTheDocument();
        expect(screen.getByText('ユーザー2')).toBeInTheDocument();
    });

    it('支払額が正しく表示される', () => {
        render(<Dashboard users={mockUsers} balance={mockBalance} />);

        // Check for formatted amounts (with comma separators)
        const amounts5000 = screen.getAllByText(/5,000/);
        expect(amounts5000.length).toBeGreaterThan(0);

        const amounts2500 = screen.getAllByText(/2,500/);
        expect(amounts2500.length).toBeGreaterThan(0);
    });

    it('収支差額が正しく表示される', () => {
        render(<Dashboard users={mockUsers} balance={mockBalance} />);

        // Check for positive balance text
        expect(screen.getByText('受取予定')).toBeInTheDocument();
    });

    it('精算済みステータスが表示される', () => {
        render(<Dashboard users={mockUsers} balance={mockBalance} />);

        expect(screen.getByText('精算済み')).toBeInTheDocument();
    });

    it('アバター画像が表示される', () => {
        const { container } = render(<Dashboard users={mockUsers} balance={mockBalance} />);

        const images = container.querySelectorAll('img');
        expect(images.length).toBeGreaterThan(0);
    });
});
