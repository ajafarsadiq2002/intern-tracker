import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ page, children, requireSuperAdmin = false }) {
  const { user, loading, canAccess } = useAuth()

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (requireSuperAdmin && user.role !== 'super_admin') return <Navigate to="/" />
  if (!canAccess(page)) return <Navigate to="/" />

  return children
}
