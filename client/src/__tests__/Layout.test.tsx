import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Layout from '../components/Layout';

describe('Layout Component', () => {
    it('ヘッダーが正しく表示される', () => {
        render(
            <Layout>
                <div>テストコンテンツ</div>
            </Layout>
        );

        expect(screen.getByText('ルームメイト支払い管理')).toBeInTheDocument();
    });

    it('子要素が正しく表示される', () => {
        render(
            <Layout>
                <div>テストコンテンツ</div>
            </Layout>
        );

        expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
    });

    it('ヘッダーにアイコンが表示される', () => {
        const { container } = render(
            <Layout>
                <div>テストコンテンツ</div>
            </Layout>
        );

        // Check if SVG icon exists
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });
});
