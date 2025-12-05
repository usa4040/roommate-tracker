import type { Transaction, Payment, TransactionOrPayment } from '../types';

/**
 * Convert transactions and payments to CSV format
 */
export const exportToCSV = (items: TransactionOrPayment[], filename: string = 'transactions.csv'): void => {
    if (items.length === 0) {
        alert('エクスポートするデータがありません。');
        return;
    }

    // CSV header
    const headers = ['種類', '日付', '金額', '説明', '支払者/送信者', '受取人'];

    // CSV rows
    const rows = items.map(item => {
        if (item.type === 'transaction') {
            return [
                '経費',
                item.date,
                item.amount.toString(),
                item.description || '',
                item.payer_name || '',
                ''
            ];
        } else {
            return [
                '返済',
                item.date,
                item.amount.toString(),
                item.description || '',
                item.from_user_name || '',
                item.to_user_name || ''
            ];
        }
    });

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Add BOM for Excel compatibility with Japanese characters
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Must append to document for Firefox
    document.body.appendChild(link);

    // Use requestAnimationFrame to ensure the link is in the DOM before clicking
    requestAnimationFrame(() => {
        link.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));

        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    });

    console.log(`CSV exported: ${filename}`);
};

/**
 * Convert transactions and payments to JSON format
 */
export const exportToJSON = (items: TransactionOrPayment[], filename: string = 'transactions.json'): void => {
    if (items.length === 0) {
        alert('エクスポートするデータがありません。');
        return;
    }

    const jsonContent = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    requestAnimationFrame(() => {
        link.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    });

    console.log(`JSON exported: ${filename}`);
};

/**
 * Generate filename with current date
 */
export const generateFilename = (prefix: string, extension: string): string => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${prefix}_${dateStr}.${extension}`;
};

/**
 * Export summary statistics to JSON
 */
export const exportSummary = (
    items: TransactionOrPayment[],
    users: { id: number; name: string }[],
    filename: string = 'summary.json'
): void => {
    const transactions = items.filter(item => item.type === 'transaction') as Transaction[];
    const payments = items.filter(item => item.type === 'payment') as Payment[];

    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

    const userStats = users.map(user => {
        const userExpenses = transactions
            .filter(t => t.payer_id === user.id)
            .reduce((sum, t) => sum + t.amount, 0);

        const userPaymentsSent = payments
            .filter(p => p.from_user_id === user.id)
            .reduce((sum, p) => sum + p.amount, 0);

        const userPaymentsReceived = payments
            .filter(p => p.to_user_id === user.id)
            .reduce((sum, p) => sum + p.amount, 0);

        return {
            user: user.name,
            expenses: userExpenses,
            paymentsSent: userPaymentsSent,
            paymentsReceived: userPaymentsReceived,
            netBalance: userExpenses + userPaymentsReceived - userPaymentsSent
        };
    });

    const summary = {
        exportDate: new Date().toISOString(),
        period: {
            from: items.length > 0 ? items[items.length - 1].date : null,
            to: items.length > 0 ? items[0].date : null
        },
        totals: {
            transactionCount: transactions.length,
            paymentCount: payments.length,
            totalExpenses,
            totalPayments
        },
        userStatistics: userStats
    };

    const jsonContent = JSON.stringify(summary, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    requestAnimationFrame(() => {
        link.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    });

    console.log(`Summary exported: ${filename}`);
};
