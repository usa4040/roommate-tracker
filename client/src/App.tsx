import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import ConnectionStatus from './components/ConnectionStatus';
import AuthPage from './components/AuthPage';
import {
    DashboardPage,
    TransactionsPage,
    AddPage,
    MembersPage,
    AnalyticsPage
} from './pages';
import { useData } from './hooks/useData';
import './components/Sidebar.css';

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

    // Show error if data fetch failed
    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f87171'
            }}>
                エラー: {error}
            </div>
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
            <Sidebar />
            <main className="main-content">
                <Routes>
                    <Route
                        path="/"
                        element={<DashboardPage balance={balance} users={users} />}
                    />
                    <Route
                        path="/transactions"
                        element={
                            <TransactionsPage
                                transactions={transactions}
                                payments={payments}
                                users={users}
                                onDeleteTransaction={deleteTransaction}
                                onDeletePayment={deletePayment}
                                onUpdateTransaction={updateTransaction}
                                onUpdatePayment={updatePayment}
                            />
                        }
                    />
                    <Route
                        path="/add"
                        element={
                            <AddPage
                                users={users}
                                onAddTransaction={addTransaction}
                                onAddPayment={addPayment}
                            />
                        }
                    />
                    <Route
                        path="/members"
                        element={
                            <MembersPage
                                users={users}
                                onAddUser={addUser}
                                onUpdateUser={updateUser}
                                onDeleteUser={deleteUser}
                            />
                        }
                    />
                    <Route
                        path="/analytics"
                        element={
                            <AnalyticsPage
                                transactions={transactions}
                                payments={payments}
                                users={users}
                            />
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
