/**
 * socket.ts のテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// socket.io-client をモック
const mockSocket = {
    connected: false,
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn()
};

vi.mock('socket.io-client', () => ({
    io: vi.fn(() => mockSocket)
}));

// config をモック
vi.mock('../api/config', () => ({
    SOCKET_URL: 'http://localhost:3001'
}));

describe('Socket Configuration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // キャッシュをクリアして再インポート
        vi.resetModules();
    });

    it('socket.io-clientでソケットを作成する', async () => {
        const { io } = await import('socket.io-client');
        await import('../socket');

        expect(io).toHaveBeenCalled();
    });

    it('SOCKET_URLに接続する', async () => {
        const { io } = await import('socket.io-client');
        await import('../socket');

        expect(io).toHaveBeenCalledWith(
            'http://localhost:3001',
            expect.any(Object)
        );
    });

    it('autoConnect=trueで設定する', async () => {
        const { io } = await import('socket.io-client');
        await import('../socket');

        expect(io).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                autoConnect: true
            })
        );
    });

    it('reconnection設定が正しい', async () => {
        const { io } = await import('socket.io-client');
        await import('../socket');

        expect(io).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            })
        );
    });

    it('接続イベントリスナーが登録される', async () => {
        await import('../socket');

        expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    });

    it('切断イベントリスナーが登録される', async () => {
        await import('../socket');

        expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });

    it('接続エラーイベントリスナーが登録される', async () => {
        await import('../socket');

        expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    });

    it('デフォルトエクスポートがsocketオブジェクト', async () => {
        const socketModule = await import('../socket');

        expect(socketModule.default).toBeDefined();
        expect(socketModule.socket).toBeDefined();
    });
});
