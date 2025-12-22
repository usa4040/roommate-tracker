/**
 * useData フックのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Socket.IO をモック
const mockSocketOn = vi.fn();
const mockSocketOff = vi.fn();
vi.mock('../../socket', () => ({
    default: {
        on: mockSocketOn,
        off: mockSocketOff
    }
}));

// react-hot-toast をモック
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
        loading: vi.fn(() => 'toast-id')
    }
}));

import toast from 'react-hot-toast';
import { useData } from '../useData';

// モックデータ
const mockUsers = [
    { id: 1, name: 'ユーザー1', avatar: 'https://example.com/1.png' },
    { id: 2, name: 'ユーザー2', avatar: 'https://example.com/2.png' }
];

const mockTransactions = [
    { id: 1, payer_id: 1, payer_name: 'ユーザー1', amount: 1000, description: 'テスト', date: '2024-01-01' }
];

const mockPayments = [
    { id: 1, from_user_id: 1, to_user_id: 2, from_user_name: 'ユーザー1', to_user_name: 'ユーザー2', amount: 500, description: '返済', date: '2024-01-02' }
];

const mockBalance = [
    { user_id: 1, paid: 1000, owed: 500, diff: 500 },
    { user_id: 2, paid: 0, owed: 500, diff: -500 }
];

// 成功レスポンスをモック
const mockSuccessResponse = (data: any) => ({
    ok: true,
    json: () => Promise.resolve({ message: 'success', data })
});

// fetch をモック
const mockFetch = vi.fn();

describe('useData hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = mockFetch as any;

        // 初期データ取得をモック
        mockFetch
            .mockResolvedValueOnce(mockSuccessResponse(mockUsers))
            .mockResolvedValueOnce(mockSuccessResponse(mockTransactions))
            .mockResolvedValueOnce(mockSuccessResponse(mockPayments))
            .mockResolvedValueOnce(mockSuccessResponse(mockBalance));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('初期データを取得する', async () => {
        const { result } = renderHook(() => useData());

        // ローディング中
        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.users).toEqual(mockUsers);
        expect(result.current.transactions).toEqual(mockTransactions);
        expect(result.current.payments).toEqual(mockPayments);
        expect(result.current.balance).toEqual(mockBalance);
    });

    describe('addTransaction', () => {
        it('有効な経費を追加できる', async () => {
            const { result } = renderHook(() => useData());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // 追加リクエストと再取得をモック
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    message: 'success',
                    data: { id: 2, payer_id: 1, amount: 2000, description: '新規経費', date: '2024-01-02' }
                })
            });
            // 再取得用のモック
            mockFetch
                .mockResolvedValueOnce(mockSuccessResponse(mockUsers))
                .mockResolvedValueOnce(mockSuccessResponse(mockTransactions))
                .mockResolvedValueOnce(mockSuccessResponse(mockPayments))
                .mockResolvedValueOnce(mockSuccessResponse(mockBalance));

            let success: boolean = false;
            await act(async () => {
                success = await result.current.addTransaction({
                    payer_id: 1,
                    amount: 2000,
                    description: '新規経費',
                    date: '2024-01-02'
                });
            });

            expect(success).toBe(true);
            expect(toast.success).toHaveBeenCalled();
        });

        it('バリデーションエラーでtoastを表示', async () => {
            const { result } = renderHook(() => useData());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            let success: boolean = true;
            await act(async () => {
                success = await result.current.addTransaction({
                    payer_id: 1,
                    amount: -100, // 無効な金額
                    description: 'テスト',
                    date: '2024-01-01'
                });
            });

            expect(success).toBe(false);
            expect(toast.error).toHaveBeenCalled();
        });
    });

    describe('addPayment', () => {
        it('有効な返済を追加できる', async () => {
            const { result } = renderHook(() => useData());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    message: 'success',
                    data: { id: 2, from_user_id: 2, to_user_id: 1, amount: 300, description: '返済2', date: '2024-01-03' }
                })
            });
            // 再取得用のモック
            mockFetch
                .mockResolvedValueOnce(mockSuccessResponse(mockUsers))
                .mockResolvedValueOnce(mockSuccessResponse(mockTransactions))
                .mockResolvedValueOnce(mockSuccessResponse(mockPayments))
                .mockResolvedValueOnce(mockSuccessResponse(mockBalance));

            let success: boolean = false;
            await act(async () => {
                success = await result.current.addPayment({
                    from_user_id: 2,
                    to_user_id: 1,
                    amount: 300,
                    description: '返済2',
                    date: '2024-01-03'
                });
            });

            expect(success).toBe(true);
            expect(toast.success).toHaveBeenCalled();
        });

        it('同じユーザー間の返済を拒否する', async () => {
            const { result } = renderHook(() => useData());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            let success: boolean = true;
            await act(async () => {
                success = await result.current.addPayment({
                    from_user_id: 1,
                    to_user_id: 1, // 同じユーザー
                    amount: 500,
                    description: '返済',
                    date: '2024-01-03'
                });
            });

            expect(success).toBe(false);
            expect(toast.error).toHaveBeenCalled();
        });
    });

    describe('deleteTransaction', () => {
        it('経費を削除できる', async () => {
            const { result } = renderHook(() => useData());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ message: 'deleted' })
            });
            // 再取得用のモック
            mockFetch
                .mockResolvedValueOnce(mockSuccessResponse(mockUsers))
                .mockResolvedValueOnce(mockSuccessResponse(mockTransactions))
                .mockResolvedValueOnce(mockSuccessResponse(mockPayments))
                .mockResolvedValueOnce(mockSuccessResponse(mockBalance));

            let success: boolean = false;
            await act(async () => {
                success = await result.current.deleteTransaction(1);
            });

            expect(success).toBe(true);
            expect(toast.success).toHaveBeenCalled();
        });
    });

    describe('addUser', () => {
        it('ユーザーを追加できる', async () => {
            const { result } = renderHook(() => useData());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    message: 'success',
                    data: { id: 3, name: '新規ユーザー', avatar: 'https://example.com/3.png' }
                })
            });
            // 再取得用のモック
            mockFetch
                .mockResolvedValueOnce(mockSuccessResponse(mockUsers))
                .mockResolvedValueOnce(mockSuccessResponse(mockTransactions))
                .mockResolvedValueOnce(mockSuccessResponse(mockPayments))
                .mockResolvedValueOnce(mockSuccessResponse(mockBalance));

            let success: boolean = false;
            await act(async () => {
                success = await result.current.addUser('新規ユーザー');
            });

            expect(success).toBe(true);
            expect(toast.success).toHaveBeenCalled();
        });
    });

    describe('Socket.IO イベント', () => {
        it('data-updatedイベントリスナーが登録される', async () => {
            renderHook(() => useData());

            await waitFor(() => {
                expect(mockSocketOn).toHaveBeenCalledWith('data-updated', expect.any(Function));
            });
        });

        it('アンマウント時にイベントリスナーを解除する', async () => {
            const { unmount } = renderHook(() => useData());

            await waitFor(() => {
                expect(mockSocketOn).toHaveBeenCalled();
            });

            unmount();

            expect(mockSocketOff).toHaveBeenCalledWith('data-updated', expect.any(Function));
        });
    });
});
