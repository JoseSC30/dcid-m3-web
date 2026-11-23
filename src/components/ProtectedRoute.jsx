import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
export default function ProtectedRoute({ roles = [] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/acceso" replace />;
  if (roles.length && !roles.includes(user.rol))
    return <Navigate to="/" replace />;
  return <Outlet />;
}
