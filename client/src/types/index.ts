// User types
export interface User {
    id: number;
    name: string;
    avatar?: string;
}

// Transaction types
export interface Transaction {
    id: number;
    payer_id: number;
    payer_name: string;
    amount: number;
    description: string;
    date: string;
    type?: 'transaction';
}

export interface TransactionInput {
    payer_id: number;
    amount: number;
    description: string;
    date: string;
}

// Payment types
export interface Payment {
    id: number;
    from_user_id: number;
    from_user_name: string;
    to_user_id: number;
    to_user_name: string;
    amount: number;
    description?: string;
    date: string;
    type?: 'payment';
}

export interface PaymentInput {
    from_user_id: number;
    to_user_id: number;
    amount: number;
    description?: string;
    date: string;
}

// Balance types
export interface Balance {
    user_id: number;
    paid: number;
    owed: number;
    diff: number;
}

// Combined types for transaction list
export type TransactionOrPayment = (Transaction & { type: 'transaction' }) | (Payment & { type: 'payment' });

// API Response types
export interface ApiResponse<T> {
    data: T;
    error?: string;
}

// Hook return types
export interface UseDataReturn {
    users: User[];
    transactions: Transaction[];
    payments: Payment[];
    balance: Balance[];
    loading: boolean;
    error: string | null;
    addTransaction: (transaction: TransactionInput) => Promise<boolean>;
    updateTransaction: (id: number, transaction: TransactionInput) => Promise<boolean>;
    addUser: (name: string) => Promise<boolean>;
    updateUser: (id: number, name: string) => Promise<boolean>;
    deleteUser: (id: number) => Promise<boolean>;
    deleteTransaction: (id: number) => Promise<boolean>;
    addPayment: (payment: PaymentInput) => Promise<boolean>;
    updatePayment: (id: number, payment: PaymentInput) => Promise<boolean>;
    deletePayment: (id: number) => Promise<boolean>;
    refresh: () => Promise<void>;
}
