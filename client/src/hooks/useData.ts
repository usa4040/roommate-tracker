import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import socket from '../socket';
import type {
    User,
    Transaction,
    Payment,
    Balance,
    TransactionInput,
    PaymentInput,
    ApiResponse,
    UseDataReturn
} from '../types';

const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useData = (): UseDataReturn => {
    const [users, setUsers] = useState<User[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [balance, setBalance] = useState<Balance[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            const [usersRes, transRes, paymentsRes, balRes] = await Promise.all([
                fetch(`${API_URL}/users`),
                fetch(`${API_URL}/transactions`),
                fetch(`${API_URL}/payments`),
                fetch(`${API_URL}/balance`)
            ]);

            const usersData: ApiResponse<User[]> = await usersRes.json();
            const transData: ApiResponse<Transaction[]> = await transRes.json();
            const paymentsData: ApiResponse<Payment[]> = await paymentsRes.json();
            const balData: ApiResponse<Balance[]> = await balRes.json();

            if (usersData.error) throw new Error(usersData.error);
            if (transData.error) throw new Error(transData.error);
            if (paymentsData.error) throw new Error(paymentsData.error);
            if (balData.error) throw new Error(balData.error);

            setUsers(usersData.data);
            setTransactions(transData.data);
            setPayments(paymentsData.data);
            setBalance(balData.data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const addTransaction = async (transaction: TransactionInput): Promise<boolean> => {
        const toastId = toast.loading('経費を追加中...');
        try {
            const res = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transaction),
            });
            const data: ApiResponse<Transaction> = await res.json();
            if (data.error) throw new Error(data.error);

            // Refresh data
            await fetchData();
            toast.success('経費を追加しました', { id: toastId });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            toast.error(`エラー: ${errorMessage}`, { id: toastId });
            setError(errorMessage);
            return false;
        }
    };

    const addUser = async (name: string): Promise<boolean> => {
        const toastId = toast.loading('ユーザーを追加中...');
        try {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });
            const data: ApiResponse<User> = await res.json();
            if (data.error) throw new Error(data.error);

            // Refresh data
            await fetchData();
            toast.success(`${name}さんを追加しました`, { id: toastId });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            toast.error(`エラー: ${errorMessage}`, { id: toastId });
            setError(errorMessage);
            return false;
        }
    };

    const updateUser = async (id: number, name: string): Promise<boolean> => {
        const toastId = toast.loading('ユーザー名を更新中...');
        try {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });
            const data: ApiResponse<User> = await res.json();
            if (data.error) throw new Error(data.error);
            await fetchData();
            toast.success('ユーザー名を更新しました', { id: toastId });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            toast.error(`エラー: ${errorMessage}`, { id: toastId });
            setError(errorMessage);
            return false;
        }
    };

    const deleteUser = async (id: number): Promise<boolean> => {
        const toastId = toast.loading('ユーザーを削除中...');
        try {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
            });
            const data: ApiResponse<void> = await res.json();
            if (data.error) throw new Error(data.error);
            await fetchData();
            toast.success('ユーザーを削除しました', { id: toastId });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            toast.error(`エラー: ${errorMessage}`, { id: toastId });
            setError(errorMessage);
            return false;
        }
    };

    const deleteTransaction = async (id: number): Promise<boolean> => {
        const toastId = toast.loading('取引を削除中...');
        try {
            const res = await fetch(`${API_URL}/transactions/${id}`, {
                method: 'DELETE',
            });
            const data: ApiResponse<void> = await res.json();
            if (data.error) throw new Error(data.error);
            await fetchData();
            toast.success('取引を削除しました', { id: toastId });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            toast.error(`エラー: ${errorMessage}`, { id: toastId });
            setError(errorMessage);
            return false;
        }
    };

    const addPayment = async (payment: PaymentInput): Promise<boolean> => {
        const toastId = toast.loading('返済を記録中...');
        try {
            const res = await fetch(`${API_URL}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payment),
            });
            const data: ApiResponse<Payment> = await res.json();
            if (data.error) throw new Error(data.error);
            await fetchData();
            toast.success('返済を記録しました', { id: toastId });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            toast.error(`エラー: ${errorMessage}`, { id: toastId });
            setError(errorMessage);
            return false;
        }
    };

    const deletePayment = async (id: number): Promise<boolean> => {
        const toastId = toast.loading('返済を削除中...');
        try {
            const res = await fetch(`${API_URL}/payments/${id}`, {
                method: 'DELETE',
            });
            const data: ApiResponse<void> = await res.json();
            if (data.error) throw new Error(data.error);
            await fetchData();
            toast.success('返済を削除しました', { id: toastId });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            toast.error(`エラー: ${errorMessage}`, { id: toastId });
            setError(errorMessage);
            return false;
        }
    };

    useEffect(() => {
        fetchData();

        // Listen for real-time updates from other clients
        const handleDataUpdate = (data: unknown) => {
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
