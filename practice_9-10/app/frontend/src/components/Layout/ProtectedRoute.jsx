import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../services/api';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const authenticated = isAuthenticated();

  // Получаем роль из токена
  const getUserRole = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  };

  const userRole = getUserRole();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/products" replace />;
  }

  return children;
};

export default ProtectedRoute;