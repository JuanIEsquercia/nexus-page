import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NexusLogo from '../components/NexusLogo'
import { BsEye, BsEyeSlash } from 'react-icons/bs'

export default function LoginPage() {
  const { login, resetPassword } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [resetMode, setResetMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch {
      setError('Credenciales incorrectas. Verificá email y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setResetMsg('')
    setError('')
    setResetLoading(true)
    try {
      await resetPassword(resetEmail)
      setResetMsg('Te enviamos un email para restablecer la contraseña.')
    } catch {
      setError('No encontramos ese email. Verificá que sea el correcto.')
    } finally {
      setResetLoading(false)
    }
  }

  const inputStyle = {
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center px-3"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="card p-4 shadow-lg w-100"
        style={{ maxWidth: 400, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
      >
        <div className="text-center mb-4">
          <NexusLogo />
          <p className="mt-2 mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Panel de Operaciones
          </p>
        </div>

        {!resetMode ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" style={{ color: 'var(--text-primary)' }}>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ color: 'var(--text-primary)' }}>Contraseña</label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ ...inputStyle, borderRight: 'none' }}
                />
                <button
                  type="button"
                  className="input-group-text"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ ...inputStyle, cursor: 'pointer', borderLeft: 'none' }}
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <button
              type="submit"
              className="btn w-100 mt-2"
              disabled={loading}
              style={{ background: 'var(--primary-gradient)', color: '#fff', border: 'none' }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                onClick={() => { setResetMode(true); setError('') }}
                style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.85rem' }}
              >
                Olvidé mi contraseña
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <p className="small mb-3" style={{ color: 'var(--text-secondary)' }}>
              Ingresá tu email y te enviamos un link para restablecer la contraseña.
            </p>
            <div className="mb-3">
              <label className="form-label" style={{ color: 'var(--text-primary)' }}>Email</label>
              <input
                type="email"
                className="form-control"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
              />
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            {resetMsg && <div className="alert alert-success py-2 small">{resetMsg}</div>}

            <button
              type="submit"
              className="btn w-100"
              disabled={resetLoading}
              style={{ background: 'var(--primary-gradient)', color: '#fff', border: 'none' }}
            >
              {resetLoading ? 'Enviando...' : 'Enviar email'}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                onClick={() => { setResetMode(false); setError(''); setResetMsg('') }}
                style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.85rem' }}
              >
                ← Volver al login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
