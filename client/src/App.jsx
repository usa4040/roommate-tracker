import React from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AddTransaction from './components/AddTransaction';
import TransactionList from './components/TransactionList';
import UserManagement from './components/UserManagement';
import { useData } from './hooks/useData';

function App() {
  const { users, transactions, balance, loading, error, addTransaction, addUser, updateUser, deleteUser, deleteTransaction } = useData();

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="animate-fade-in" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>読み込み中...</div>
        </div>
      </Layout>
    );
  }

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
    <Layout>
      <Dashboard balance={balance} users={users} />
      <div style={{ marginTop: '2rem' }}>
        <UserManagement
          users={users}
          onAddUser={addUser}
          onUpdateUser={updateUser}
          onDeleteUser={deleteUser}
        />
        <AddTransaction users={users} onAdd={addTransaction} />
        <TransactionList transactions={transactions} onDelete={deleteTransaction} />
      </div>
    </Layout>
  );
}

export default App;
