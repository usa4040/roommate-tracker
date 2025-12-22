import React from 'react';
import UserManagement from '../components/UserManagement';
import type { User } from '../types';

interface MembersPageProps {
    users: User[];
    onAddUser: (name: string) => Promise<boolean>;
    onUpdateUser: (id: number, name: string) => Promise<boolean>;
    onDeleteUser: (id: number) => Promise<boolean>;
}

const MembersPage: React.FC<MembersPageProps> = ({
    users,
    onAddUser,
    onUpdateUser,
    onDeleteUser
}) => {
    return (
        <div className="page-container">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>メンバー管理</h2>
            <UserManagement
                users={users}
                onAddUser={onAddUser}
                onUpdateUser={onUpdateUser}
                onDeleteUser={onDeleteUser}
            />
        </div>
    );
};

export default MembersPage;
