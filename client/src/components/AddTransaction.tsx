import React, { useState } from 'react';
import { PlusCircle, Receipt, DollarSign } from 'lucide-react';
import type { User, TransactionInput, PaymentInput } from '../types';

interface AddTransactionProps {
    users: User[];
    onAddTransaction: (transaction: TransactionInput) => Promise<boolean>;
    onAddPayment: (payment: PaymentInput) => Promise<boolean>;
}

type TransactionType = 'expense' | 'payment';

interface FormData {
    payer_id: string;
    to_user_id: string;
    amount: string;
    description: string;
    date: string;
}

const AddTransaction: React.FC<AddTransactionProps> = ({ users, onAddTransaction, onAddPayment }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [transactionType, setTransactionType] = useState<TransactionType>('expense');
    const [formData, setFormData] = useState<FormData>({
        payer_id: '',
        to_user_id: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (isSubmitting) return; // 送信中は処理しない
        setIsSubmitting(true);

        try {
            let success = false;
            if (transactionType === 'expense') {
                if (!formData.payer_id || !formData.amount || !formData.description) {
                    setIsSubmitting(false);
                    return;
                }
                success = await onAddTransaction({
                    payer_id: parseInt(formData.payer_id),
                    amount: parseFloat(formData.amount),
                    description: formData.description,
                    date: formData.date
                });
            } else {
                if (!formData.payer_id || !formData.to_user_id || !formData.amount) {
                    setIsSubmitting(false);
                    return;
                }
                success = await onAddPayment({
                    from_user_id: parseInt(formData.payer_id),
                    to_user_id: parseInt(formData.to_user_id),
                    amount: parseFloat(formData.amount),
                    description: formData.description,
                    date: formData.date
                });
            }

            if (success) {
                setFormData({
                    payer_id: '',
                    to_user_id: '',
                    amount: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0]
                });
                setIsOpen(false);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1rem',
                marginBottom: '1.5rem',
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-lg)'
            }}>
                <button
                    className="btn"
                    onClick={() => {
                        setTransactionType('expense');
                        setIsOpen(true);
                    }}
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        padding: '1rem 1.5rem',
                        fontSize: '1rem'
                    }}
                >
                    <Receipt size={20} />
                    経費を追加
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={() => {
                        setTransactionType('payment');
                        setIsOpen(true);
                    }}
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        padding: '1rem 1.5rem',
                        fontSize: '1rem'
                    }}
                >
                    <DollarSign size={20} />
                    返済を記録
                </button>
            </div>
        );
    }

    return (
        <div className="card animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                {transactionType === 'expense' ? (
                    <>
                        <Receipt size={24} style={{ color: 'var(--primary)' }} />
                        <h3 style={{ margin: 0 }}>新しい経費</h3>
                    </>
                ) : (
                    <>
                        <DollarSign size={24} style={{ color: 'var(--success)' }} />
                        <h3 style={{ margin: 0 }}>返済を記録</h3>
                    </>
                )}
            </div>

            {/* Type Switcher */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                padding: '0.25rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-md)'
            }}>
                <button
                    type="button"
                    onClick={() => setTransactionType('expense')}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        background: transactionType === 'expense' ? 'var(--primary)' : 'transparent',
                        color: transactionType === 'expense' ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontWeight: '600'
                    }}
                >
                    経費
                </button>
                <button
                    type="button"
                    onClick={() => setTransactionType('payment')}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        background: transactionType === 'payment' ? 'var(--success)' : 'transparent',
                        color: transactionType === 'payment' ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontWeight: '600'
                    }}
                >
                    返済
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                    <label>{transactionType === 'expense' ? '誰が支払いましたか？' : '支払った人'}</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {users.map(u => (
                            <div
                                key={u.id}
                                onClick={() => setFormData({ ...formData, payer_id: u.id.toString() })}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${formData.payer_id === u.id.toString() ? (transactionType === 'expense' ? 'var(--primary)' : 'var(--success)') : 'var(--glass-border)'}`,
                                    background: formData.payer_id === u.id.toString() ? (transactionType === 'expense' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)') : 'rgba(255,255,255,0.05)',
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

                {transactionType === 'payment' && (
                    <div>
                        <label>受け取った人</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {users.filter(u => u.id.toString() !== formData.payer_id).map(u => (
                                <div
                                    key={u.id}
                                    onClick={() => setFormData({ ...formData, to_user_id: u.id.toString() })}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: `1px solid ${formData.to_user_id === u.id.toString() ? 'var(--success)' : 'var(--glass-border)'}`,
                                        background: formData.to_user_id === u.id.toString() ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
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
                )}

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
                    <label>内容{transactionType === 'payment' && '（任意）'}</label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder={transactionType === 'expense' ? '例: 家賃、食費' : '例: 家賃の返済'}
                        required={transactionType === 'expense'}
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
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsOpen(false)}
                        style={{ flex: 1 }}
                        disabled={isSubmitting}
                    >
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        className="btn"
                        style={{ flex: 1 }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '送信中...' : '保存'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTransaction;
