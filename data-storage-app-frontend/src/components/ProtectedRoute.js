import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const token = location.state.token;
    console.log(token)

  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
