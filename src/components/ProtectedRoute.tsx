import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useBarberAuth } from '@/hooks/useBarberAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useBarberAuth();

  if (!isAuthenticated) {
    return <Navigate to="/barber-login" replace />;
  }

  return children;
};
