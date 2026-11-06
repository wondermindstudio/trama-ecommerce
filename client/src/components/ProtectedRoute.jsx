import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-loading" aria-busy="true" />;
  if (!user) return <Navigate to="/ingresar" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
