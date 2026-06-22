import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import type { UserRole } from '../lib/types';
import { Spinner } from './ui/States';

export default function ProtectedRoute({ allow, children }: { allow: UserRole[]; children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <Spinner label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <Spinner label="Loading your profile..." />;
  if (!allow.includes(profile.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
