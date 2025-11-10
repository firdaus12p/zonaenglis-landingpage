import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  // Redirect to HOME (not login) if not authenticated
  // This hides the login URL from unauthorized users
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check admin role if required
  if (requireAdmin && user?.role !== "admin" && user?.role !== "super_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-slate-600 mb-6">
            Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi
            administrator jika Anda memerlukan akses.
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl hover:bg-blue-800 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
