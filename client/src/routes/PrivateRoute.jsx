import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";

const PrivateRoute = () => {
  const { auth, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return <div className="text-center mt-10">Loading...</div>; // or spinner
  }

  return auth?.token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
