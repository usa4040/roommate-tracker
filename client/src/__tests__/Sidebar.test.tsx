/**
 * Sidebar コンポーネントのテスト
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// AuthContext のモック
const mockLogout = vi.fn();
const mockUser = {
    id: 1,
    name: 'テストユーザー',
    email: 'test@example.com',
    role: 'admin',
    avatar: 'https://example.com/avatar.png'
};

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        logout: mockLogout
    })
}));

// window.confirm のモック
const mockConfirm = vi.fn(() => true);
global.confirm = mockConfirm;

// ラッパーコンポーネント
const renderWithRouter = (component: React.ReactNode) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('Sidebar Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('サイドバーが表示される', () => {
        renderWithRouter(<Sidebar />);

        expect(screen.getByText('支払い管理')).toBeInTheDocument();
    });

    it('ナビゲーションリンクが表示される', () => {
        renderWithRouter(<Sidebar />);

        expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
        expect(screen.getByText('取引一覧')).toBeInTheDocument();
        expect(screen.getByText('入力')).toBeInTheDocument();
        expect(screen.getByText('メンバー')).toBeInTheDocument();
        expect(screen.getByText('分析')).toBeInTheDocument();
    });

    it('各ナビゲーションリンクが正しいパスを持つ', () => {
        renderWithRouter(<Sidebar />);

        expect(screen.getByText('ダッシュボード').closest('a')).toHaveAttribute('href', '/');
        expect(screen.getByText('取引一覧').closest('a')).toHaveAttribute('href', '/transactions');
        expect(screen.getByText('入力').closest('a')).toHaveAttribute('href', '/add');
        expect(screen.getByText('メンバー').closest('a')).toHaveAttribute('href', '/members');
        expect(screen.getByText('分析').closest('a')).toHaveAttribute('href', '/analytics');
    });

    it('ユーザー情報が表示される', () => {
        renderWithRouter(<Sidebar />);

        expect(screen.getByText('テストユーザー')).toBeInTheDocument();
        expect(screen.getByText('管理者')).toBeInTheDocument(); // admin -> 管理者
    });

    it('ユーザーアバターが表示される', () => {
        renderWithRouter(<Sidebar />);

        const avatar = screen.getByAltText('テストユーザー') as HTMLImageElement;
        expect(avatar).toBeInTheDocument();
        expect(avatar.src).toBe('https://example.com/avatar.png');
    });

    it('ログアウトボタンが表示される', () => {
        renderWithRouter(<Sidebar />);

        expect(screen.getByText('ログアウト')).toBeInTheDocument();
    });

    it('ログアウトボタンをクリックすると確認ダイアログが表示される', async () => {
        const user = userEvent.setup();
        renderWithRouter(<Sidebar />);

        const logoutButton = screen.getByText('ログアウト');
        await user.click(logoutButton);

        expect(mockConfirm).toHaveBeenCalledWith('ログアウトしますか？');
    });

    it('ログアウト確認でログアウトが実行される', async () => {
        const user = userEvent.setup();
        mockConfirm.mockReturnValue(true);
        mockLogout.mockResolvedValue(undefined);

        renderWithRouter(<Sidebar />);

        const logoutButton = screen.getByText('ログアウト');
        await user.click(logoutButton);

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
        });
    });

    it('ログアウトキャンセルでログアウトが実行されない', async () => {
        const user = userEvent.setup();
        mockConfirm.mockReturnValue(false);

        renderWithRouter(<Sidebar />);

        const logoutButton = screen.getByText('ログアウト');
        await user.click(logoutButton);

        expect(mockLogout).not.toHaveBeenCalled();
    });

    it('モバイルトグルボタンが存在する', () => {
        renderWithRouter(<Sidebar />);

        const toggleButton = screen.getByLabelText('Toggle menu');
        expect(toggleButton).toBeInTheDocument();
    });

    it('モバイルトグルボタンをクリックするとサイドバーが開く', async () => {
        const user = userEvent.setup();
        renderWithRouter(<Sidebar />);

        const toggleButton = screen.getByLabelText('Toggle menu');
        const sidebar = document.querySelector('.sidebar');

        // 初期状態ではopenクラスがない
        expect(sidebar).not.toHaveClass('open');

        await user.click(toggleButton);

        // クリック後はopenクラスが付く
        expect(sidebar).toHaveClass('open');
    });

    it('ナビゲーションリンクをクリックするとサイドバーが閉じる', async () => {
        const user = userEvent.setup();
        renderWithRouter(<Sidebar />);

        const toggleButton = screen.getByLabelText('Toggle menu');
        const sidebar = document.querySelector('.sidebar');

        // サイドバーを開く
        await user.click(toggleButton);
        expect(sidebar).toHaveClass('open');

        // ナビゲーションをクリック
        const dashboardLink = screen.getByText('ダッシュボード');
        await user.click(dashboardLink);

        // サイドバーが閉じる
        expect(sidebar).not.toHaveClass('open');
    });
});
