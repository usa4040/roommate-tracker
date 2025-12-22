/**
 * auth.ts API クライアントのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// fetchをモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// localStorageをモック
const mockLocalStorage = {
    store: {} as Record<string, string>,
    getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
    setItem: vi.fn((key: string, value: string) => { mockLocalStorage.store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete mockLocalStorage.store[key]; }),
    clear: vi.fn(() => { mockLocalStorage.store = {}; })
};
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

// モジュールをインポート（モック後に行う）
import { authAPI, LoginCredentials, RegisterData, AuthUser, AuthResponse } from '../auth';
import { API_BASE_URL } from '../config';

describe('authAPI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLocalStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('login', () => {
        it('正しい認証情報でログインできる', async () => {
            const mockResponse: AuthResponse = {
                message: 'success',
                token: 'test-jwt-token',
                user: {
                    id: 1,
                    name: 'テストユーザー',
                    email: 'test@example.com',
                    role: 'user',
                    avatar: 'https://example.com/avatar.png'
                }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123'
            };

            const result = await authAPI.login(credentials);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/login'),
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(credentials)
                })
            );
            expect(result.token).toBe('test-jwt-token');
            expect(result.user.email).toBe('test@example.com');
        });

        it('失敗時にエラーをスローする', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Invalid credentials' })
            });

            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            await expect(authAPI.login(credentials)).rejects.toThrow('Invalid credentials');
        });

        it('ネットワークエラーでエラーをスローする', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123'
            };

            await expect(authAPI.login(credentials)).rejects.toThrow('Network error');
        });
    });

    describe('register', () => {
        it('新規ユーザーを登録できる', async () => {
            const mockResponse: AuthResponse = {
                message: 'success',
                token: 'new-user-token',
                user: {
                    id: 2,
                    name: '新規ユーザー',
                    email: 'new@example.com',
                    role: 'user',
                    avatar: 'https://example.com/newavatar.png'
                }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const data: RegisterData = {
                name: '新規ユーザー',
                email: 'new@example.com',
                password: 'newpassword123'
            };

            const result = await authAPI.register(data);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/register'),
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
            );
            expect(result.user.name).toBe('新規ユーザー');
        });

        it('失敗時にエラーをスローする', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Email already registered' })
            });

            const data: RegisterData = {
                name: '重複ユーザー',
                email: 'duplicate@example.com',
                password: 'password123'
            };

            await expect(authAPI.register(data)).rejects.toThrow('Email already registered');
        });
    });

    describe('getCurrentUser', () => {
        it('現在のユーザーを取得できる', async () => {
            const mockUser: AuthUser = {
                id: 1,
                name: 'テストユーザー',
                email: 'test@example.com',
                role: 'admin',
                avatar: 'https://example.com/avatar.png'
            };

            mockLocalStorage.store['auth_token'] = 'valid-token';
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ user: mockUser })
            });

            const result = await authAPI.getCurrentUser();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/me'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer valid-token'
                    })
                })
            );
            expect(result.email).toBe('test@example.com');
        });

        it('未認証で例外をスローする', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Unauthorized' })
            });

            await expect(authAPI.getCurrentUser()).rejects.toThrow('Failed to get current user');
        });
    });

    describe('logout', () => {
        it('ログアウトAPIを呼び出す', async () => {
            mockLocalStorage.store['auth_token'] = 'valid-token';
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ message: 'Logged out' })
            });

            await authAPI.logout();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/logout'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer valid-token'
                    })
                })
            );
        });
    });

    describe('getHeaders', () => {
        it('トークンがあればAuthorizationヘッダーを含む', async () => {
            mockLocalStorage.store['auth_token'] = 'my-token';
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ user: {} })
            });

            await authAPI.getCurrentUser();

            const calledHeaders = mockFetch.mock.calls[0][1].headers;
            expect(calledHeaders['Authorization']).toBe('Bearer my-token');
        });

        it('トークンがなければAuthorizationヘッダーを含まない', async () => {
            mockLocalStorage.store = {};
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ user: {} })
            });

            await authAPI.getCurrentUser();

            const calledHeaders = mockFetch.mock.calls[0][1].headers;
            expect(calledHeaders['Authorization']).toBeUndefined();
        });
    });
});
