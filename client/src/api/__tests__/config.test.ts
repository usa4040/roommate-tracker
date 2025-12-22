/**
 * API設定のユニットテスト
 * 
 * これらのテストは、API URLの構築が正しく行われることを検証します。
 * 特に、二重パス問題（/api/api/...）が発生しないことを確認します。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { API_BASE_URL, SOCKET_URL, ENDPOINTS, buildApiUrl, isValidApiUrl } from '../config';

describe('API Config', () => {
    describe('API_BASE_URL', () => {
        it('should be defined', () => {
            expect(API_BASE_URL).toBeDefined();
            expect(typeof API_BASE_URL).toBe('string');
        });

        it('should end with /api', () => {
            expect(API_BASE_URL).toMatch(/\/api$/);
        });

        it('should not contain double /api/api', () => {
            expect(API_BASE_URL).not.toContain('/api/api');
        });
    });

    describe('SOCKET_URL', () => {
        it('should be defined', () => {
            expect(SOCKET_URL).toBeDefined();
            expect(typeof SOCKET_URL).toBe('string');
        });

        it('should not end with /api', () => {
            expect(SOCKET_URL).not.toMatch(/\/api$/);
        });

        it('should be API_BASE_URL without /api suffix', () => {
            expect(SOCKET_URL).toBe(API_BASE_URL.replace(/\/api$/, ''));
        });
    });

    describe('ENDPOINTS', () => {
        describe('AUTH endpoints', () => {
            it('should have correct login endpoint', () => {
                expect(ENDPOINTS.AUTH.LOGIN).toBe('/auth/login');
            });

            it('should have correct register endpoint', () => {
                expect(ENDPOINTS.AUTH.REGISTER).toBe('/auth/register');
            });

            it('should have correct me endpoint', () => {
                expect(ENDPOINTS.AUTH.ME).toBe('/auth/me');
            });

            it('should have correct logout endpoint', () => {
                expect(ENDPOINTS.AUTH.LOGOUT).toBe('/auth/logout');
            });

            it('should not have /api prefix in AUTH endpoints', () => {
                Object.values(ENDPOINTS.AUTH).forEach(endpoint => {
                    expect(endpoint).not.toMatch(/^\/api/);
                });
            });
        });

        describe('Resource endpoints', () => {
            it('should have correct users endpoint', () => {
                expect(ENDPOINTS.USERS).toBe('/users');
            });

            it('should have correct transactions endpoint', () => {
                expect(ENDPOINTS.TRANSACTIONS).toBe('/transactions');
            });

            it('should have correct payments endpoint', () => {
                expect(ENDPOINTS.PAYMENTS).toBe('/payments');
            });

            it('should have correct balance endpoint', () => {
                expect(ENDPOINTS.BALANCE).toBe('/balance');
            });
        });

        describe('Dynamic endpoints', () => {
            it('should generate correct user by ID endpoint', () => {
                expect(ENDPOINTS.USER_BY_ID(1)).toBe('/users/1');
                expect(ENDPOINTS.USER_BY_ID('123')).toBe('/users/123');
            });

            it('should generate correct transaction by ID endpoint', () => {
                expect(ENDPOINTS.TRANSACTION_BY_ID(42)).toBe('/transactions/42');
            });

            it('should generate correct payment by ID endpoint', () => {
                expect(ENDPOINTS.PAYMENT_BY_ID(99)).toBe('/payments/99');
            });
        });
    });

    describe('buildApiUrl', () => {
        it('should construct valid URL for login', () => {
            const url = buildApiUrl(ENDPOINTS.AUTH.LOGIN);
            expect(url).toBe(`${API_BASE_URL}/auth/login`);
        });

        it('should construct valid URL for users', () => {
            const url = buildApiUrl(ENDPOINTS.USERS);
            expect(url).toBe(`${API_BASE_URL}/users`);
        });

        it('should construct valid URL for user by ID', () => {
            const url = buildApiUrl(ENDPOINTS.USER_BY_ID(5));
            expect(url).toBe(`${API_BASE_URL}/users/5`);
        });

        it('should never produce double /api/api in URL', () => {
            const endpoints = [
                ENDPOINTS.AUTH.LOGIN,
                ENDPOINTS.AUTH.REGISTER,
                ENDPOINTS.AUTH.ME,
                ENDPOINTS.AUTH.LOGOUT,
                ENDPOINTS.USERS,
                ENDPOINTS.USER_BY_ID(1),
                ENDPOINTS.TRANSACTIONS,
                ENDPOINTS.TRANSACTION_BY_ID(1),
                ENDPOINTS.PAYMENTS,
                ENDPOINTS.PAYMENT_BY_ID(1),
                ENDPOINTS.BALANCE,
            ];

            endpoints.forEach(endpoint => {
                const url = buildApiUrl(endpoint);
                expect(url).not.toContain('/api/api');
                expect(isValidApiUrl(url)).toBe(true);
            });
        });
    });

    describe('isValidApiUrl', () => {
        it('should return true for valid URLs', () => {
            expect(isValidApiUrl('http://localhost:3001/api/auth/login')).toBe(true);
            expect(isValidApiUrl('http://localhost:3001/api/users')).toBe(true);
        });

        it('should return false for URLs with double /api', () => {
            expect(isValidApiUrl('http://localhost:3001/api/api/auth/login')).toBe(false);
            expect(isValidApiUrl('http://localhost:3001/api/api/users')).toBe(false);
        });
    });
});
