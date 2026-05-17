/**
 * Protected Route Component
 * Wraps protected routes to ensure user is authenticated
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute({ user }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
