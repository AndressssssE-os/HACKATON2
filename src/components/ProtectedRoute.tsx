import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requerirAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requerirAdmin = false 
}) => {
  const { estaAutenticado, esAdmin, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <LoadingSpinner texto="Verificando autenticación..." />;
  }

  if (!estaAutenticado) {
    // Redirigir al login guardando la ubicación actual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requerirAdmin && !esAdmin) {
    // Usuario no es admin, redirigir al home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;