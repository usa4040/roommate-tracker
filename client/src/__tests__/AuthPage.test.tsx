/**
 * AuthPage コンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthPage from '../components/AuthPage';

// AuthContext のモック
vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        login: vi.fn(),
        register: vi.fn()
    })
}));

describe('AuthPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('ログインフォームが初期表示される', () => {
        render(<AuthPage />);

        // ログインフォームのタイトルが表示される（h2を検索）
        expect(screen.getByRole('heading', { level: 2, name: 'ログイン' })).toBeInTheDocument();
        expect(screen.getByText('アカウントにログインしてください')).toBeInTheDocument();
    });

    it('登録フォームに切替できる', async () => {
        const user = userEvent.setup();
        render(<AuthPage />);

        // 新規登録リンクをクリック（ボタンとして存在）
        const registerLink = screen.getByRole('button', { name: '新規登録' });
        await user.click(registerLink);

        // 登録フォームが表示される
        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 2, name: '新規登録' })).toBeInTheDocument();
        });
    });

    it('ログインフォームに切替できる', async () => {
        const user = userEvent.setup();
        render(<AuthPage />);

        // まず登録フォームに切り替え
        const registerLink = screen.getByRole('button', { name: '新規登録' });
        await user.click(registerLink);

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 2, name: '新規登録' })).toBeInTheDocument();
        });

        // ログインリンクをクリック
        const loginLink = screen.getByRole('button', { name: 'ログイン' });
        await user.click(loginLink);

        // ログインフォームに戻る
        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 2, name: 'ログイン' })).toBeInTheDocument();
        });
    });

    it('メールアドレス入力欄が表示される', () => {
        render(<AuthPage />);

        expect(screen.getByText('メールアドレス')).toBeInTheDocument();
    });

    it('パスワード入力欄が表示される', () => {
        render(<AuthPage />);

        expect(screen.getByText('パスワード')).toBeInTheDocument();
    });
});
