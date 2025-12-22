/**
 * AuthContext のテスト
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// authAPI のモック
vi.mock('../../api/auth', () => ({
    authAPI: {
        getCurrentUser: vi.fn(),
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn()
    }
}));

import { authAPI } from '../../api/auth';

// localStorage のモック
const mockLocalStorage = {
    store: {} as Record<string, string>,
    getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
    setItem: vi.fn((key: string, value: string) => { mockLocalStorage.store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete mockLocalStorage.store[key]; }),
    clear: vi.fn(() => { mockLocalStorage.store = {}; })
};
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

// テスト用コンポーネント
const TestConsumer: React.FC = () => {
    const { user, loading, isAuthenticated, login, logout, register } = useAuth();

    return (
        <div>
            <span data-testid="loading">{loading.toString()}</span>
            <span data-testid="authenticated">{isAuthenticated.toString()}</span>
            <span data-testid="user">{user ? user.name : 'null'}</span>
            <button onClick={() => login({ email: 'test@example.com', password: 'pass' })}>
                ログイン
            </button>
            <button onClick={() => register({ name: 'New', email: 'new@example.com', password: 'pass' })}>
                登録
            </button>
            <button onClick={() => logout()}>
                ログアウト
            </button>
        </div>
    );
};

// AuthProvider外でuseAuthを呼び出すテスト用コンポーネント
const TestConsumerOutsideProvider: React.FC = () => {
    try {
        useAuth();
        return <div>No Error</div>;
    } catch (error) {
        return <div>Error: {(error as Error).message}</div>;
    }
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLocalStorage.store = {};
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('useAuth', () => {
        it('AuthProvider外で例外をスローする', () => {
            render(<TestConsumerOutsideProvider />);

            expect(screen.getByText(/Error: useAuth must be used within AuthProvider/)).toBeInTheDocument();
        });
    });

    describe('AuthProvider', () => {
        it('トークンがなければuser=nullを返す', async () => {
            mockLocalStorage.store = {};

            render(
                <AuthProvider>
                    <TestConsumer />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading').textContent).toBe('false');
            });

            // トークンがないのでgetCurrentUserは呼ばれず、userはnull
            expect(screen.getByTestId('user').textContent).toBe('null');
            expect(screen.getByTestId('authenticated').textContent).toBe('false');
        });

        it('保存済みトークンでユーザーを復元する', async () => {
            mockLocalStorage.store['auth_token'] = 'saved-token';
            vi.mocked(authAPI.getCurrentUser).mockResolvedValue({
                id: 1,
                name: '復元ユーザー',
                email: 'restored@example.com',
                role: 'user',
                avatar: 'https://example.com/avatar.png'
            });

            render(
                <AuthProvider>
                    <TestConsumer />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading').textContent).toBe('false');
            });

            expect(screen.getByTestId('user').textContent).toBe('復元ユーザー');
            expect(screen.getByTestId('authenticated').textContent).toBe('true');
        });

        it('login後にuserを設定しトークンを保存する', async () => {
            mockLocalStorage.store = {};
            vi.mocked(authAPI.login).mockResolvedValue({
                message: 'success',
                token: 'new-login-token',
                user: {
                    id: 2,
                    name: 'ログインユーザー',
                    email: 'login@example.com',
                    role: 'user',
                    avatar: 'https://example.com/avatar.png'
                }
            });

            render(
                <AuthProvider>
                    <TestConsumer />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading').textContent).toBe('false');
            });

            // ログインボタンをクリック
            await act(async () => {
                screen.getByText('ログイン').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('user').textContent).toBe('ログインユーザー');
            });

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-login-token');
        });

        it('register後にuserを設定しトークンを保存する', async () => {
            mockLocalStorage.store = {};
            vi.mocked(authAPI.register).mockResolvedValue({
                message: 'success',
                token: 'new-register-token',
                user: {
                    id: 3,
                    name: '新規ユーザー',
                    email: 'new@example.com',
                    role: 'user',
                    avatar: 'https://example.com/avatar.png'
                }
            });

            render(
                <AuthProvider>
                    <TestConsumer />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading').textContent).toBe('false');
            });

            // 登録ボタンをクリック
            await act(async () => {
                screen.getByText('登録').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('user').textContent).toBe('新規ユーザー');
            });

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-register-token');
        });

        it('logout後にuserをクリアしトークンを削除する', async () => {
            mockLocalStorage.store['auth_token'] = 'existing-token';
            vi.mocked(authAPI.getCurrentUser).mockResolvedValue({
                id: 1,
                name: 'ログイン中ユーザー',
                email: 'user@example.com',
                role: 'user',
                avatar: ''
            });
            vi.mocked(authAPI.logout).mockResolvedValue();

            render(
                <AuthProvider>
                    <TestConsumer />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('user').textContent).toBe('ログイン中ユーザー');
            });

            // ログアウトボタンをクリック
            await act(async () => {
                screen.getByText('ログアウト').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('user').textContent).toBe('null');
            });

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
        });

        it('getCurrentUserでエラーが発生した場合トークンを削除', async () => {
            mockLocalStorage.store['auth_token'] = 'invalid-token';
            vi.mocked(authAPI.getCurrentUser).mockRejectedValue(new Error('Invalid token'));

            render(
                <AuthProvider>
                    <TestConsumer />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading').textContent).toBe('false');
            });

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
            expect(screen.getByTestId('user').textContent).toBe('null');
        });
    });
});
