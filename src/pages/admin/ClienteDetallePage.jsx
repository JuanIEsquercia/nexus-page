import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, getDocs, orderBy, query, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { formatFecha } from '../../lib/negocio'
import { BsChevronLeft, BsPencil, BsTrash, BsPlus, BsCpu, BsCalendar3 } from 'react-icons/bs'

export default function ClienteDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [maquinas, setMaquinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    Promise.all([
      getDoc(doc(db, 'clientes', id)),
      getDocs(query(collection(db, 'clientes', id, 'maquinas'), orderBy('nombre'))),
    ]).then(([clienteSnap, maqSnap]) => {
      if (clienteSnap.exists()) setCliente({ id: clienteSnap.id, ...clienteSnap.data() })
      setMaquinas(maqSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [id])

  const handleDelete = async () => {
    await deleteDoc(doc(db, 'clientes', id))
    navigate('/admin/clientes')
  }

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
    </div>
  )
  if (!cliente) return <p style={{ color: 'var(--text-secondary)' }}>Cliente no encontrado.</p>

  return (
    <div style={{ maxWidth: 680 }}>
      <Link to="/admin/clientes" className="d-inline-flex align-items-center gap-1 mb-3 text-decoration-none small" style={{ color: 'var(--text-secondary)' }}>
        <BsChevronLeft size={12} /> Clientes
      </Link>

      {/* Header */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-1" style={{ color: 'var(--text-primary)' }}>{cliente.razonSocial}</h5>
          <div className="d-flex align-items-center gap-2">
            <BsCalendar3 size={12} style={{ color: 'var(--text-secondary)' }} />
            <span className="small" style={{ color: 'var(--text-secondary)' }}>
              Día de cobro: <strong style={{ color: 'var(--primary-color)' }}>{cliente.diaCobro}</strong>
            </span>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link
            to={`/admin/clientes/${id}/editar`}
            className="btn btn-sm d-flex align-items-center gap-1 btn-theme-secondary"
          >
            <BsPencil size={12} /> Editar
          </Link>
          <button
            className="btn btn-sm d-flex align-items-center gap-1"
            onClick={() => setConfirmDelete(true)}
            style={{ border: '1px solid var(--danger-color)', color: 'var(--danger-color)', background: 'transparent', borderRadius: '0.5rem' }}
          >
            <BsTrash size={12} />
          </button>
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger-color)' }}>
          <span className="small" style={{ color: 'var(--text-primary)' }}>¿Eliminar este cliente? No se puede deshacer.</span>
          <div className="d-flex gap-2">
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Confirmar</button>
            <button className="btn btn-sm btn-theme-secondary" onClick={() => setConfirmDelete(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-sm-6">
          <div className="p-3 rounded-3 h-100" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <p className="small fw-bold mb-2" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em' }}>Empresa</p>
            <Row label="CUIT" value={cliente.cuit} />
            <Row label="Dirección" value={cliente.direccion} />
          </div>
        </div>
        <div className="col-12 col-sm-6">
          <div className="p-3 rounded-3 h-100" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <p className="small fw-bold mb-2" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em' }}>Contacto</p>
            <Row label="Nombre" value={cliente.contactoNombre} />
            <Row label="Teléfono" value={cliente.contactoTelefono} />
            <Row label="Email" value={cliente.contactoEmail} />
          </div>
        </div>
        {cliente.notas && (
          <div className="col-12">
            <div className="p-3 rounded-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <p className="small fw-bold mb-1" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em' }}>Notas</p>
              <p className="mb-0 small" style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{cliente.notas}</p>
            </div>
          </div>
        )}
      </div>

      {/* Máquinas */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="mb-0" style={{ color: 'var(--text-primary)' }}>
          Máquinas <span className="small fw-normal" style={{ color: 'var(--text-secondary)' }}>({maquinas.length})</span>
        </h6>
        <Link
          to={`/admin/clientes/${id}/maquinas/nueva`}
          className="btn btn-sm btn-theme-primary d-flex align-items-center gap-1"
        >
          <BsPlus size={16} /> Nueva máquina
        </Link>
      </div>

      {maquinas.length === 0 ? (
        <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
          <BsCpu size={28} className="mb-2 opacity-50" />
          <p className="mb-0 small">Todavía no hay máquinas registradas.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {maquinas.map((m) => (
            <Link key={m.id} to={`/admin/maquinas/${m.id}?cliente=${id}`} className="text-decoration-none">
              <div
                className="p-3 rounded-3 d-flex align-items-center justify-content-between"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', transition: 'border-color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div>
                  <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>{m.nombre}</p>
                  <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
                    {m.modelo && `${m.modelo} · `}
                    {m.ultimaVisita ? `Última visita: ${formatFecha(m.ultimaVisita)}` : 'Sin visitas aún'}
                  </p>
                </div>
                {m.contadorActual != null && (
                  <div className="text-end flex-shrink-0 ms-3">
                    <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Contador</p>
                    <p className="mb-0 fw-semibold" style={{ color: 'var(--primary-color)' }}>{m.contadorActual.toLocaleString('es-AR')}</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <p className="mb-1 small" style={{ color: 'var(--text-secondary)' }}>
      <span style={{ color: 'var(--text-primary)' }}>{label}:</span> {value}
    </p>
  )
}
