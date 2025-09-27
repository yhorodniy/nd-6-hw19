import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../Loading/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
