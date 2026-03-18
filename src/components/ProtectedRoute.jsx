import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="spinner-border" style={{ color: 'var(--primary-color)' }} role="status" />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}
