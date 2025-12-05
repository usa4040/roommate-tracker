import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        if (confirm('ログアウトしますか？')) {
            await logout();
        }
    };

    return (
        <div className="container animate-fade-in">
            <header style={{
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        background: 'var(--accent-gradient)',
                        padding: '0.5rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Wallet color="white" size={24} />
                    </div>
                    <h1 style={{
                        margin: 0,
                        fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                        whiteSpace: 'nowrap'
                    }}>
                        ルームメイト支払い管理
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {user && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        border: '2px solid rgba(139, 92, 246, 0.5)'
                                    }}
                                />
                                <div className="hide-on-mobile">
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {user.role === 'admin' ? '管理者' : 'ユーザー'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: '#f87171',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                            >
                                <LogOut size={16} />
                                <span className="hide-on-mobile">ログアウト</span>
                            </button>
                        </>
                    )}
                </div>
            </header>
            <main>
                {children}
            </main>
        </div>
    );
};

export default Layout;
