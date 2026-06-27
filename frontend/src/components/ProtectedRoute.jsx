import { Navigate } from 'react-router-dom'

// Redirects to login if not logged in
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/" replace />
  return children
}

export default ProtectedRoute
