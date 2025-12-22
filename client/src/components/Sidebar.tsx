import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Wallet,
    LayoutDashboard,
    Receipt,
    PlusCircle,
    Users,
    BarChart3,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { path: '/', label: 'ダッシュボード', icon: <LayoutDashboard size={20} /> },
    { path: '/transactions', label: '取引一覧', icon: <Receipt size={20} /> },
    { path: '/add', label: '入力', icon: <PlusCircle size={20} /> },
    { path: '/members', label: 'メンバー', icon: <Users size={20} /> },
    { path: '/analytics', label: '分析', icon: <BarChart3 size={20} /> },
];

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        if (confirm('ログアウトしますか？')) {
            await logout();
        }
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Mobile toggle button */}
            <button
                className="sidebar-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={closeSidebar}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Wallet color="white" size={24} />
                    </div>
                    <h1 className="sidebar-title">支払い管理</h1>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-nav-item ${isActive ? 'active' : ''}`
                            }
                            onClick={closeSidebar}
                            end={item.path === '/'}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {user && (
                        <>
                            <div className="sidebar-user">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="sidebar-user-avatar"
                                />
                                <div className="sidebar-user-info">
                                    <p className="sidebar-user-name">{user.name}</p>
                                    <p className="sidebar-user-role">
                                        {user.role === 'admin' ? '管理者' : 'ユーザー'}
                                    </p>
                                </div>
                            </div>
                            <button className="sidebar-logout" onClick={handleLogout}>
                                <LogOut size={16} />
                                <span>ログアウト</span>
                            </button>
                        </>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
