import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('パスワードが一致しません');
            return;
        }

        if (password.length < 6) {
            setError('パスワードは6文字以上である必要があります');
            return;
        }

        setLoading(true);

        try {
            await register({ name, email, password });
        } catch (err) {
            setError(err instanceof Error ? err.message : '登録に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '60px',
                    height: '60px',
                    background: 'var(--accent-gradient)',
                    borderRadius: '50%',
                    marginBottom: '1rem'
                }}>
                    <UserPlus size={30} color="white" />
                </div>
                <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>新規登録</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    新しいアカウントを作成してください
                </p>
            </div>

            {error && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: '#f87171',
                    marginBottom: '1rem'
                }}>
                    <AlertCircle size={18} />
                    <span style={{ fontSize: '0.9rem' }}>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}>
                        <UserIcon size={16} />
                        名前
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="山田太郎"
                        required
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}>
                        <Mail size={16} />
                        メールアドレス
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@example.com"
                        required
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}>
                        <Lock size={16} />
                        パスワード
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}>
                        <Lock size={16} />
                        パスワード（確認）
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        style={{ width: '100%' }}
                    />
                </div>

                <button
                    type="submit"
                    className="btn"
                    disabled={loading}
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? '登録中...' : '登録'}
                </button>
            </form>

            <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center'
            }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    すでにアカウントをお持ちですか？{' '}
                    <button
                        onClick={onSwitchToLogin}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                            font: 'inherit'
                        }}
                    >
                        ログイン
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;
