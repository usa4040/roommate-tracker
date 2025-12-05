import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Charts from './components/Charts';
import AddTransaction from './components/AddTransaction';
import TransactionList from './components/TransactionList';
import UserManagement from './components/UserManagement';
import ConnectionStatus from './components/ConnectionStatus';
import AuthPage from './components/AuthPage';
import { useData } from './hooks/useData';

function AppContent() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const {
        users,
        transactions,
        payments,
        balance,
        loading,
        error,
        addTransaction,
        updateTransaction,
        addUser,
        updateUser,
        deleteUser,
        deleteTransaction,
        addPayment,
        updatePayment,
        deletePayment
    } = useData();

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="animate-fade-in" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                    読み込み中...
                </div>
            </div>
        );
    }

    // Show auth page if not authenticated
    if (!isAuthenticated) {
        return <AuthPage />;
    }

    // Show loading while fetching data
    if (loading) {
        return (
            <Layout>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="animate-fade-in" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                        読み込み中...
                    </div>
                </div>
            </Layout>
        );
    }

    // Show error if data fetch failed
    if (error) {
        return (
            <Layout>
                <div style={{ textAlign: 'center', padding: '4rem', color: '#f87171' }}>
                    エラー: {error}
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1f2937',
                        color: '#f9fafb',
                        border: '1px solid rgba(255,255,255,0.1)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#f9fafb',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#f9fafb',
                        },
                    },
                }}
            />
            <ConnectionStatus />
            <Layout>
                <Dashboard balance={balance} users={users} />
                <Charts
                    transactions={transactions}
                    payments={payments}
                    users={users}
                />
                <div style={{ marginTop: '2rem' }}>
                    <UserManagement
                        users={users}
                        onAddUser={addUser}
                        onUpdateUser={updateUser}
                        onDeleteUser={deleteUser}
                    />
                    <AddTransaction
                        users={users}
                        onAddTransaction={addTransaction}
                        onAddPayment={addPayment}
                    />
                    <TransactionList
                        transactions={transactions}
                        payments={payments}
                        users={users}
                        onDeleteTransaction={deleteTransaction}
                        onDeletePayment={deletePayment}
                        onUpdateTransaction={updateTransaction}
                        onUpdatePayment={updatePayment}
                    />
                </div>
            </Layout>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
