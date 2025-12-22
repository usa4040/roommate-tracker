import React from 'react';
import TransactionList from '../components/TransactionList';
import type { Transaction, Payment, User, TransactionInput, PaymentInput } from '../types';

interface TransactionsPageProps {
    transactions: Transaction[];
    payments: Payment[];
    users: User[];
    onDeleteTransaction: (id: number) => Promise<boolean>;
    onDeletePayment: (id: number) => Promise<boolean>;
    onUpdateTransaction: (id: number, transaction: TransactionInput) => Promise<boolean>;
    onUpdatePayment: (id: number, payment: PaymentInput) => Promise<boolean>;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({
    transactions,
    payments,
    users,
    onDeleteTransaction,
    onDeletePayment,
    onUpdateTransaction,
    onUpdatePayment
}) => {
    return (
        <div className="page-container">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>取引一覧</h2>
            <TransactionList
                transactions={transactions}
                payments={payments}
                users={users}
                onDeleteTransaction={onDeleteTransaction}
                onDeletePayment={onDeletePayment}
                onUpdateTransaction={onUpdateTransaction}
                onUpdatePayment={onUpdatePayment}
            />
        </div>
    );
};

export default TransactionsPage;
