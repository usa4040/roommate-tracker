import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const AddTransaction = ({ users, onAdd }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        payer_id: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.payer_id || !formData.amount || !formData.description) return;

        const success = await onAdd({
            ...formData,
            payer_id: parseInt(formData.payer_id),
            amount: parseFloat(formData.amount)
        });

        if (success) {
            setFormData({
                payer_id: '',
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            setIsOpen(false);
        }
    };

    if (!isOpen) {
        return (
            <button className="btn" onClick={() => setIsOpen(true)} style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <PlusCircle size={20} />
                経費を追加
            </button>
        );
    }

    return (
        <div className="card animate-fade-in">
            <h3 style={{ marginBottom: '1rem' }}>新しい経費</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                    <label>誰が支払いましたか？</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {users.map(u => (
                            <div
                                key={u.id}
                                onClick={() => setFormData({ ...formData, payer_id: u.id })}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${formData.payer_id === u.id ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                                    background: formData.payer_id === u.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ fontWeight: 600 }}>{u.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label>金額 (円)</label>
                    <input
                        type="number"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0"
                        required
                        style={{ fontSize: '1.25rem', fontWeight: 600 }}
                    />
                </div>

                <div>
                    <label>内容</label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="例: 家賓、食費"
                        required
                    />
                </div>

                <div>
                    <label>日付</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)} style={{ flex: 1 }}>
                        キャンセル
                    </button>
                    <button type="submit" className="btn" style={{ flex: 1 }}>
                        保存
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTransaction;
