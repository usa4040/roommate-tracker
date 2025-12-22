import { ENDPOINTS, buildApiUrl } from './config';

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
        const response = await fetch(buildApiUrl(ENDPOINTS.AUTH.LOGIN), {
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
        const response = await fetch(buildApiUrl(ENDPOINTS.AUTH.REGISTER), {
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
        const response = await fetch(buildApiUrl(ENDPOINTS.AUTH.ME), {
            headers: this.getHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to get current user');
        }

        const data = await response.json();
        return data.user;
    }

    async logout(): Promise<void> {
        await fetch(buildApiUrl(ENDPOINTS.AUTH.LOGOUT), {
            method: 'POST',
            headers: this.getHeaders()
        });
        // Token removal is handled by AuthContext
    }
}

export const authAPI = new AuthAPI();

