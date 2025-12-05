const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: AuthUser;
}

class AuthAPI {
    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        return response.json();
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        return response.json();
    }

    async getCurrentUser(): Promise<AuthUser> {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: this.getHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to get current user');
        }

        const data = await response.json();
        return data.user;
    }

    async logout(): Promise<void> {
        await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: this.getHeaders()
        });
        localStorage.removeItem('auth_token');
    }
}

export const authAPI = new AuthAPI();
