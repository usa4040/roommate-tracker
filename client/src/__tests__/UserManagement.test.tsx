import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserManagement from '../components/UserManagement';
import type { User } from '../types';

describe('UserManagement Component', () => {
    const mockUsers: User[] = [
        { id: 1, name: 'ユーザー1', avatar: 'https://example.com/avatar1.png' },
        { id: 2, name: 'ユーザー2', avatar: 'https://example.com/avatar2.png' }
    ];

    const mockAddUser = vi.fn().mockResolvedValue(true);
    const mockUpdateUser = vi.fn().mockResolvedValue(true);
    const mockDeleteUser = vi.fn().mockResolvedValue(true);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('ルームメイトタイトルが表示される', () => {
        render(
            <UserManagement
                users={mockUsers}
                onAddUser={mockAddUser}
                onUpdateUser={mockUpdateUser}
                onDeleteUser={mockDeleteUser}
            />
        );

        expect(screen.getByText('ルームメイト')).toBeInTheDocument();
    });

    it('全ユーザーが表示される', () => {
        render(
            <UserManagement
                users={mockUsers}
                onAddUser={mockAddUser}
                onUpdateUser={mockUpdateUser}
                onDeleteUser={mockDeleteUser}
            />
        );

        expect(screen.getByText('ユーザー1')).toBeInTheDocument();
        expect(screen.getByText('ユーザー2')).toBeInTheDocument();
    });

    it('追加ボタンをクリックするとフォームが表示される', async () => {
        const user = userEvent.setup();
        render(
            <UserManagement
                users={mockUsers}
                onAddUser={mockAddUser}
                onUpdateUser={mockUpdateUser}
                onDeleteUser={mockDeleteUser}
            />
        );

        // Click the add user button (UserPlus icon button)
        const addButtons = screen.getAllByRole('button');
        const addButton = addButtons[0]; // First button is the add button
        await user.click(addButton);

        // Form should now be visible
        await waitFor(() => {
            expect(screen.getByPlaceholderText('名前を入力...')).toBeInTheDocument();
        });
    });

    it('新しいユーザーを追加できる', async () => {
        const user = userEvent.setup();
        render(
            <UserManagement
                users={mockUsers}
                onAddUser={mockAddUser}
                onUpdateUser={mockUpdateUser}
                onDeleteUser={mockDeleteUser}
            />
        );

        // Open form
        const addButtons = screen.getAllByRole('button');
        await user.click(addButtons[0]);

        // Wait for form to appear
        await waitFor(() => {
            expect(screen.getByPlaceholderText('名前を入力...')).toBeInTheDocument();
        });

        // Enter new user name
        const input = screen.getByPlaceholderText('名前を入力...');
        await user.type(input, '新しいユーザー');

        // Click add button
        const submitButton = screen.getByText('追加');
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockAddUser).toHaveBeenCalledWith('新しいユーザー');
        });
    });

    it('ユーザー名をクリックすると編集モードになる', async () => {
        const user = userEvent.setup();
        render(
            <UserManagement
                users={mockUsers}
                onAddUser={mockAddUser}
                onUpdateUser={mockUpdateUser}
                onDeleteUser={mockDeleteUser}
            />
        );

        // Click on user name to edit
        const userName = screen.getByText('ユーザー1');
        await user.click(userName);

        // Edit form should appear
        await waitFor(() => {
            const inputs = screen.getAllByRole('textbox');
            expect(inputs.length).toBeGreaterThan(0);
        });
    });

    it('ユーザー削除時に確認モーダルが表示される', async () => {
        const user = userEvent.setup();
        render(
            <UserManagement
                users={mockUsers}
                onAddUser={mockAddUser}
                onUpdateUser={mockUpdateUser}
                onDeleteUser={mockDeleteUser}
            />
        );

        // Find and click delete button (× button)
        const deleteButtons = screen.getAllByText('×');
        await user.click(deleteButtons[0]);

        // Confirmation modal should appear
        await waitFor(() => {
            expect(screen.getByText('ユーザーを削除しますか？')).toBeInTheDocument();
        });
    });

    it('削除確認後にユーザーを削除できる', async () => {
        const user = userEvent.setup();
        render(
            <UserManagement
                users={mockUsers}
                onAddUser={mockAddUser}
                onUpdateUser={mockUpdateUser}
                onDeleteUser={mockDeleteUser}
            />
        );

        // Click delete button
        const deleteButtons = screen.getAllByText('×');
        await user.click(deleteButtons[0]);

        // Wait for modal
        await waitFor(() => {
            expect(screen.getByText('ユーザーを削除しますか？')).toBeInTheDocument();
        });

        // Confirm deletion
        const confirmButton = screen.getByText('削除する');
        await user.click(confirmButton);

        await waitFor(() => {
            expect(mockDeleteUser).toHaveBeenCalled();
        });
    });

    it('削除をキャンセルできる', async () => {
        const user = userEvent.setup();
        render(
            <UserManagement
                users={mockUsers}
                onAddUser={mockAddUser}
                onUpdateUser={mockUpdateUser}
                onDeleteUser={mockDeleteUser}
            />
        );

        // Click delete button
        const deleteButtons = screen.getAllByText('×');
        await user.click(deleteButtons[0]);

        // Wait for modal
        await waitFor(() => {
            expect(screen.getByText('ユーザーを削除しますか？')).toBeInTheDocument();
        });

        // Cancel deletion
        const cancelButton = screen.getByText('キャンセル');
        await user.click(cancelButton);

        // Modal should disappear
        await waitFor(() => {
            expect(screen.queryByText('ユーザーを削除しますか？')).not.toBeInTheDocument();
        });

        // Delete should not have been called
        expect(mockDeleteUser).not.toHaveBeenCalled();
    });

    it('アバター画像が表示される', () => {
        const { container } = render(
            <UserManagement
                users={mockUsers}
                onAddUser={mockAddUser}
                onUpdateUser={mockUpdateUser}
                onDeleteUser={mockDeleteUser}
            />
        );

        const images = container.querySelectorAll('img');
        expect(images.length).toBe(2); // One for each user
    });
});
