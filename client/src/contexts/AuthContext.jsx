import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('nc_user') || 'null'));
    const [token, setToken] = useState(() => localStorage.getItem('nc_token') || null);
    const [loading, setLoading] = useState(true);

    // Verify token on mount
    useEffect(() => {
        const verify = async () => {
            if (!token) { setLoading(false); return; }
            try {
                const { data } = await api.get('/auth/me');
                setUser(data.user);
                localStorage.setItem('nc_user', JSON.stringify(data.user));
            } catch {
                logout();
            } finally {
                setLoading(false);
            }
        };
        verify();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = (userData, tokenValue) => {
        setUser(userData);
        setToken(tokenValue);
        localStorage.setItem('nc_user', JSON.stringify(userData));
        localStorage.setItem('nc_token', tokenValue);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('nc_user');
        localStorage.removeItem('nc_token');
    };

    const updateUser = (updated) => {
        setUser(updated);
        localStorage.setItem('nc_user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
