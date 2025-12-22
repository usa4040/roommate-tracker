/**
 * API設定の一元管理
 * 
 * このファイルでAPI URLとエンドポイントを一元管理することで、
 * 各ファイルでの不整合（例: /api/api/... 問題）を防ぎます。
 */

// ベースURL（環境変数から取得、または開発用デフォルト）
// 重要: VITE_API_URL には /api を含める想定
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Socket.IO用のベースURL（/api を除いたURL）
export const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');

/**
 * APIエンドポイントの定義
 * 
 * すべてのエンドポイントはここで定義し、
 * 他のファイルからはこれをインポートして使用する
 */
export const ENDPOINTS = {
    // 認証関連
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        ME: '/auth/me',
        LOGOUT: '/auth/logout',
    },
    // ユーザー関連
    USERS: '/users',
    USER_BY_ID: (id: number | string) => `/users/${id}`,
    // 取引関連
    TRANSACTIONS: '/transactions',
    TRANSACTION_BY_ID: (id: number | string) => `/transactions/${id}`,
    // 支払い関連
    PAYMENTS: '/payments',
    PAYMENT_BY_ID: (id: number | string) => `/payments/${id}`,
    // 残高
    BALANCE: '/balance',
} as const;

/**
 * 完全なAPIのURLを構築するヘルパー関数
 */
export function buildApiUrl(endpoint: string): string {
    return `${API_BASE_URL}${endpoint}`;
}

/**
 * URL構築の検証用（テストで使用）
 * URLに二重パス（/api/api/）が含まれていないことを確認
 */
export function isValidApiUrl(url: string): boolean {
    return !url.includes('/api/api/');
}
