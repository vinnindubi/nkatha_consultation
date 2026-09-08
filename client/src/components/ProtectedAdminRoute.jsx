import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function ProtectedAdminRoute({ children, allowedRoles = [] }) {
  const [authStatus, setAuthStatus] = useState({ loading: true, isAuthenticated: false, role: null });

  useEffect(() => {
    apiFetch('/api/auth/verify', { method: 'GET' })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setAuthStatus({
            loading: false,
            isAuthenticated: true,
            role: data.user?.role,
          });
        } else {
          setAuthStatus({ loading: false, isAuthenticated: false, role: null });
        }
      })
      .catch(() => setAuthStatus({ loading: false, isAuthenticated: false, role: null }));
  }, []);

  if (authStatus.loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authStatus.isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // If specific roles are required, ensure the user matches them
  if (allowedRoles.length > 0 && !allowedRoles.includes(authStatus.role)) {
    return <Navigate to="/admin" replace />; // Fallback redirect to main dashboard if unauthorized
  }

  return children;
}