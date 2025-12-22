/**
 * LoginForm コンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/LoginForm';

// AuthContext のモック
const mockLogin = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin
    })
}));

describe('LoginForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('ログインフォームが表示される', () => {
        const onSwitchToRegister = vi.fn();
        render(<LoginForm onSwitchToRegister={onSwitchToRegister} />);

        // h2タグのログインタイトルを確認
        expect(screen.getByRole('heading', { level: 2, name: 'ログイン' })).toBeInTheDocument();
        expect(screen.getByText('アカウントにログインしてください')).toBeInTheDocument();
    });

    it('メール・パスワード入力フィールドが表示される', () => {
        const onSwitchToRegister = vi.fn();
        render(<LoginForm onSwitchToRegister={onSwitchToRegister} />);

        expect(screen.getByPlaceholderText('admin@example.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('有効な入力でログインを試行する', async () => {
        const user = userEvent.setup();
        const onSwitchToRegister = vi.fn();
        mockLogin.mockResolvedValue(undefined);

        render(<LoginForm onSwitchToRegister={onSwitchToRegister} />);

        const emailInput = screen.getByPlaceholderText('admin@example.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitButton = screen.getByRole('button', { name: 'ログイン' });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123'
            });
        });
    });

    it('ログインエラーを表示する', async () => {
        const user = userEvent.setup();
        const onSwitchToRegister = vi.fn();
        mockLogin.mockRejectedValue(new Error('Invalid credentials'));

        render(<LoginForm onSwitchToRegister={onSwitchToRegister} />);

        const emailInput = screen.getByPlaceholderText('admin@example.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitButton = screen.getByRole('button', { name: 'ログイン' });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'wrongpassword');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    it('ログイン中はボタンテキストが変わる', async () => {
        const user = userEvent.setup();
        const onSwitchToRegister = vi.fn();
        // 永遠にpendingのPromise
        mockLogin.mockImplementation(() => new Promise(() => { }));

        render(<LoginForm onSwitchToRegister={onSwitchToRegister} />);

        const emailInput = screen.getByPlaceholderText('admin@example.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitButton = screen.getByRole('button', { name: 'ログイン' });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'ログイン中...' })).toBeInTheDocument();
        });
    });

    it('新規登録リンクをクリックできる', async () => {
        const user = userEvent.setup();
        const onSwitchToRegister = vi.fn();

        render(<LoginForm onSwitchToRegister={onSwitchToRegister} />);

        const registerLink = screen.getByRole('button', { name: '新規登録' });
        await user.click(registerLink);

        expect(onSwitchToRegister).toHaveBeenCalled();
    });

    it('メールアドレスラベルが表示される', () => {
        const onSwitchToRegister = vi.fn();
        render(<LoginForm onSwitchToRegister={onSwitchToRegister} />);

        expect(screen.getByText('メールアドレス')).toBeInTheDocument();
    });

    it('パスワードラベルが表示される', () => {
        const onSwitchToRegister = vi.fn();
        render(<LoginForm onSwitchToRegister={onSwitchToRegister} />);

        expect(screen.getByText('パスワード')).toBeInTheDocument();
    });
});
