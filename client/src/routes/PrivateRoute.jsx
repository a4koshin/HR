import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import ProtectedLayout from "../layouts/Layout";``

const PrivateRoute = () => {
  const { isAuthenticated, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <div></div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <ProtectedLayout><Outlet /></ProtectedLayout>;
};


export default PrivateRoute;

