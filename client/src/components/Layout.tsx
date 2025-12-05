import React from 'react';
import { Wallet } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
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

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {/* Future Nav or User Profile */}
                </div>
            </header>
            <main>
                {children}
            </main>
        </div>
    );
};

export default Layout;
