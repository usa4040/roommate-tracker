import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Layout from '../components/Layout';
// Import the context directly, not the default export
import { AuthContext } from '../contexts/AuthContext';

// Mock AuthContext
const mockAuthContext = {
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
    loading: false, // Changed from isLoading to loading to match interface
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    isAuthenticated: true,
};

const renderWithAuth = (ui: React.ReactNode) => {
    // @ts-ignore - Mocking context for testing
    return render(
        <AuthContext.Provider value={mockAuthContext}>
            {ui}
        </AuthContext.Provider>
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
