import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService} from '../src/services/authService.ts';
import { RoutePaths } from './constants/routePaths.ts';

const PrivateRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getAccessToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={RoutePaths.ACCESS_DENIED} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
