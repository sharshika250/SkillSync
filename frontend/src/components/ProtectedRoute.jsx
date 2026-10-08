import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSkillSync } from '../context/SkillSyncContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useSkillSync();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
