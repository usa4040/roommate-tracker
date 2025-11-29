import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';

const AddPayment = ({ users, onAdd }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        from_user_id: '',
        to_user_id: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await onAdd({
            ...formData,
            amount: parseFloat(formData.amount)
        });
        if (success) {
            setFormData({
                from_user_id: '',
                to_user_id: '',
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            setIsOpen(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="card"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    border: '2px dashed var(--border)',
                    background: 'transparent',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.background = 'var(--card-bg)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'transparent';
                }}
            >
                <DollarSign size={24} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>返済を記録</span>
            </button>
        );
    }

    return (
        <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={24} style={{ color: 'var(--primary)' }} />
                返済を記録
            </h3>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            支払った人
                        </label>
                        <select
                            value={formData.from_user_id}
                            onChange={e => setFormData({ ...formData, from_user_id: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg)',
                                color: 'var(--text)',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="">選択してください</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            受け取った人
                        </label>
                        <select
                            value={formData.to_user_id}
                            onChange={e => setFormData({ ...formData, to_user_id: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg)',
                                color: 'var(--text)',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="">選択してください</option>
                            {users.filter(u => u.id !== parseInt(formData.from_user_id)).map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            金額
                        </label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="例: 5000"
                            required
                            min="0"
                            step="0.01"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg)',
                                color: 'var(--text)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            メモ（任意）
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="例: 家賃の返済"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg)',
                                color: 'var(--text)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            日付
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                background: 'var(--bg)',
                                color: 'var(--text)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            保存
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="btn"
                            style={{ flex: 1 }}
                        >
                            キャンセル
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddPayment;
