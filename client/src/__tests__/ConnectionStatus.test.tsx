/**
 * ConnectionStatus コンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

// イベントハンドラーを保存するためのマップ
const eventHandlers: Map<string, Function> = new Map();
let mockSocketConnected = false;

// Socket.IO をモック
vi.mock('../socket', () => ({
    socket: {
        get connected() {
            return mockSocketConnected;
        },
        on: vi.fn((event: string, callback: Function) => {
            eventHandlers.set(event, callback);
        }),
        off: vi.fn((event: string) => {
            eventHandlers.delete(event);
        })
    }
}));

import ConnectionStatus from '../components/ConnectionStatus';

describe('ConnectionStatus Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        eventHandlers.clear();
        mockSocketConnected = false;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('初期未接続状態でステータスが表示される', () => {
        mockSocketConnected = false;

        render(<ConnectionStatus />);

        // disconnectイベントを発火
        const onDisconnect = eventHandlers.get('disconnect');
        if (onDisconnect) {
            act(() => {
                onDisconnect();
            });
        }

        expect(screen.getByText('サーバーとの接続が切れました')).toBeInTheDocument();
    });

    it('接続イベントで接続メッセージを表示', () => {
        mockSocketConnected = true;

        render(<ConnectionStatus />);

        const onConnect = eventHandlers.get('connect');
        if (onConnect) {
            act(() => {
                onConnect();
            });
        }

        expect(screen.getByText('サーバーに接続しました')).toBeInTheDocument();
    });

    it('切断イベントで切断メッセージを表示', () => {
        mockSocketConnected = false;

        render(<ConnectionStatus />);

        const onDisconnect = eventHandlers.get('disconnect');
        if (onDisconnect) {
            act(() => {
                onDisconnect();
            });
        }

        expect(screen.getByText('サーバーとの接続が切れました')).toBeInTheDocument();
    });

    it('接続成功後3秒でメッセージを非表示', () => {
        mockSocketConnected = true;

        render(<ConnectionStatus />);

        const onConnect = eventHandlers.get('connect');
        if (onConnect) {
            act(() => {
                onConnect();
            });
        }

        // 最初はメッセージが表示される
        expect(screen.getByText('サーバーに接続しました')).toBeInTheDocument();

        // 3秒経過
        act(() => {
            vi.advanceTimersByTime(3000);
        });

        // メッセージが非表示になる
        expect(screen.queryByText('サーバーに接続しました')).not.toBeInTheDocument();
    });

    it('接続中はconnectedクラスが付与される', () => {
        mockSocketConnected = true;

        const { container } = render(<ConnectionStatus />);

        const onConnect = eventHandlers.get('connect');
        if (onConnect) {
            act(() => {
                onConnect();
            });
        }

        const statusElement = container.querySelector('.connection-status');
        expect(statusElement).toHaveClass('connected');
    });

    it('切断中はdisconnectedクラスが付与される', () => {
        mockSocketConnected = false;

        const { container } = render(<ConnectionStatus />);

        const onDisconnect = eventHandlers.get('disconnect');
        if (onDisconnect) {
            act(() => {
                onDisconnect();
            });
        }

        const statusElement = container.querySelector('.connection-status');
        expect(statusElement).toHaveClass('disconnected');
    });
});
