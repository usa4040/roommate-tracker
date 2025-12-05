import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import type { Transaction, Payment, User } from '../types';

interface ChartsProps {
    transactions: Transaction[];
    payments: Payment[];
    users: User[];
}

// カラーパレット
const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

const Charts: React.FC<ChartsProps> = ({ transactions, payments, users }) => {
    // 月別支出データの生成
    const monthlyData = useMemo(() => {
        const monthMap = new Map<string, number>();

        transactions.forEach(t => {
            const date = new Date(t.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + t.amount);
        });

        return Array.from(monthMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-6) // 直近6ヶ月
            .map(([month, amount]) => ({
                month: month.substring(5) + '月',
                amount: Math.round(amount)
            }));
    }, [transactions]);

    // ユーザー別支出データの生成
    const userExpenseData = useMemo(() => {
        const userMap = new Map<number, number>();

        transactions.forEach(t => {
            userMap.set(t.payer_id, (userMap.get(t.payer_id) || 0) + t.amount);
        });

        return Array.from(userMap.entries())
            .map(([userId, amount]) => {
                const user = users.find(u => u.id === userId);
                return {
                    name: user?.name || `User ${userId}`,
                    value: Math.round(amount)
                };
            })
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [transactions, users]);

    // ユーザー別収支データの生成
    const userBalanceData = useMemo(() => {
        return users.map(user => {
            const paid = transactions
                .filter(t => t.payer_id === user.id)
                .reduce((sum, t) => sum + t.amount, 0);

            const received = payments
                .filter(p => p.to_user_id === user.id)
                .reduce((sum, p) => sum + p.amount, 0);

            const sent = payments
                .filter(p => p.from_user_id === user.id)
                .reduce((sum, p) => sum + p.amount, 0);

            return {
                name: user.name,
                支出: Math.round(paid),
                受取: Math.round(received),
                支払: Math.round(sent)
            };
        });
    }, [users, transactions, payments]);

    // カスタムツールチップ
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    backdropFilter: 'blur(8px)'
                }}>
                    <p style={{ margin: 0, marginBottom: '0.5rem', fontWeight: 600 }}>{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ margin: 0, color: entry.color, fontSize: '0.9rem' }}>
                            {entry.name}: {entry.value.toLocaleString()}円
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (transactions.length === 0) {
        return (
            <div className="card animate-fade-in">
                <h2 style={{ marginBottom: '1rem' }}>📊 統計グラフ</h2>
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-secondary)'
                }}>
                    データがありません。取引を追加してください。
                </div>
            </div>
        );
    }

    return (
        <div className="card animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>📊 統計グラフ</h2>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* 月別支出推移 */}
                {monthlyData.length > 0 && (
                    <div>
                        <h3 style={{
                            fontSize: '1.1rem',
                            marginBottom: '1rem',
                            color: 'var(--text-secondary)',
                            fontWeight: 600
                        }}>
                            📈 月別支出推移
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="month"
                                    stroke="var(--text-secondary)"
                                    style={{ fontSize: '0.85rem' }}
                                />
                                <YAxis
                                    stroke="var(--text-secondary)"
                                    style={{ fontSize: '0.85rem' }}
                                    tickFormatter={(value) => `¥${value.toLocaleString()}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ fontSize: '0.9rem' }}
                                    iconType="circle"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    name="支出額"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ fill: '#8b5cf6', r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* ユーザー別支出割合 */}
                {userExpenseData.length > 0 && (
                    <div>
                        <h3 style={{
                            fontSize: '1.1rem',
                            marginBottom: '1rem',
                            color: 'var(--text-secondary)',
                            fontWeight: 600
                        }}>
                            🥧 ユーザー別支出割合
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userExpenseData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                                    }
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {userExpenseData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* ユーザー別収支バランス */}
                {userBalanceData.length > 0 && (
                    <div>
                        <h3 style={{
                            fontSize: '1.1rem',
                            marginBottom: '1rem',
                            color: 'var(--text-secondary)',
                            fontWeight: 600
                        }}>
                            📊 ユーザー別収支バランス
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={userBalanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="var(--text-secondary)"
                                    style={{ fontSize: '0.85rem' }}
                                />
                                <YAxis
                                    stroke="var(--text-secondary)"
                                    style={{ fontSize: '0.85rem' }}
                                    tickFormatter={(value) => `¥${value.toLocaleString()}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ fontSize: '0.9rem' }}
                                    iconType="circle"
                                />
                                <Bar dataKey="支出" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="受取" fill="#10b981" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="支払" fill="#ef4444" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Charts;
