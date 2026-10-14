import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// Route guard.
// - If the user is not logged in, redirect to /login.
// - If allowedRoles is given and the user's role is not in it, redirect to home.
// Note: the backend is the real authority on permissions; this is only a UX gate.
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}
