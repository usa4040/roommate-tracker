// Shared types between frontend and backend

// User types
export interface User {
    id: number;
    name: string;
    avatar?: string;
}

export interface UserInput {
    name: string;
}

// Transaction types
export interface Transaction {
    id: number;
    payer_id: number;
    payer_name: string;
    amount: number;
    description: string;
    date: string;
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

// API Response types
export interface ApiResponse<T> {
    data: T;
    error?: string;
}

export interface ApiError {
    error: string;
}

// Database row types (from SQLite)
export interface UserRow {
    id: number;
    name: string;
    avatar: string | null;
}

export interface TransactionRow {
    id: number;
    payer_id: number;
    amount: number;
    description: string;
    date: string;
}

export interface PaymentRow {
    id: number;
    from_user_id: number;
    to_user_id: number;
    amount: number;
    description: string | null;
    date: string;
}

export interface BalanceRow {
    payer_id: number;
    total_paid: number;
}
