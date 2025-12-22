/**
 * export.ts ユーティリティのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV, exportToJSON, generateFilename, exportSummary } from '../export';
import type { TransactionOrPayment, Transaction, Payment } from '../../types';

// グローバルオブジェクトをモック
const mockAlert = vi.fn();
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();
const mockRequestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
    cb(0);
    return 0;
});

// document.createElementとappendChild/removeChildをモック
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockCreateElement = vi.fn(() => ({
    href: '',
    download: '',
    click: mockClick,
    dispatchEvent: vi.fn()
}));

beforeEach(() => {
    vi.clearAllMocks();

    global.alert = mockAlert;
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    global.requestAnimationFrame = mockRequestAnimationFrame;

    vi.spyOn(document, 'createElement').mockImplementation(mockCreateElement as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
    vi.spyOn(console, 'log').mockImplementation(() => { });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('Export Utilities', () => {
    // テストデータ
    const mockTransaction: Transaction = {
        id: 1,
        payer_id: 1,
        payer_name: 'ユーザー1',
        amount: 1000,
        description: 'テスト経費',
        date: '2024-01-01'
    };

    const mockPayment: Payment = {
        id: 1,
        from_user_id: 1,
        to_user_id: 2,
        from_user_name: 'ユーザー1',
        to_user_name: 'ユーザー2',
        amount: 500,
        description: 'テスト返済',
        date: '2024-01-02'
    };

    const mockItems: TransactionOrPayment[] = [
        { ...mockTransaction, type: 'transaction' },
        { ...mockPayment, type: 'payment' }
    ];

    const mockUsers = [
        { id: 1, name: 'ユーザー1' },
        { id: 2, name: 'ユーザー2' }
    ];

    describe('exportToCSV', () => {
        it('空データでアラートを表示', () => {
            exportToCSV([]);

            expect(mockAlert).toHaveBeenCalledWith('エクスポートするデータがありません。');
            expect(mockCreateObjectURL).not.toHaveBeenCalled();
        });

        it('経費をCSVフォーマットに変換', () => {
            const items: TransactionOrPayment[] = [
                { ...mockTransaction, type: 'transaction' }
            ];

            exportToCSV(items, 'test.csv');

            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(mockCreateElement).toHaveBeenCalledWith('a');

            // Blobの内容を検証
            const blobCall = mockCreateObjectURL.mock.calls[0][0] as Blob;
            expect(blobCall).toBeInstanceOf(Blob);
            expect(blobCall.type).toBe('text/csv;charset=utf-8;');
        });

        it('返済をCSVフォーマットに変換', () => {
            const items: TransactionOrPayment[] = [
                { ...mockPayment, type: 'payment' }
            ];

            exportToCSV(items, 'test.csv');

            expect(mockCreateObjectURL).toHaveBeenCalled();
        });

        it('カスタムファイル名でエクスポート', () => {
            exportToCSV(mockItems, 'custom_export.csv');

            const linkElement = mockCreateElement.mock.results[0].value;
            expect(linkElement.download).toBe('custom_export.csv');
        });

        it('複数アイテムをエクスポート', () => {
            exportToCSV(mockItems);

            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('CSV exported'));
        });
    });

    describe('exportToJSON', () => {
        it('空データでアラートを表示', () => {
            exportToJSON([]);

            expect(mockAlert).toHaveBeenCalledWith('エクスポートするデータがありません。');
            expect(mockCreateObjectURL).not.toHaveBeenCalled();
        });

        it('データをJSONフォーマットに変換', () => {
            exportToJSON(mockItems, 'test.json');

            expect(mockCreateObjectURL).toHaveBeenCalled();

            const blobCall = mockCreateObjectURL.mock.calls[0][0] as Blob;
            expect(blobCall.type).toBe('application/json;charset=utf-8;');
        });

        it('カスタムファイル名でエクスポート', () => {
            exportToJSON(mockItems, 'custom_export.json');

            const linkElement = mockCreateElement.mock.results[0].value;
            expect(linkElement.download).toBe('custom_export.json');
        });

        it('コンソールにログを出力', () => {
            exportToJSON(mockItems);

            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('JSON exported'));
        });
    });

    describe('generateFilename', () => {
        it('日付付きファイル名を生成', () => {
            const filename = generateFilename('export', 'csv');

            expect(filename).toMatch(/^export_\d{4}-\d{2}-\d{2}\.csv$/);
        });

        it('異なるプレフィックスと拡張子を使用', () => {
            const filename = generateFilename('summary', 'json');

            expect(filename).toMatch(/^summary_\d{4}-\d{2}-\d{2}\.json$/);
        });

        it('現在の日付を使用', () => {
            const today = new Date().toISOString().split('T')[0];
            const filename = generateFilename('test', 'txt');

            expect(filename).toBe(`test_${today}.txt`);
        });
    });

    describe('exportSummary', () => {
        it('統計サマリーをJSON出力', () => {
            exportSummary(mockItems, mockUsers, 'summary.json');

            expect(mockCreateObjectURL).toHaveBeenCalled();

            const blobCall = mockCreateObjectURL.mock.calls[0][0] as Blob;
            expect(blobCall.type).toBe('application/json;charset=utf-8;');
        });

        it('空のアイテムでもサマリーを生成', () => {
            exportSummary([], mockUsers, 'empty_summary.json');

            expect(mockCreateObjectURL).toHaveBeenCalled();
        });

        it('ユーザーごとの統計を計算', () => {
            exportSummary(mockItems, mockUsers);

            expect(mockCreateObjectURL).toHaveBeenCalled();
        });

        it('コンソールにログを出力', () => {
            exportSummary(mockItems, mockUsers);

            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Summary exported'));
        });
    });
});
