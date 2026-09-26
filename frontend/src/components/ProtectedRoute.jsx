import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { mergeRedirectState, saveRedirectState } from '../utils/redirectState';

export default function ProtectedRoute({ children, user, requireAdmin = false }) {
  const location = useLocation();

  if (!user) {
    const destination = location.pathname + location.search;
    const redirectPayload = mergeRedirectState({ from: destination }, location.state || {});
    // persist the intended destination so it survives refreshes
    try {
      saveRedirectState(redirectPayload);
    } catch (e) {
      // noop - best-effort persistence
    }
    return <Navigate to="/login" replace state={redirectPayload} />;
  }
  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return children;
}
