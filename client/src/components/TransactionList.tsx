import React, { useState, useMemo } from 'react';
import { Calendar, User, Trash2, ArrowRight, Receipt, Edit2, Check, X, Search, Filter, SortAsc, SortDesc, FileJson, FileSpreadsheet, BarChart3 } from 'lucide-react';
import type { Transaction, Payment, TransactionOrPayment, TransactionInput, PaymentInput } from '../types';
import { exportToCSV, exportToJSON, exportSummary, generateFilename } from '../utils/export';

interface TransactionListProps {
    transactions: Transaction[];
    payments: Payment[];
    users: { id: number; name: string }[];
    onDeleteTransaction: (id: number) => Promise<boolean>;
    onDeletePayment: (id: number) => Promise<boolean>;
    onUpdateTransaction: (id: number, transaction: TransactionInput) => Promise<boolean>;
    onUpdatePayment: (id: number, payment: PaymentInput) => Promise<boolean>;
}

type DeleteType = 'transaction' | 'payment';
type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

const TransactionList: React.FC<TransactionListProps> = ({
    transactions,
    payments,
    users,
    onDeleteTransaction,
    onDeletePayment,
    onUpdateTransaction,
    onUpdatePayment
}) => {
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [deleteType, setDeleteType] = useState<DeleteType | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingType, setEditingType] = useState<DeleteType | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    // Filter and search states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'transaction' | 'payment'>('all');
    const [filterUser, setFilterUser] = useState<number | 'all'>('all');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Combine, filter, search, and sort items
    const filteredAndSortedItems = useMemo(() => {
        let items: TransactionOrPayment[] = [
            ...(transactions || []).map(t => ({ ...t, type: 'transaction' as const })),
            ...(payments || []).map(p => ({ ...p, type: 'payment' as const }))
        ];

        // Apply type filter
        if (filterType !== 'all') {
            items = items.filter(item => item.type === filterType);
        }

        // Apply user filter
        if (filterUser !== 'all') {
            items = items.filter(item => {
                if (item.type === 'transaction') {
                    return item.payer_id === filterUser;
                } else {
                    return item.from_user_id === filterUser || item.to_user_id === filterUser;
                }
            });
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item => {
                const description = item.description?.toLowerCase() || '';
                return description.includes(query);
            });
        }

        // Apply sorting
        items.sort((a, b) => {
            let comparison = 0;

            if (sortField === 'date') {
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (sortField === 'amount') {
                comparison = a.amount - b.amount;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return items;
    }, [transactions, payments, filterType, filterUser, searchQuery, sortField, sortOrder]);

    const handleDelete = async (): Promise<void> => {
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

    const openDeleteConfirm = (id: number, type: DeleteType): void => {
        setDeleteConfirmId(id);
        setDeleteType(type);
    };

    const startEdit = (item: TransactionOrPayment): void => {
        setEditingId(item.id);
        setEditingType(item.type);

        if (item.type === 'transaction') {
            setEditForm({
                payer_id: item.payer_id,
                amount: item.amount,
                description: item.description,
                date: item.date
            });
        } else {
            setEditForm({
                from_user_id: item.from_user_id,
                to_user_id: item.to_user_id,
                amount: item.amount,
                description: item.description || '',
                date: item.date
            });
        }
    };

    const cancelEdit = (): void => {
        setEditingId(null);
        setEditingType(null);
        setEditForm({});
    };

    const saveEdit = async (): Promise<void> => {
        if (editingId && editingType) {
            let success = false;
            if (editingType === 'transaction') {
                success = await onUpdateTransaction(editingId, editForm);
            } else {
                success = await onUpdatePayment(editingId, editForm);
            }

            if (success) {
                cancelEdit();
            }
        }
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleExportCSV = () => {
        const filename = generateFilename('transactions', 'csv');
        exportToCSV(filteredAndSortedItems, filename);
    };

    const handleExportJSON = () => {
        const filename = generateFilename('transactions', 'json');
        exportToJSON(filteredAndSortedItems, filename);
    };

    const handleExportSummary = () => {
        const filename = generateFilename('summary', 'json');
        exportSummary(filteredAndSortedItems, users, filename);
    };

    return (
        <div className="card animate-fade-in">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
            }}>
                <h3 style={{ margin: 0 }}>最近の取引</h3>

                {/* Export buttons */}
                <div className="flex-wrap-mobile" style={{ gap: '0.5rem' }}>
                    <button
                        onClick={handleExportCSV}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--success)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                        title="CSVでエクスポート"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
                        }}
                    >
                        <FileSpreadsheet size={16} />
                        <span className="hide-on-mobile">CSV</span>
                    </button>

                    <button
                        onClick={handleExportJSON}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                        title="JSONでエクスポート"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                        }}
                    >
                        <FileJson size={16} />
                        <span className="hide-on-mobile">JSON</span>
                    </button>

                    <button
                        onClick={handleExportSummary}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(168, 85, 247, 0.1)',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#a855f7',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                        title="サマリーをエクスポート"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
                        }}
                    >
                        <BarChart3 size={16} />
                        <span className="hide-on-mobile">サマリー</span>
                    </button>
                </div>
            </div>

            {/* Filter and Search UI */}
            <div style={{
                display: 'grid',
                gap: '0.75rem',
                marginBottom: '1rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={18} style={{ color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="内容で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>

                {/* Filters */}
                <div className="grid-3-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    {/* Type Filter */}
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                            <Filter size={14} />
                            種類
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as 'all' | 'transaction' | 'payment')}
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                        >
                            <option value="all">全て</option>
                            <option value="transaction">経費のみ</option>
                            <option value="payment">返済のみ</option>
                        </select>
                    </div>

                    {/* User Filter */}
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                            <User size={14} />
                            ユーザー
                        </label>
                        <select
                            value={filterUser}
                            onChange={(e) => setFilterUser(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                        >
                            <option value="all">全員</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort */}
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                            {sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
                            並び替え
                        </label>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <select
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value as SortField)}
                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                            >
                                <option value="date">日付</option>
                                <option value="amount">金額</option>
                            </select>
                            <button
                                onClick={toggleSortOrder}
                                style={{
                                    padding: '0.5rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)'
                                }}
                                title={sortOrder === 'asc' ? '昇順' : '降順'}
                            >
                                {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results count */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {filteredAndSortedItems.length} 件の取引
                </div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {filteredAndSortedItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        {searchQuery || filterType !== 'all' || filterUser !== 'all'
                            ? '条件に一致する取引がありません。'
                            : 'まだ取引がありません。'}
                    </div>
                )}
                {filteredAndSortedItems.map((item) => {
                    const isPayment = item.type === 'payment';
                    const key = `${item.type} -${item.id} `;
                    const isEditing = editingId === item.id && editingType === item.type;

                    if (isEditing) {
                        // Edit mode
                        return (
                            <div key={key} style={{
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: `3px solid ${isPayment ? 'var(--success)' : 'var(--primary)'} `,
                            }}>
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    {isPayment ? (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>支払った人</label>
                                                    <select
                                                        value={editForm.from_user_id}
                                                        onChange={(e) => setEditForm({ ...editForm, from_user_id: parseInt(e.target.value) })}
                                                        style={{ width: '100%', marginTop: '0.25rem' }}
                                                    >
                                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>受け取った人</label>
                                                    <select
                                                        value={editForm.to_user_id}
                                                        onChange={(e) => setEditForm({ ...editForm, to_user_id: parseInt(e.target.value) })}
                                                        style={{ width: '100%', marginTop: '0.25rem' }}
                                                    >
                                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>支払った人</label>
                                            <select
                                                value={editForm.payer_id}
                                                onChange={(e) => setEditForm({ ...editForm, payer_id: parseInt(e.target.value) })}
                                                style={{ width: '100%', marginTop: '0.25rem' }}
                                            >
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>金額</label>
                                            <input
                                                type="number"
                                                value={editForm.amount}
                                                onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                                                style={{ width: '100%', marginTop: '0.25rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>日付</label>
                                            <input
                                                type="date"
                                                value={editForm.date}
                                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                style={{ width: '100%', marginTop: '0.25rem' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>内容</label>
                                        <input
                                            type="text"
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            style={{ width: '100%', marginTop: '0.25rem' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={cancelEdit}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                        >
                                            <X size={16} style={{ marginRight: '0.25rem' }} />
                                            キャンセル
                                        </button>
                                        <button
                                            onClick={saveEdit}
                                            className="btn"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                        >
                                            <Check size={16} style={{ marginRight: '0.25rem' }} />
                                            保存
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // View mode
                    return (
                        <div key={key} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: `3px solid ${isPayment ? 'var(--success)' : 'var(--primary)'} `,
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    color: isPayment ? 'var(--success)' : 'inherit'
                                }}>
                                    {isPayment && '+'}{item.amount.toLocaleString()}円
                                </div>
                                <button
                                    onClick={() => startEdit(item)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary)',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        opacity: 0.6,
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                                    title="編集"
                                >
                                    <Edit2 size={16} />
                                </button>
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
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
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
