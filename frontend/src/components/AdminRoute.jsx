import { Navigate } from 'react-router-dom'

// Redirects to dashboard if not admin
function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  const user  = JSON.parse(localStorage.getItem('user') || '{}')

  if (!token)                return <Navigate to="/"          replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default AdminRoute
