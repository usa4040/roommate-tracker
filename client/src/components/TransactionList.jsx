import React, { useState } from 'react';
import { Calendar, User, Trash2 } from 'lucide-react';

const TransactionList = ({ transactions, onDelete }) => {
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const handleDelete = async () => {
        if (deleteConfirmId) {
            await onDelete(deleteConfirmId);
            setDeleteConfirmId(null);
        }
    };

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
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative'
                    }}>
                        <div style={{ flex: 1 }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                {t.amount.toLocaleString()}円
                            </div>
                            <button
                                onClick={() => setDeleteConfirmId(t.id)}
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
                ))}
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
                        <h4 style={{ marginBottom: '1rem' }}>取引を削除しますか？</h4>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                            この操作は元に戻せません。
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)} style={{ flex: 1 }}>
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
