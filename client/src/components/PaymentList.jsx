import React from 'react';
import { Trash2, ArrowRight } from 'lucide-react';

const PaymentList = ({ payments, onDelete }) => {
    if (!payments || payments.length === 0) {
        return (
            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>返済履歴</h3>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                    まだ返済の記録がありません
                </p>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>返済履歴</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {payments.map(payment => (
                    <div
                        key={payment.id}
                        className="animate-fade-in"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'var(--bg)',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: '600' }}>{payment.from_user_name}</span>
                                <ArrowRight size={16} style={{ color: 'var(--text-secondary)' }} />
                                <span style={{ fontWeight: '600' }}>{payment.to_user_name}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {payment.description && <span>{payment.description} • </span>}
                                <span>{new Date(payment.date).toLocaleDateString('ja-JP')}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: 'var(--success)'
                            }}>
                                ¥{payment.amount.toLocaleString()}
                            </span>
                            <button
                                onClick={() => onDelete(payment.id)}
                                style={{
                                    padding: '0.5rem',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: 'var(--radius)',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--danger)';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentList;
