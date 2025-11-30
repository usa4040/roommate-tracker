import React, { useState } from 'react';
import { Calendar, User, Trash2, ArrowRight, Receipt } from 'lucide-react';

const TransactionList = ({ transactions, payments, onDeleteTransaction, onDeletePayment }) => {
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [deleteType, setDeleteType] = useState(null); // 'transaction' or 'payment'

    // Combine transactions and payments into a single list
    const allItems = [
        ...(transactions || []).map(t => ({ ...t, type: 'transaction' })),
        ...(payments || []).map(p => ({ ...p, type: 'payment' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const handleDelete = async () => {
        if (deleteConfirmId && deleteType) {
            if (deleteType === 'transaction') {
                await onDeleteTransaction(deleteConfirmId);
            } else {
                await onDeletePayment(deleteConfirmId);
            }
            setDeleteConfirmId(null);
            setDeleteType(null);
        }
    };

    const openDeleteConfirm = (id, type) => {
        setDeleteConfirmId(id);
        setDeleteType(type);
    };

    return (
        <div className="card animate-fade-in">
            <h3 style={{ marginBottom: '1rem' }}>最近の取引</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {allItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        まだ取引がありません。
                    </div>
                )}
                {allItems.map((item, index) => {
                    const isPayment = item.type === 'payment';
                    const key = `${item.type}-${item.id}`;

                    return (
                        <div key={key} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: `3px solid ${isPayment ? 'var(--success)' : 'var(--primary)'}`,
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    {isPayment ? (
                                        <ArrowRight size={16} style={{ color: 'var(--success)' }} />
                                    ) : (
                                        <Receipt size={16} style={{ color: 'var(--primary)' }} />
                                    )}
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: isPayment ? 'var(--success)' : 'var(--primary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {isPayment ? '返済' : '経費'}
                                    </span>
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
                                    {item.description || (isPayment ? '返済' : '経費')}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {isPayment ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <User size={12} /> {item.from_user_name} → {item.to_user_name}
                                        </span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <User size={12} /> {item.payer_name} が支払い
                                        </span>
                                    )}
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Calendar size={12} /> {new Date(item.date).toLocaleDateString('ja-JP')}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    color: isPayment ? 'var(--success)' : 'inherit'
                                }}>
                                    {isPayment && '+'}{item.amount.toLocaleString()}円
                                </div>
                                <button
                                    onClick={() => openDeleteConfirm(item.id, item.type)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#f87171',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        opacity: 0.6,
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = 1}
                                    onMouseLeave={(e) => e.target.style.opacity = 0.6}
                                    title="削除"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '300px', padding: '1.5rem', margin: 0 }}>
                        <h4 style={{ marginBottom: '1rem' }}>
                            {deleteType === 'payment' ? '返済' : '取引'}を削除しますか？
                        </h4>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                            この操作は元に戻せません。
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-secondary" onClick={() => {
                                setDeleteConfirmId(null);
                                setDeleteType(null);
                            }} style={{ flex: 1 }}>
                                キャンセル
                            </button>
                            <button className="btn" onClick={handleDelete} style={{ flex: 1, background: '#ef4444' }}>
                                削除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionList;
