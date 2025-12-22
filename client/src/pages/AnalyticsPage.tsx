import React from 'react';
import Charts from '../components/Charts';
import type { Transaction, Payment, User } from '../types';

interface AnalyticsPageProps {
    transactions: Transaction[];
    payments: Payment[];
    users: User[];
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ transactions, payments, users }) => {
    return (
        <div className="page-container">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>分析</h2>
            <Charts
                transactions={transactions}
                payments={payments}
                users={users}
            />
        </div>
    );
};

export default AnalyticsPage;
