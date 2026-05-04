import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore.js';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, verifySession } = useAuthStore();

  // Verify the stored token is still valid on mount
  useEffect(() => { verifySession(); }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
