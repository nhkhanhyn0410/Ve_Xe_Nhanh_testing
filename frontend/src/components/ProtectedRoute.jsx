import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useOperatorAuthStore from '../store/operatorAuthStore';
import useAdminAuthStore from '../store/adminAuthStore';
import useTripManagerAuthStore from '../store/tripManagerAuthStore';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Checks appropriate auth store based on allowed roles
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Get auth state from all stores
  const customerAuth = useAuthStore();
  const operatorAuth = useOperatorAuthStore();
  const adminAuth = useAdminAuthStore();
  const tripManagerAuth = useTripManagerAuthStore();

  // Determine which auth to check based on allowed roles
  let isAuthenticated = false;
  let user = null;
  let loginPath = '/login';

  if (allowedRoles.includes('operator')) {
    isAuthenticated = operatorAuth.isAuthenticated;
    user = operatorAuth.operator;
    loginPath = '/operator/login';
  } else if (allowedRoles.includes('admin')) {
    isAuthenticated = adminAuth.isAuthenticated;
    user = adminAuth.admin;
    loginPath = '/admin/login';
  } else if (allowedRoles.includes('trip_manager')) {
    isAuthenticated = tripManagerAuth.isAuthenticated;
    user = tripManagerAuth.tripManager;
    loginPath = '/trip-manager/login';
  } else if (allowedRoles.includes('customer')) {
    isAuthenticated = customerAuth.isAuthenticated;
    user = customerAuth.user;
    loginPath = '/login';
  }

  if (!isAuthenticated || !user) {
    // Not logged in, redirect to appropriate login page
    return <Navigate to={loginPath} replace />;
  }

  // Check role if specified
  if (allowedRoles.length > 0 && user.role && !allowedRoles.includes(user.role)) {
    // User doesn't have required role, redirect to their home page
    if (user.role === 'operator') return <Navigate to="/operator/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'trip_manager') return <Navigate to="/trip-manager/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
