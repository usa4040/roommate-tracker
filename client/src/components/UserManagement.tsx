import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, Users } from 'lucide-react';
import type { User } from '../types';

interface UserManagementProps {
    users: User[];
    onAddUser: (name: string) => Promise<boolean>;
    onUpdateUser: (id: number, name: string) => Promise<boolean>;
    onDeleteUser: (id: number) => Promise<boolean>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState<string>('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!newName.trim()) return;

        const success = await onAddUser(newName);
        if (success) {
            setNewName('');
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!editName.trim()) return;

        const success = await onUpdateUser(editingId!, editName);
        if (success) {
            setEditingId(null);
            setEditName('');
        }
    };

    const confirmDelete = async (): Promise<void> => {
        if (deleteConfirmId) {
            const success = await onDeleteUser(deleteConfirmId);
            if (!success) {
                alert('ユーザーの削除に失敗しました。');
            }
            setDeleteConfirmId(null);
        }
    };

    const startEdit = (user: User): void => {
        setEditingId(user.id);
        setEditName(user.name);
    };

    return (
        <div className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={20} /> ルームメイト
                </h3>
                <button
                    className="btn btn-secondary"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                >
                    <UserPlus size={16} />
                </button>
            </div>

            {isOpen && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="名前を入力..."
                        autoFocus
                    />
                    <button type="submit" className="btn" style={{ whiteSpace: 'nowrap' }}>
                        追加
                    </button>
                </form>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {users.map(u => (
                    <div key={u.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative'
                    }}>
                        {editingId === u.id ? (
                            <form onSubmit={handleUpdate} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem', width: '100px' }}
                                    autoFocus
                                />
                                <button type="submit" className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>保存</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>キャンセル</button>
                            </form>
                        ) : (
                            <>
                                <img src={u.avatar} alt={u.name} style={{ width: 24, height: 24, borderRadius: '50%', background: '#334155' }} />
                                <span
                                    style={{ fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}
                                    onClick={() => startEdit(u)}
                                    title="クリックで編集"
                                >
                                    {u.name}
                                </span>
                                <button
                                    onClick={() => setDeleteConfirmId(u.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#f87171',
                                        cursor: 'pointer',
                                        marginLeft: '0.5rem',
                                        opacity: 0.6,
                                        fontSize: '1.2rem',
                                        lineHeight: 1
                                    }}
                                    title="ユーザーを削除"
                                >
                                    &times;
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Custom Confirmation Modal - Using Portal to render at document.body */}
            {deleteConfirmId && createPortal(
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '380px',
                        margin: '1rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                        border: '1px solid var(--glass-border)',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        {/* Warning Icon */}
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                            border: '2px solid rgba(239, 68, 68, 0.3)'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                        </div>

                        <h4 style={{
                            marginBottom: '0.75rem',
                            textAlign: 'center',
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                        }}>
                            ユーザーを削除しますか？
                        </h4>
                        <p style={{
                            marginBottom: '1.75rem',
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                            fontSize: '0.95rem',
                            lineHeight: 1.5
                        }}>
                            この操作は取り消せません。<br />
                            関連するすべてのデータが削除されます。
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDeleteConfirmId(null)}
                                style={{
                                    flex: 1,
                                    minWidth: '120px',
                                    whiteSpace: 'nowrap',
                                    padding: '0.875rem 1rem',
                                    textAlign: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                キャンセル
                            </button>
                            <button
                                className="btn"
                                onClick={confirmDelete}
                                style={{
                                    flex: 1,
                                    minWidth: '120px',
                                    whiteSpace: 'nowrap',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    padding: '0.875rem 1rem',
                                    textAlign: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                削除する
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default UserManagement;
