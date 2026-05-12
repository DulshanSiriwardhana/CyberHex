import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/auth';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ExperimentDetail = lazy(() => import('./pages/ExperimentDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
);

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        const errorHandler = () => setHasError(true);
        window.addEventListener('error', errorHandler);
        return () => window.removeEventListener('error', errorHandler);
    }, []);

    if (hasError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
                >
                    Reload Page
                </button>
            </div>
        );
    }

    return <>{children}</>;
};

const ProtectedRoute: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingFallback />;
    if (!user) return <Navigate to="/login" replace />;

    return <Outlet />;
};

const PublicRoute: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingFallback />;
    if (user) return <Navigate to="/dashboard" replace />;

    return <Outlet />;
};

const RootLayout: React.FC = () => {
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
                <Outlet />
            </Suspense>
        </ErrorBoundary>
    );
};

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        errorElement: <NotFound />,
        children: [
            {
                element: <PublicRoute />,
                children: [
                    { path: '/login', element: <Login /> },
                    { path: '/register', element: <Register /> },
                ]
            },
            {
                element: <ProtectedRoute />,
                children: [
                    { path: '/dashboard', element: <Dashboard /> },
                    { path: '/experiments/:id', element: <ExperimentDetail /> },
                    { path: '/profile', element: <Profile /> },
                ]
            },
            { path: '/', element: <Navigate to="/dashboard" replace /> },
            { path: '*', element: <NotFound /> }
        ]
    }
]);
