import React, { useState, useMemo } from 'react';
import { Calendar, User, Trash2, ArrowRight, Receipt, Edit2, Check, X, Search, SortAsc, SortDesc, FileJson, FileSpreadsheet, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
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

    // Date range filter states
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [datePreset, setDatePreset] = useState<string>('all');

    // Filter expansion state
    const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

    // Date preset handler
    const handleDatePreset = (preset: string) => {
        setDatePreset(preset);
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        switch (preset) {
            case 'today':
                const todayStr = today.toISOString().split('T')[0];
                setDateFrom(todayStr);
                setDateTo(todayStr);
                break;
            case 'thisWeek':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                setDateFrom(weekStart.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
                break;
            case 'thisMonth':
                const monthStart = new Date(year, month, 1);
                setDateFrom(monthStart.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
                break;
            case 'lastMonth':
                const lastMonthStart = new Date(year, month - 1, 1);
                const lastMonthEnd = new Date(year, month, 0);
                setDateFrom(lastMonthStart.toISOString().split('T')[0]);
                setDateTo(lastMonthEnd.toISOString().split('T')[0]);
                break;
            case 'last3Months':
                const threeMonthsAgo = new Date(year, month - 3, 1);
                setDateFrom(threeMonthsAgo.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
                break;
            case 'last6Months':
                const sixMonthsAgo = new Date(year, month - 6, 1);
                setDateFrom(sixMonthsAgo.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
                break;
            case 'thisYear':
                const yearStart = new Date(year, 0, 1);
                setDateFrom(yearStart.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
                break;
            case 'all':
            default:
                setDateFrom('');
                setDateTo('');
                break;
        }
    };

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

        // Apply date range filter
        if (dateFrom) {
            items = items.filter(item => item.date >= dateFrom);
        }
        if (dateTo) {
            items = items.filter(item => item.date <= dateTo);
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
    }, [transactions, payments, filterType, filterUser, searchQuery, sortField, sortOrder, dateFrom, dateTo]);

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
            {/* Export Buttons Row */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginBottom: '0.75rem',
                gap: '0.5rem'
            }}>
                <button
                    onClick={handleExportCSV}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.4rem 0.6rem',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-dim)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                    title="CSVでエクスポート"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-surface)';
                    }}
                >
                    <FileSpreadsheet size={12} />
                    CSV
                </button>

                <button
                    onClick={handleExportJSON}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.4rem 0.6rem',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-dim)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                    title="JSONでエクスポート"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-surface)';
                    }}
                >
                    <FileJson size={12} />
                    JSON
                </button>

                <button
                    onClick={handleExportSummary}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.4rem 0.6rem',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-dim)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                    title="サマリーをエクスポート"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-surface)';
                    }}
                >
                    <BarChart3 size={12} />
                    サマリー
                </button>
            </div>

            {/* Search Row: Search bar + Type/User dropdowns + Filter expand button */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                alignItems: 'center'
            }}>
                {/* Search */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flex: '1 1 150px',
                    minWidth: '120px',
                    padding: '0.4rem 0.6rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-dim)',
                    borderRadius: 'var(--radius-sm)'
                }}>
                    <Search size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: '50px',
                            padding: '0.2rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Type Filter */}
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'all' | 'transaction' | 'payment')}
                    style={{
                        padding: '0.4rem 0.5rem',
                        fontSize: '0.8rem',
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border-dim)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        flexShrink: 0,
                        width: 'auto',
                        cursor: 'pointer'
                    }}
                >
                    <option value="all" style={{ background: 'var(--input-bg)', color: 'var(--text-primary)' }}>種類 ▼</option>
                    <option value="transaction" style={{ background: 'var(--input-bg)', color: 'var(--text-primary)' }}>経費</option>
                    <option value="payment" style={{ background: 'var(--input-bg)', color: 'var(--text-primary)' }}>返済</option>
                </select>

                {/* User Filter */}
                <select
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    style={{
                        padding: '0.4rem 0.5rem',
                        fontSize: '0.8rem',
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border-dim)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        flexShrink: 0,
                        width: 'auto',
                        cursor: 'pointer'
                    }}
                >
                    <option value="all" style={{ background: 'var(--input-bg)', color: 'var(--text-primary)' }}>ユーザー ▼</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id} style={{ background: 'var(--input-bg)', color: 'var(--text-primary)' }}>{user.name}</option>
                    ))}
                </select>

                {/* Spacer */}
                <div style={{ flex: '1 1 auto', minWidth: '0' }}></div>

                {/* Expand/Collapse Filter Button */}
                <button
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.4rem 0.6rem',
                        background: isFilterExpanded ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: isFilterExpanded ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius-sm)',
                        color: isFilterExpanded ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {isFilterExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    フィルター展開
                </button>
            </div>

            {/* Expandable Date Range Filter */}
            {isFilterExpanded && (
                <div style={{
                    marginBottom: '0.75rem',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <label style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginBottom: '0.5rem',
                        fontWeight: 600
                    }}>
                        📅 期間フィルター
                    </label>

                    {/* Date Presets */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '0.75rem'
                    }}>
                        {[
                            { value: 'all', label: '全期間' },
                            { value: 'today', label: '今日' },
                            { value: 'thisWeek', label: '今週' },
                            { value: 'thisMonth', label: '今月' },
                            { value: 'lastMonth', label: '先月' },
                            { value: 'last3Months', label: '過去3ヶ月' },
                            { value: 'last6Months', label: '過去6ヶ月' },
                            { value: 'thisYear', label: '今年' }
                        ].map(preset => (
                            <button
                                key={preset.value}
                                onClick={() => handleDatePreset(preset.value)}
                                style={{
                                    padding: '0.375rem 0.75rem',
                                    fontSize: '0.8rem',
                                    background: datePreset === preset.value
                                        ? 'rgba(139, 92, 246, 0.2)'
                                        : 'rgba(255,255,255,0.05)',
                                    border: datePreset === preset.value
                                        ? '1px solid rgba(139, 92, 246, 0.5)'
                                        : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: datePreset === preset.value
                                        ? 'var(--accent-primary)'
                                        : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                    if (datePreset !== preset.value) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (datePreset !== preset.value) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    }
                                }}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom Date Range */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                            <label style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '0.25rem',
                                display: 'block'
                            }}>
                                開始日
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    setDatePreset('custom');
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    fontSize: '0.85rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '0.25rem',
                                display: 'block'
                            }}>
                                終了日
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    setDatePreset('custom');
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    fontSize: '0.85rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <label style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            marginBottom: '0.5rem',
                            fontWeight: 600
                        }}>
                            <SortAsc size={14} /> 並び替え
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value as SortField)}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    fontSize: '0.85rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                <option value="date">日付</option>
                                <option value="amount">金額</option>
                            </select>
                            <button
                                onClick={toggleSortOrder}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.5rem 0.75rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
                                {sortOrder === 'asc' ? '昇順' : '降順'}
                            </button>
                            <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {filteredAndSortedItems.length} 件の取引
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                background: 'var(--bg-surface)',
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
                            background: 'var(--bg-surface)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: `3px solid ${isPayment ? 'var(--success)' : 'var(--primary)'} `,
                            borderBottom: '1px solid var(--border-dim)',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-surface-hover)';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--bg-surface)';
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
