import React from 'react';
import Dashboard from '../components/Dashboard';
import type { Balance, User } from '../types';

interface DashboardPageProps {
    balance: Balance[];
    users: User[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ balance, users }) => {
    return (
        <div className="page-container">
            <Dashboard balance={balance} users={users} />
        </div>
    );
};

export default DashboardPage;
