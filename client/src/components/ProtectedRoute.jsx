import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const res = await apiFetch('/api/auth/verify');
        const data = await res.json();
        
        if (!res.ok || !data.user) {
          throw new Error('Unauthorized');
        }

        // If specific roles are required, verify them
        if (allowedRoles.length > 0 && !allowedRoles.includes(data.user.role)) {
          setAuthorized(false);
          navigate('/admin/dashboard', { replace: true }); // Redirect to safe fallback
          return;
        }

        setAuthorized(true);
      } catch (err) {
        navigate('/admin/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRole();
  }, [navigate, allowedRoles]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Verifying access...</div>;
  }

  return authorized ? children : null;
}