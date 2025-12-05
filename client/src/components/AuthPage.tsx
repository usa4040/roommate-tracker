import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem'
        }}>
            {isLogin ? (
                <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
                <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
        </div>
    );
};

export default AuthPage;
