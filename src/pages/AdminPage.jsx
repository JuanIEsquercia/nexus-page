import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import {
  BsPeopleFill, BsBoxSeam, BsCalendar3,
  BsExclamationTriangle, BsChevronRight,
} from 'react-icons/bs'

function diasParaCobro(diaCobro) {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes = hoy.getMonth()
  let fecha = new Date(anio, mes, diaCobro)
  if (fecha <= hoy) fecha = new Date(anio, mes + 1, diaCobro)
  return Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24))
}

export default function AdminPage() {
  const [clientes, setClientes] = useState([])
  const [insumos, setInsumos]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      getDocs(query(collection(db, 'clientes'), orderBy('razonSocial'))),
      getDocs(query(collection(db, 'insumos'), orderBy('nombre'))),
    ]).then(([cliSnap, insSnap]) => {
      setClientes(cliSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setInsumos(insSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  const alertasCobro = clientes
    .filter((c) => { const d = diasParaCobro(c.diaCobro); return d >= 0 && d <= 7 })
    .sort((a, b) => diasParaCobro(a.diaCobro) - diasParaCobro(b.diaCobro))

  const bajStock = insumos.filter((i) => (i.stockActual ?? 0) <= (i.stockMinimo ?? 0) && (i.stockMinimo ?? 0) > 0)

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
    </div>
  )

  return (
    <div>
      <h5 className="mb-4" style={{ color: 'var(--text-primary)' }}>Dashboard</h5>

      {/* Stats */}
      <div className="row g-2 mb-4">
        <div className="col-6 col-sm-4">
          <Link to="/admin/clientes" className="text-decoration-none">
            <div
              className="p-3 rounded-3 text-center"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', transition: 'border-color 0.15s' }}
            >
              <BsPeopleFill size={18} style={{ color: 'var(--primary-color)' }} className="mb-1" />
              <p className="mb-0 fw-bold" style={{ color: 'var(--text-primary)', fontSize: '1.4rem', lineHeight: 1.2 }}>{clientes.length}</p>
              <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Clientes</p>
            </div>
          </Link>
        </div>
        <div className="col-6 col-sm-4">
          <Link to="/admin/stock" className="text-decoration-none">
            <div
              className="p-3 rounded-3 text-center"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', transition: 'border-color 0.15s' }}
            >
              <BsBoxSeam size={18} style={{ color: 'var(--primary-color)' }} className="mb-1" />
              <p className="mb-0 fw-bold" style={{ color: 'var(--text-primary)', fontSize: '1.4rem', lineHeight: 1.2 }}>{insumos.length}</p>
              <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Insumos</p>
            </div>
          </Link>
        </div>
        <div className="col-12 col-sm-4">
          <Link to="/admin/stock" className="text-decoration-none">
            <div
              className="p-3 rounded-3 text-center"
              style={{
                background: bajStock.length > 0 ? 'rgba(245,158,11,0.06)' : 'var(--bg-secondary)',
                border: `1px solid ${bajStock.length > 0 ? 'var(--warning-color)' : 'var(--border-color)'}`,
                transition: 'border-color 0.15s',
              }}
            >
              <BsExclamationTriangle size={18} style={{ color: bajStock.length > 0 ? 'var(--warning-color)' : 'var(--text-secondary)' }} className="mb-1" />
              <p className="mb-0 fw-bold" style={{ color: bajStock.length > 0 ? 'var(--warning-color)' : 'var(--text-primary)', fontSize: '1.4rem', lineHeight: 1.2 }}>{bajStock.length}</p>
              <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Stock bajo</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Alertas de cobro */}
      {alertasCobro.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 small fw-semibold d-flex align-items-center gap-2" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.06em' }}>
            <BsCalendar3 size={12} /> Cobros próximos
          </p>
          <div className="d-flex flex-column gap-2">
            {alertasCobro.map((c) => {
              const dias = diasParaCobro(c.diaCobro)
              return (
                <Link key={c.id} to={`/admin/clientes/${c.id}`} className="text-decoration-none">
                  <div
                    className="p-3 rounded-3 d-flex align-items-center justify-content-between"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', transition: 'border-color 0.15s' }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p className="mb-0 fw-semibold text-truncate" style={{ color: 'var(--text-primary)' }}>{c.razonSocial}</p>
                      <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Día {c.diaCobro}</p>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
                      <span
                        className="px-2 py-1 rounded-2 fw-semibold"
                        style={{
                          background: dias <= 1 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: dias <= 1 ? 'var(--danger-color)' : 'var(--warning-color)',
                          fontSize: '0.72rem',
                        }}
                      >
                        {dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `${dias} días`}
                      </span>
                      <BsChevronRight size={12} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Stock bajo */}
      {bajStock.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 small fw-semibold d-flex align-items-center gap-2" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.06em' }}>
            <BsExclamationTriangle size={12} style={{ color: 'var(--warning-color)' }} /> Stock bajo
          </p>
          <div className="p-3 rounded-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid var(--warning-color)' }}>
            <div className="d-flex flex-column gap-2 mb-3">
              {bajStock.map((i) => (
                <div key={i.id} className="d-flex align-items-center justify-content-between">
                  <span className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>{i.nombre}</span>
                  <span className="small" style={{ color: 'var(--warning-color)' }}>
                    {i.stockActual ?? 0} {i.unidad} <span style={{ color: 'var(--text-secondary)' }}>/ mín. {i.stockMinimo}</span>
                  </span>
                </div>
              ))}
            </div>
            <Link
              to="/admin/stock"
              className="btn btn-sm d-inline-flex align-items-center gap-1"
              style={{ color: 'var(--warning-color)', background: 'transparent', border: '1px solid var(--warning-color)', borderRadius: '0.5rem' }}
            >
              Ir a Stock
            </Link>
          </div>
        </div>
      )}

      {/* Empty state — sin datos aún */}
      {clientes.length === 0 && (
        <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
          <p className="mb-1 small">Todavía no hay datos.</p>
          <p className="mb-3 small">Empezá agregando el primer cliente.</p>
          <Link
            to="/admin/clientes/nuevo"
            className="btn btn-sm"
            style={{ background: 'var(--primary-gradient)', color: '#fff', border: 'none' }}
          >
            Nuevo cliente
          </Link>
        </div>
      )}
    </div>
  )
}
