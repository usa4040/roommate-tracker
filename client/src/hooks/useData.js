import { useState, useEffect, useCallback } from 'react';
import socket from '../socket';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useData = () => {
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [payments, setPayments] = useState([]);
    const [balance, setBalance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [usersRes, transRes, paymentsRes, balRes] = await Promise.all([
                fetch(`${API_URL}/users`),
                fetch(`${API_URL}/transactions`),
                fetch(`${API_URL}/payments`),
                fetch(`${API_URL}/balance`)
            ]);

            const usersData = await usersRes.json();
            const transData = await transRes.json();
            const paymentsData = await paymentsRes.json();
            const balData = await balRes.json();

            if (usersData.error) throw new Error(usersData.error);
            if (transData.error) throw new Error(transData.error);
            if (paymentsData.error) throw new Error(paymentsData.error);
            if (balData.error) throw new Error(balData.error);

            setUsers(usersData.data);
            setTransactions(transData.data);
            setPayments(paymentsData.data);
            setBalance(balData.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const addTransaction = async (transaction) => {
        try {
            const res = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transaction),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Refresh data
            await fetchData();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const addUser = async (name) => {
        try {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Refresh data
            await fetchData();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const updateUser = async (id, name) => {
        try {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            await fetchData();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const deleteUser = async (id) => {
        try {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            await fetchData();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const deleteTransaction = async (id) => {
        try {
            const res = await fetch(`${API_URL}/transactions/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            await fetchData();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const addPayment = async (payment) => {
        try {
            const res = await fetch(`${API_URL}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payment),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            await fetchData();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const deletePayment = async (id) => {
        try {
            const res = await fetch(`${API_URL}/payments/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            await fetchData();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    useEffect(() => {
        fetchData();

        // Listen for real-time updates from other clients
        const handleDataUpdate = (data) => {
            console.log('Data updated:', data);
            // Refresh all data when any change occurs
            fetchData();
        };

        socket.on('data-updated', handleDataUpdate);

        // Cleanup on unmount
        return () => {
            socket.off('data-updated', handleDataUpdate);
        };
    }, [fetchData]);

    return {
        users,
        transactions,
        payments,
        balance,
        loading,
        error,
        addTransaction,
        addUser,
        updateUser,
        deleteUser,
        deleteTransaction,
        addPayment,
        deletePayment,
        refresh: fetchData
    };
};
