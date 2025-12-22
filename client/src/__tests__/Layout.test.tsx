import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Layout from '../components/Layout';
import { AuthProvider } from '../contexts/AuthContext';

// API のモック
vi.mock('../api/auth', () => ({
    authAPI: {
        getCurrentUser: vi.fn().mockResolvedValue(null),
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
    }
}));

// AuthProvider でラップするヘルパー関数
const renderWithAuth = (children: React.ReactNode) => {
    return render(
        <AuthProvider>
            {children}
        </AuthProvider>
    );
};

describe('Layout Component', () => {
    it('ヘッダーが正しく表示される', () => {
        renderWithAuth(
            <Layout>
                <div>テストコンテンツ</div>
            </Layout>
        );

        expect(screen.getByText('ルームメイト支払い管理')).toBeInTheDocument();
    });

    it('子要素が正しく表示される', () => {
        renderWithAuth(
            <Layout>
                <div>テストコンテンツ</div>
            </Layout>
        );

        expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
    });

    it('ヘッダーにアイコンが表示される', () => {
        const { container } = renderWithAuth(
            <Layout>
                <div>テストコンテンツ</div>
            </Layout>
        );

        // Check if SVG icon exists
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });
});
