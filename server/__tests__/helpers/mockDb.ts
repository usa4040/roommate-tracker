/**
 * データベースモックヘルパー
 * テスト時にインメモリのモックデータベースを提供
 */

export interface MockUser {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: string;
    avatar: string;
}

export interface MockTransaction {
    id: number;
    payer_id: number;
    amount: number;
    description: string;
    date: string;
}

export interface MockPayment {
    id: number;
    from_user_id: number;
    to_user_id: number;
    amount: number;
    description: string;
    date: string;
}

export interface MockDatabase {
    users: MockUser[];
    transactions: MockTransaction[];
    payments: MockPayment[];
}

/**
 * モックデータベースを作成
 */
export const createMockDatabase = (): MockDatabase => ({
    users: [
        {
            id: 1,
            name: 'テストユーザー1',
            email: 'test1@example.com',
            password_hash: '$2b$10$hashedpassword1',
            role: 'admin',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test1'
        },
        {
            id: 2,
            name: 'テストユーザー2',
            email: 'test2@example.com',
            password_hash: '$2b$10$hashedpassword2',
            role: 'user',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test2'
        }
    ],
    transactions: [],
    payments: []
});

/**
 * SQLiteスタイルのモックDBオブジェクトを作成
 */
export const createMockDbObject = (database: MockDatabase) => {
    return {
        get: jest.fn((sql: string, params: any[], callback: (err: Error | null, row: any) => void) => {
            // ユーザー取得のモック
            if (sql.includes('SELECT') && sql.includes('users')) {
                if (sql.includes('email = ?')) {
                    const email = params[0];
                    const user = database.users.find(u => u.email === email);
                    callback(null, user || null);
                } else if (sql.includes('id = ?')) {
                    const id = params[0];
                    const user = database.users.find(u => u.id === id);
                    callback(null, user || null);
                }
            } else {
                callback(null, null);
            }
        }),
        run: jest.fn(function (this: any, sql: string, params: any[], callback: (err: Error | null) => void) {
            // INSERT/UPDATE/DELETE のモック
            if (sql.includes('INSERT INTO users')) {
                const newUser: MockUser = {
                    id: database.users.length + 1,
                    name: params[0],
                    email: params[1],
                    password_hash: params[2],
                    role: params[3] || 'user',
                    avatar: params[4] || ''
                };
                database.users.push(newUser);
                this.lastID = newUser.id;
                this.changes = 1;
            }
            callback(null);
        }),
        all: jest.fn((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void) => {
            if (sql.includes('users')) {
                callback(null, database.users);
            } else if (sql.includes('transactions')) {
                callback(null, database.transactions);
            } else if (sql.includes('payments')) {
                callback(null, database.payments);
            } else {
                callback(null, []);
            }
        })
    };
};
