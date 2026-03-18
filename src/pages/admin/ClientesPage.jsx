import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { BsPlus, BsSearch, BsBuilding, BsChevronRight } from 'react-icons/bs'

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'clientes'), orderBy('razonSocial'))
    getDocs(q).then((snap) => {
      setClientes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  const filtrados = clientes.filter((c) =>
    c.razonSocial?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.cuit?.includes(busqueda) ||
    c.contactoNombre?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>Clientes</h5>
        <Link
          to="/admin/clientes/nuevo"
          className="btn btn-sm btn-theme-primary d-flex align-items-center gap-1"
        >
          <BsPlus size={18} /> Nuevo cliente
        </Link>
      </div>

      {/* Buscador */}
      <div className="input-group mb-3" style={{ maxWidth: 380 }}>
        <span className="input-group-text" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          <BsSearch size={14} />
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre, CUIT o contacto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
        />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
          <BsBuilding size={36} className="mb-2 opacity-50" />
          <p className="mb-0">{busqueda ? 'Sin resultados' : 'No hay clientes aún'}</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {filtrados.map((c) => (
            <Link
              key={c.id}
              to={`/admin/clientes/${c.id}`}
              className="text-decoration-none"
            >
              <div
                className="p-3 rounded-3 d-flex align-items-center justify-content-between"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', transition: 'border-color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div style={{ minWidth: 0 }}>
                  <p className="mb-0 fw-semibold text-truncate" style={{ color: 'var(--text-primary)' }}>{c.razonSocial}</p>
                  <p className="mb-0 small text-truncate" style={{ color: 'var(--text-secondary)' }}>
                    {[c.contactoNombre, c.contactoTelefono].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
                  {c.diaCobro && (
                    <span className="small" style={{ color: 'var(--text-secondary)' }}>Día {c.diaCobro}</span>
                  )}
                  <BsChevronRight size={13} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
