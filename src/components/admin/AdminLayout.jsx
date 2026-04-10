import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

import QuickVisitModal from './QuickVisitModal'
import {
  BsSpeedometer2,
  BsPeopleFill,
  BsBoxSeam,
  BsGraphUp,
  BsBoxArrowRight,
  BsClipboardPlusFill,
  BsFileEarmarkText,
  BsBarChartFill,
} from 'react-icons/bs'

// Los primeros 4 aparecen también en el bottom nav mobile
const NAV_ITEMS = [
  { to: '/admin',              label: 'Dashboard',   icon: BsSpeedometer2,    exact: true },
  { to: '/admin/clientes',     label: 'Clientes',    icon: BsPeopleFill },
  { to: '/admin/stock',        label: 'Stock',       icon: BsBoxSeam },
  { to: '/admin/balance',      label: 'Balance',     icon: BsGraphUp },
  { to: '/admin/analytics',    label: 'Analytics',   icon: BsBarChartFill },
  { to: '/admin/documentos',   label: 'Documentos',  icon: BsFileEarmarkText },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showVisitModal, setShowVisitModal] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── Sidebar desktop (lg+) ─────────────────────── */}
      <aside
        className="d-none d-lg-flex flex-column"
        style={{
          width: 230,
          minHeight: '100vh',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          padding: '1.5rem 1rem',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Logo */}
        <div className="mb-4 px-2" style={{ minWidth: 0 }}>
          <p className="mb-0 fw-bold" style={{ fontSize: '1.25rem', letterSpacing: '0.12em', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NEXUS
          </p>
          <p className="mt-0 mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Operaciones
          </p>
        </div>

        {/* Botón registrar visita — acción principal */}
        <button
          onClick={() => setShowVisitModal(true)}
          className="btn w-100 mb-4 d-flex align-items-center justify-content-center gap-2"
          style={{
            background: 'var(--primary-gradient)',
            color: '#fff',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '0.65rem 1rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: '0 4px 14px rgba(14,165,233,0.35)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(14,165,233,0.45)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(14,165,233,0.35)' }}
        >
          <BsClipboardPlusFill size={16} />
          Registrar visita
        </button>

        {/* Nav */}
        <nav className="d-flex flex-column gap-1 flex-grow-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.9rem',
                borderRadius: '0.6rem',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(14,165,233,0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="mt-auto pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
          <p
            className="mb-2 px-1 text-truncate"
            style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', maxWidth: '100%' }}
            title={user?.email}
          >
            {user?.email}
          </p>
          <button
            onClick={handleLogout}
            className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            style={{
              color: 'var(--text-secondary)',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              fontSize: '0.82rem',
            }}
          >
            <BsBoxArrowRight size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ───────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar mobile */}
        <header
          className="d-flex d-lg-none align-items-center justify-content-between px-3 py-2"
          style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            height: 56,
          }}
        >
          <div>
            <p className="mb-0 fw-bold" style={{ fontSize: '1.1rem', letterSpacing: '0.12em', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              NEXUS
            </p>
            <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '-2px' }}>
              Operaciones
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-sm"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-accent)', border: 'none', borderRadius: '0.5rem', padding: '0.4rem 0.6rem' }}
          >
            <BsBoxArrowRight size={16} />
          </button>
        </header>

        {/* Page content */}
        <main
          className="px-3 px-lg-4"
          style={{ flex: 1, paddingTop: '1.5rem', paddingBottom: '6rem' }}
        >
          <Outlet />
        </main>

        {/* ── Bottom nav mobile ─────────────────────── */}
        <nav
          className="d-flex d-lg-none align-items-center"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            zIndex: 100,
            height: 60,
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Nav items — 2 a la izquierda, 2 a la derecha, FAB en el centro */}
          {NAV_ITEMS.slice(0, 2).map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem',
                padding: '0.4rem 0',
                textDecoration: 'none',
                fontSize: '0.6rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                flex: 1,
              })}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}

          {/* FAB — centro */}
          <div className="d-flex justify-content-center" style={{ flex: 1 }}>
            <button
              onClick={() => setShowVisitModal(true)}
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(14,165,233,0.5)',
                transform: 'translateY(-10px)',
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                flexShrink: 0,
              }}
              onTouchStart={(e) => { e.currentTarget.style.transform = 'translateY(-10px) scale(0.95)' }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = 'translateY(-10px)' }}
            >
              <BsClipboardPlusFill size={22} />
            </button>
          </div>

          {NAV_ITEMS.slice(2, 4).map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem',
                padding: '0.4rem 0',
                textDecoration: 'none',
                fontSize: '0.6rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                flex: 1,
              })}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Modal selección rápida */}
      {showVisitModal && <QuickVisitModal onClose={() => setShowVisitModal(false)} />}
    </div>
  )
}
