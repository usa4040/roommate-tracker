import React, { useState } from 'react';
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

            {/* Custom Confirmation Modal */}
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
                        <h4 style={{ marginBottom: '1rem' }}>ユーザーを削除しますか？</h4>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                            本当にこのユーザーを削除しますか？この操作は元に戻せません。
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)} style={{ flex: 1 }}>
                                キャンセル
                            </button>
                            <button className="btn" onClick={confirmDelete} style={{ flex: 1, background: '#ef4444' }}>
                                削除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
