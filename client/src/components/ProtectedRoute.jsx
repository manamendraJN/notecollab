import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen" style={{ background: 'var(--color-bg)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
                    <p style={{ color: 'var(--color-muted)' }} className="text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
