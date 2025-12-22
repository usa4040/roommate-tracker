/**
 * Charts コンポーネントのテスト
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Charts from '../components/Charts';
import type { Transaction, Payment, User } from '../types';

// recharts をモック（SVGレンダリングの問題を回避）
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
    Line: () => <div data-testid="line" />,
    Bar: () => <div data-testid="bar" />,
    Pie: ({ children }: { children?: React.ReactNode }) => <div data-testid="pie">{children}</div>,
    Cell: () => <div data-testid="cell" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />
}));

describe('Charts Component', () => {
    const mockUsers: User[] = [
        { id: 1, name: 'ユーザー1', avatar: 'https://example.com/1.png' },
        { id: 2, name: 'ユーザー2', avatar: 'https://example.com/2.png' }
    ];

    const mockTransactions: Transaction[] = [
        { id: 1, payer_id: 1, payer_name: 'ユーザー1', amount: 1000, description: '経費1', date: '2024-01-15' },
        { id: 2, payer_id: 2, payer_name: 'ユーザー2', amount: 2000, description: '経費2', date: '2024-01-20' },
        { id: 3, payer_id: 1, payer_name: 'ユーザー1', amount: 1500, description: '経費3', date: '2024-02-10' }
    ];

    const mockPayments: Payment[] = [
        {
            id: 1,
            from_user_id: 1,
            to_user_id: 2,
            from_user_name: 'ユーザー1',
            to_user_name: 'ユーザー2',
            amount: 500,
            description: '返済1',
            date: '2024-01-25'
        }
    ];

    it('チャートコンポーネントがデータありで表示される', () => {
        render(
            <Charts
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
            />
        );

        // 統計グラフのタイトルが存在
        expect(screen.getByText(/統計グラフ/)).toBeInTheDocument();
    });

    it('月別支出推移グラフのセクションが表示される', () => {
        render(
            <Charts
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
            />
        );

        expect(screen.getByText(/月別支出推移/)).toBeInTheDocument();
    });

    it('ユーザー別支出割合グラフのセクションが表示される', () => {
        render(
            <Charts
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
            />
        );

        expect(screen.getByText(/ユーザー別支出割合/)).toBeInTheDocument();
    });

    it('ユーザー別収支バランスグラフのセクションが表示される', () => {
        render(
            <Charts
                transactions={mockTransactions}
                payments={mockPayments}
                users={mockUsers}
            />
        );

        expect(screen.getByText(/ユーザー別収支バランス/)).toBeInTheDocument();
    });

    it('データがない場合は空メッセージを表示する', () => {
        render(
            <Charts
                transactions={[]}
                payments={[]}
                users={mockUsers}
            />
        );

        expect(screen.getByText(/データがありません/)).toBeInTheDocument();
    });

    it('ユーザーがいない場合でもレンダリングされる', () => {
        render(
            <Charts
                transactions={mockTransactions}
                payments={mockPayments}
                users={[]}
            />
        );

        // コンポーネントがクラッシュしないことを確認
        expect(screen.getByText(/統計グラフ/)).toBeInTheDocument();
    });
});
