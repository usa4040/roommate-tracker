import React from 'react';
import { Calendar, User } from 'lucide-react';

const TransactionList = ({ transactions }) => {
    return (
        <div className="card animate-fade-in">
            <h3 style={{ marginBottom: '1rem' }}>最近の取引</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {transactions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        まだ取引がありません。
                    </div>
                )}
                {transactions.map(t => (
                    <div key={t.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 'var(--radius-md)',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>{t.description}</div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <User size={12} /> {t.payer_name} が支払い
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Calendar size={12} /> {new Date(t.date).toLocaleDateString('ja-JP')}
                                </span>
                            </div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                            {t.amount.toLocaleString()}円
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionList;
