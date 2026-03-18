import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { BsSearch, BsChevronRight, BsChevronLeft, BsX, BsCpu } from 'react-icons/bs'

export default function QuickVisitModal({ onClose }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: cliente, 2: máquina
  const [clientes, setClientes] = useState([])
  const [maquinas, setMaquinas] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDocs(query(collection(db, 'clientes'), orderBy('razonSocial'))).then((snap) => {
      setClientes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  const seleccionarCliente = async (cliente) => {
    setClienteSeleccionado(cliente)
    setLoading(true)
    setBusqueda('')
    const snap = await getDocs(
      query(collection(db, 'clientes', cliente.id, 'maquinas'), orderBy('nombre'))
    )
    setMaquinas(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    setLoading(false)
    setStep(2)
  }

  const seleccionarMaquina = (maquina) => {
    onClose()
    navigate(`/admin/visitas/nueva/${maquina.id}?cliente=${clienteSeleccionado.id}`)
  }

  const filtrados = step === 1
    ? clientes.filter((c) => c.razonSocial?.toLowerCase().includes(busqueda.toLowerCase()))
    : maquinas.filter((m) => m.nombre?.toLowerCase().includes(busqueda.toLowerCase()))

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end align-items-sm-center justify-content-center"
      style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1055, backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-100"
        style={{
          maxWidth: 480,
          maxHeight: '85vh',
          background: 'var(--bg-secondary)',
          borderRadius: '1.25rem 1.25rem 0 0',
          borderTopLeftRadius: '1.25rem',
          borderTopRightRadius: '1.25rem',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        // En desktop hacemos border-radius completo
        ref={(el) => {
          if (el && window.innerWidth >= 576) {
            el.style.borderRadius = '1rem'
          }
        }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="d-flex align-items-center gap-3 mb-3">
            {step === 2 && (
              <button
                onClick={() => { setStep(1); setBusqueda('') }}
                className="btn btn-sm p-1"
                style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}
              >
                <BsChevronLeft size={18} />
              </button>
            )}
            <div className="flex-grow-1">
              <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
                {step === 1 ? 'Seleccioná el cliente' : clienteSeleccionado?.razonSocial}
              </h6>
              <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
                {step === 1 ? 'Paso 1 de 2' : 'Paso 2 de 2 — Seleccioná la máquina'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn btn-sm p-1"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-accent)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <BsX size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="input-group">
            <span className="input-group-text" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRight: 'none', color: 'var(--text-secondary)' }}>
              <BsSearch size={13} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder={step === 1 ? 'Buscar cliente...' : 'Buscar máquina...'}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderLeft: 'none' }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
              <p className="mb-0 small">{busqueda ? 'Sin resultados' : step === 2 ? 'Este cliente no tiene máquinas' : 'No hay clientes'}</p>
            </div>
          ) : (
            <div>
              {filtrados.map((item) => (
                <button
                  key={item.id}
                  onClick={() => step === 1 ? seleccionarCliente(item) : seleccionarMaquina(item)}
                  className="w-100 text-start px-4 py-3 d-flex align-items-center justify-content-between gap-2"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ minWidth: 0 }}>
                    <p className="mb-0 fw-semibold text-truncate" style={{ color: 'var(--text-primary)' }}>
                      {step === 1 ? item.razonSocial : item.nombre}
                    </p>
                    {step === 1 && (
                      <p className="mb-0 small text-truncate" style={{ color: 'var(--text-secondary)' }}>
                        {item.contactoNombre}
                      </p>
                    )}
                    {step === 2 && item.modelo && (
                      <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>{item.modelo}</p>
                    )}
                  </div>
                  {step === 1 ? (
                    <BsChevronRight size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                  ) : (
                    <span
                      className="px-2 py-1 rounded-2 small fw-semibold"
                      style={{ background: 'var(--primary-gradient)', color: '#fff', flexShrink: 0, fontSize: '0.75rem' }}
                    >
                      Ir
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
