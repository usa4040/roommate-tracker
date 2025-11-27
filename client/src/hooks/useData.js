import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useData = () => {
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [usersRes, transRes, balRes] = await Promise.all([
                fetch(`${API_URL}/users`),
                fetch(`${API_URL}/transactions`),
                fetch(`${API_URL}/balance`)
            ]);

            const usersData = await usersRes.json();
            const transData = await transRes.json();
            const balData = await balRes.json();

            if (usersData.error) throw new Error(usersData.error);
            if (transData.error) throw new Error(transData.error);
            if (balData.error) throw new Error(balData.error);

            setUsers(usersData.data);
            setTransactions(transData.data);
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

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { users, transactions, balance, loading, error, addTransaction, addUser, updateUser, deleteUser, deleteTransaction, refresh: fetchData };
};
