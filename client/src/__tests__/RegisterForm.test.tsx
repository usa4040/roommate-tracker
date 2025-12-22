/**
 * RegisterForm コンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../components/RegisterForm';

// AuthContext のモック
const mockRegister = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        register: mockRegister
    })
}));

describe('RegisterForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('登録フォームが表示される', () => {
        const onSwitchToLogin = vi.fn();
        render(<RegisterForm onSwitchToLogin={onSwitchToLogin} />);

        expect(screen.getByRole('heading', { level: 2, name: '新規登録' })).toBeInTheDocument();
    });

    it('名前・メール・パスワード入力フィールドが表示される', () => {
        const onSwitchToLogin = vi.fn();
        render(<RegisterForm onSwitchToLogin={onSwitchToLogin} />);

        expect(screen.getByPlaceholderText('山田太郎')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('example@example.com')).toBeInTheDocument();
        // パスワードフィールドは2つある（確認用含む）
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        expect(passwordInputs.length).toBe(2);
    });

    it('有効な入力で登録を試行する', async () => {
        const user = userEvent.setup();
        const onSwitchToLogin = vi.fn();
        mockRegister.mockResolvedValue(undefined);

        render(<RegisterForm onSwitchToLogin={onSwitchToLogin} />);

        const nameInput = screen.getByPlaceholderText('山田太郎');
        const emailInput = screen.getByPlaceholderText('example@example.com');
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');

        await user.type(nameInput, 'テストユーザー');
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInputs[0], 'password123');
        await user.type(passwordInputs[1], 'password123');

        const submitButton = screen.getByRole('button', { name: '登録' });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith({
                name: 'テストユーザー',
                email: 'test@example.com',
                password: 'password123'
            });
        });
    });

    it('パスワード不一致エラーを表示する', async () => {
        const user = userEvent.setup();
        const onSwitchToLogin = vi.fn();

        render(<RegisterForm onSwitchToLogin={onSwitchToLogin} />);

        const nameInput = screen.getByPlaceholderText('山田太郎');
        const emailInput = screen.getByPlaceholderText('example@example.com');
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');

        await user.type(nameInput, 'テストユーザー');
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInputs[0], 'password123');
        await user.type(passwordInputs[1], 'differentpassword');

        const submitButton = screen.getByRole('button', { name: '登録' });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
        });

        // registerは呼ばれない
        expect(mockRegister).not.toHaveBeenCalled();
    });

    it('登録エラーを表示する', async () => {
        const user = userEvent.setup();
        const onSwitchToLogin = vi.fn();
        mockRegister.mockRejectedValue(new Error('Email already registered'));

        render(<RegisterForm onSwitchToLogin={onSwitchToLogin} />);

        const nameInput = screen.getByPlaceholderText('山田太郎');
        const emailInput = screen.getByPlaceholderText('example@example.com');
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');

        await user.type(nameInput, 'テストユーザー');
        await user.type(emailInput, 'duplicate@example.com');
        await user.type(passwordInputs[0], 'password123');
        await user.type(passwordInputs[1], 'password123');

        const submitButton = screen.getByRole('button', { name: '登録' });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Email already registered')).toBeInTheDocument();
        });
    });

    it('登録中はボタンテキストが変わる', async () => {
        const user = userEvent.setup();
        const onSwitchToLogin = vi.fn();
        mockRegister.mockImplementation(() => new Promise(() => { }));

        render(<RegisterForm onSwitchToLogin={onSwitchToLogin} />);

        const nameInput = screen.getByPlaceholderText('山田太郎');
        const emailInput = screen.getByPlaceholderText('example@example.com');
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');

        await user.type(nameInput, 'テストユーザー');
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInputs[0], 'password123');
        await user.type(passwordInputs[1], 'password123');

        const submitButton = screen.getByRole('button', { name: '登録' });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: '登録中...' })).toBeInTheDocument();
        });
    });

    it('ログインリンクをクリックできる', async () => {
        const user = userEvent.setup();
        const onSwitchToLogin = vi.fn();

        render(<RegisterForm onSwitchToLogin={onSwitchToLogin} />);

        const loginLink = screen.getByRole('button', { name: 'ログイン' });
        await user.click(loginLink);

        expect(onSwitchToLogin).toHaveBeenCalled();
    });

    it('名前ラベルが表示される', () => {
        const onSwitchToLogin = vi.fn();
        render(<RegisterForm onSwitchToLogin={onSwitchToLogin} />);

        expect(screen.getByText('名前')).toBeInTheDocument();
    });

    it('パスワード確認ラベルが表示される', () => {
        const onSwitchToLogin = vi.fn();
        render(<RegisterForm onSwitchToLogin={onSwitchToLogin} />);

        expect(screen.getByText('パスワード（確認）')).toBeInTheDocument();
    });
});
