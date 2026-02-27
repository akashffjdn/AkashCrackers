import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/auth.ts';

export function AdminRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const isLoading = useAuthStore((s) => s.isLoading);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-body-sm text-surface-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          <h1 className="font-display font-bold text-display-sm text-surface-900 dark:text-surface-50">
            Access Denied
          </h1>
          <p className="text-body-sm text-surface-500 mt-2 mb-6">
            You don't have admin privileges to access this area. Contact the store administrator if you believe this is an error.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white text-body-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
