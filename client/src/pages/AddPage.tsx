import React from 'react';
import AddTransaction from '../components/AddTransaction';
import type { User, TransactionInput, PaymentInput } from '../types';

interface AddPageProps {
    users: User[];
    onAddTransaction: (transaction: TransactionInput) => Promise<boolean>;
    onAddPayment: (payment: PaymentInput) => Promise<boolean>;
}

const AddPage: React.FC<AddPageProps> = ({ users, onAddTransaction, onAddPayment }) => {
    return (
        <div className="page-container">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>入力</h2>
            <AddTransaction
                users={users}
                onAddTransaction={onAddTransaction}
                onAddPayment={onAddPayment}
            />
        </div>
    );
};

export default AddPage;
