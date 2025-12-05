import React from 'react';
import type { Balance, User } from '../types';

interface DashboardProps {
    balance: Balance[];
    users: User[];
}

const Dashboard: React.FC<DashboardProps> = ({ balance, users }) => {
    const getUser = (id: number): User | undefined => users.find(u => u.id === id);

    return (
        <div className="card animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>収支サマリー</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {balance.map(b => {
                    const user = getUser(b.user_id);
                    if (!user) return null;
                    const isOwed = b.diff > 0;
                    const isSettled = Math.abs(b.diff) < 0.01;

                    return (
                        <div key={b.user_id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            flexWrap: 'wrap',
                            gap: '0.75rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 auto', minWidth: '200px' }}>
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        background: '#334155',
                                        flexShrink: 0
                                    }}
                                />
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        支払額: {Math.round(b.paid).toLocaleString()} 円
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                                {isSettled ? (
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>精算済み</span>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{
                                            color: isOwed ? '#4ade80' : '#f87171',
                                            fontWeight: 700,
                                            fontSize: '1.25rem'
                                        }}>
                                            {isOwed ? '+' : ''}{Math.round(b.diff).toLocaleString()} 円
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {isOwed ? '受取予定' : '支払予定'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Dashboard;
