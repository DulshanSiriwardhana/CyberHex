import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    profilePicture?: string;
    emailVerified?: boolean;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    let refreshTokenTimeout: ReturnType<typeof setTimeout> | null = null;

    const clearError = useCallback(() => setError(null), []);

    const scheduleTokenRefresh = useCallback((expiresIn: number = 14 * 60 * 1000) => {
        if (refreshTokenTimeout) clearTimeout(refreshTokenTimeout);
        refreshTokenTimeout = setTimeout(async () => {
            try {
                await refreshToken();
            } catch (err) {
                console.error('Token refresh failed:', err);
            }
        }, expiresIn);
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    setAccessToken(token);
                    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.user);
                        clearError();
                        scheduleTokenRefresh();
                    } else if (response.status === 401) {
                        localStorage.removeItem('accessToken');
                        setAccessToken(null);
                        setUser(null);
                    } else {
                        throw new Error('Failed to fetch profile');
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                localStorage.removeItem('accessToken');
                setAccessToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        return () => {
            if (refreshTokenTimeout) clearTimeout(refreshTokenTimeout);
        };
    }, [clearError, scheduleTokenRefresh]);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            clearError();

            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('accessToken', data.accessToken);
            setAccessToken(data.accessToken);
            setUser(data.user);
            scheduleTokenRefresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (username: string, email: string, password: string) => {
        try {
            setLoading(true);
            clearError();

            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            localStorage.setItem('accessToken', data.accessToken);
            setAccessToken(data.accessToken);
            setUser(data.user);
            scheduleTokenRefresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Token refresh failed');
            }

            localStorage.setItem('accessToken', data.accessToken);
            setAccessToken(data.accessToken);
            clearError();
            scheduleTokenRefresh();
        } catch (err) {
            console.error('Token refresh error:', err);
            logout();
            throw err;
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: 'include'
                });
            }
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('accessToken');
            setAccessToken(null);
            setUser(null);
            setError(null);
            if (refreshTokenTimeout) clearTimeout(refreshTokenTimeout);
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
        try {
            setLoading(true);
            clearError();

            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Password change failed');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Password change failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, register, logout, refreshToken, changePassword, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};
