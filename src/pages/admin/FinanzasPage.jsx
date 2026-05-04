import { useEffect, useState, useMemo } from 'react'
import {
  collection, getDocs, addDoc, doc, updateDoc, deleteDoc,
  query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { movimientoSchema } from '../../lib/schemas'
import {
  BsPlus, BsTrash, BsCheckCircleFill,
  BsClockFill, BsArrowUpCircleFill, BsArrowDownCircleFill,
  BsXLg, BsChevronLeft, BsChevronRight, BsExclamationTriangleFill,
} from 'react-icons/bs'

// ── Constantes ────────────────────────────────────────────

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const CATEGORIAS = {
  ingreso: ['Cobro cliente', 'Subsidio', 'Otro ingreso'],
  egreso:  ['Insumos', 'Alquiler', 'Mantenimiento', 'Sueldo', 'Servicios', 'Impuestos', 'Otro egreso'],
}

const FORM_INICIAL = { tipo: 'ingreso', estado: 'confirmado', descripcion: '', categoria: '', monto: '', vencimiento: '', notas: '' }

// ── Utilidades ────────────────────────────────────────────

function periodoKey(mes, anio) {
  return `${anio}-${String(mes + 1).padStart(2, '0')}`
}

// Deriva el período directamente del campo vencimiento (YYYY-MM-DD → YYYY-MM)
function periodoDeVencimiento(vencimiento) {
  return vencimiento.slice(0, 7)
}

function formatMonto(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function formatFecha(str) {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

function hoy() {
  return new Date().toISOString().split('T')[0]
}

function labelMes(periodo) {
  const [y, m] = periodo.split('-')
  return `${MESES[parseInt(m) - 1]} ${y}`
}

// ── Sub-componentes ───────────────────────────────────────

function SummaryCard({ label, monto, color, icon: Icon, sub }) {
  return (
    <div
      className="rounded-3 p-3"
      style={{ background: 'var(--bg-secondary)', border: `1px solid ${color}33`, flex: '1 1 140px', minWidth: 0 }}
    >
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="small" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{label}</span>
        <Icon size={16} style={{ color, flexShrink: 0 }} />
      </div>
      <p className="mb-0 fw-bold" style={{ color, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
        {formatMonto(monto)}
      </p>
      {sub && <p className="mb-0 mt-1" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{sub}</p>}
    </div>
  )
}

function MovimientoRow({ mov, onConfirm, onDelete, extraLabel }) {
  const esIngreso   = mov.tipo === 'ingreso'
  const esPendiente = mov.estado === 'pendiente'
  const esVencido   = esPendiente && mov.vencimiento && mov.vencimiento < hoy()
  const color       = esIngreso ? 'var(--success-color)' : 'var(--danger-color)'
  const signo       = esIngreso ? '+' : '−'

  return (
    <div
      className="px-3 py-2 d-flex align-items-center gap-3"
      style={{ borderBottom: '1px solid var(--border-color)' }}
    >
      <div style={{ flexShrink: 0 }}>
        {esIngreso
          ? <BsArrowUpCircleFill   size={18} style={{ color: esPendiente ? 'rgba(34,197,94,0.4)'  : 'var(--success-color)' }} />
          : <BsArrowDownCircleFill size={18} style={{ color: esPendiente ? 'rgba(239,68,68,0.4)' : 'var(--danger-color)'  }} />
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="mb-0 small fw-semibold text-truncate" style={{ color: 'var(--text-primary)' }}>
          {mov.descripcion}
        </p>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{mov.categoria}</span>
          <span style={{ color: 'var(--border-color)', fontSize: '0.7rem' }}>·</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{formatFecha(mov.vencimiento)}</span>
          {extraLabel && (
            <>
              <span style={{ color: 'var(--border-color)', fontSize: '0.7rem' }}>·</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>{extraLabel}</span>
            </>
          )}
          {esPendiente && (
            <>
              <span style={{ color: 'var(--border-color)', fontSize: '0.7rem' }}>·</span>
              {esVencido
                ? <span className="d-flex align-items-center gap-1" style={{ color: 'var(--danger-color)', fontSize: '0.68rem', fontWeight: 600 }}>
                    <BsExclamationTriangleFill size={9} /> Vencido
                  </span>
                : <span className="d-flex align-items-center gap-1" style={{ color: '#f59e0b', fontSize: '0.68rem', fontWeight: 600 }}>
                    <BsClockFill size={9} /> Pendiente
                  </span>
              }
            </>
          )}
        </div>
      </div>

      <p
        className="mb-0 fw-bold flex-shrink-0"
        style={{
          color: esPendiente ? (esIngreso ? 'rgba(34,197,94,0.55)' : 'rgba(239,68,68,0.55)') : color,
          fontSize: '0.9rem', minWidth: 80, textAlign: 'right',
        }}
      >
        {signo}{formatMonto(mov.monto)}
      </p>

      <div className="d-flex gap-1 flex-shrink-0">
        {esPendiente && (
          <button
            onClick={() => onConfirm(mov.id)}
            title={mov.tipo === 'ingreso' ? 'Marcar como cobrado' : 'Marcar como pagado'}
            className="btn btn-sm p-1 d-flex align-items-center gap-1"
            style={{
              color: 'var(--success-color)', background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.4rem',
              fontSize: '0.7rem', fontWeight: 600,
            }}
          >
            <BsCheckCircleFill size={12} />
            {mov.tipo === 'ingreso' ? 'Cobrado' : 'Pagado'}
          </button>
        )}
        <button
          onClick={() => onDelete(mov.id)}
          className="btn btn-sm p-1"
          style={{ color: 'var(--danger-color)', background: 'transparent', border: 'none', borderRadius: '0.4rem', opacity: 0.6 }}
        >
          <BsTrash size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Panel compromisos pendientes de otros períodos ────────

function VencimientosPanel({ items, periodoActual, onConfirm, onDelete }) {
  if (items.length === 0) return null

  const vencidos = items.filter(m => m.vencimiento && m.vencimiento < hoy())
  const futuros  = items.filter(m => !m.vencimiento || m.vencimiento >= hoy())

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-2">
        <BsClockFill size={13} style={{ color: '#f59e0b' }} />
        <span className="fw-semibold" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
          Compromisos pendientes
        </span>
        {vencidos.length > 0 && (
          <span
            style={{
              background: 'rgba(239,68,68,0.15)', color: 'var(--danger-color)',
              borderRadius: '2rem', padding: '0.1rem 0.5rem', fontSize: '0.68rem', fontWeight: 600,
            }}
          >
            {vencidos.length} vencido{vencidos.length > 1 ? 's' : ''}
          </span>
        )}
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginLeft: 'auto' }}>
          Fuera del período actual
        </span>
      </div>

      <div
        className="rounded-3"
        style={{
          background: 'var(--bg-secondary)',
          border: vencidos.length > 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(245,158,11,0.25)',
          overflow: 'hidden',
        }}
      >
        {[...vencidos, ...futuros].map(mov => (
          <MovimientoRow
            key={mov.id}
            mov={mov}
            onConfirm={onConfirm}
            onDelete={onDelete}
            extraLabel={labelMes(mov.periodo)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Modal formulario ──────────────────────────────────────

function MovimientoModal({ saving, errors, onClose, onSave }) {
  const [form, setForm] = useState({ ...FORM_INICIAL, vencimiento: hoy() })

  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

  const labelStyle = { color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.3rem', display: 'block' }
  const inputStyle = {
    background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem',
    color: 'var(--text-primary)', padding: '0.5rem 0.75rem', width: '100%', fontSize: '0.875rem', outline: 'none',
  }
  const errStyle = { color: 'var(--danger-color)', fontSize: '0.72rem', marginTop: '0.2rem' }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1050,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%', maxWidth: 520,
          background: 'var(--bg-secondary)', borderRadius: '1.25rem',
          padding: '1.5rem 1.25rem',
          border: '1px solid var(--border-color)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>
            Nuevo movimiento
          </h6>
          <button onClick={onClose} className="btn p-1" style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}>
            <BsXLg size={16} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(form) }}>
          {/* Tipo */}
          <div className="mb-3">
            <label style={labelStyle}>Tipo</label>
            <div className="d-flex gap-2">
              {['ingreso', 'egreso'].map(t => (
                <button
                  key={t} type="button" onClick={() => set('tipo', t)}
                  style={{
                    flex: 1, padding: '0.55rem', borderRadius: '0.6rem',
                    fontSize: '0.875rem', fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                    ...(form.tipo === t
                      ? t === 'ingreso'
                        ? { background: 'rgba(34,197,94,0.12)',  borderColor: 'var(--success-color)', color: 'var(--success-color)' }
                        : { background: 'rgba(239,68,68,0.12)', borderColor: 'var(--danger-color)',  color: 'var(--danger-color)'  }
                      : { background: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }
                    ),
                  }}
                >
                  {t === 'ingreso' ? '↑ Ingreso' : '↓ Egreso / Deuda'}
                </button>
              ))}
            </div>
          </div>

          {/* Estado */}
          <div className="mb-3">
            <label style={labelStyle}>Estado</label>
            <div className="d-flex gap-2">
              {[['confirmado','Confirmado'],['pendiente','Pendiente']].map(([v, l]) => (
                <button
                  key={v} type="button" onClick={() => set('estado', v)}
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: '0.6rem',
                    fontSize: '0.82rem', fontWeight: 500, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                    ...(form.estado === v
                      ? v === 'confirmado'
                        ? { background: 'rgba(14,165,233,0.1)',   borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }
                        : { background: 'rgba(245,158,11,0.1)',   borderColor: '#f59e0b',              color: '#f59e0b'              }
                      : { background: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }
                    ),
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div className="mb-3">
            <label style={labelStyle}>Descripción</label>
            <input
              type="text" value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              placeholder="Ej: Cobro cliente Acme SA"
              style={{ ...inputStyle, borderColor: errors.descripcion ? 'var(--danger-color)' : 'var(--border-color)' }}
            />
            {errors.descripcion && <p style={errStyle}>{errors.descripcion}</p>}
          </div>

          {/* Monto + Vencimiento */}
          <div className="d-flex gap-2 mb-3">
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Monto ($)</label>
              <input
                type="number" value={form.monto}
                onChange={e => set('monto', e.target.value)}
                placeholder="0" min="0" step="0.01"
                style={{ ...inputStyle, borderColor: errors.monto ? 'var(--danger-color)' : 'var(--border-color)' }}
              />
              {errors.monto && <p style={errStyle}>{errors.monto}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Vencimiento</label>
              <input
                type="date" value={form.vencimiento}
                onChange={e => set('vencimiento', e.target.value)}
                style={{ ...inputStyle, borderColor: errors.vencimiento ? 'var(--danger-color)' : 'var(--border-color)' }}
              />
              {errors.vencimiento && <p style={errStyle}>{errors.vencimiento}</p>}
            </div>
          </div>

          {/* Categoría */}
          <div className="mb-3">
            <label style={labelStyle}>Categoría</label>
            <div className="d-flex flex-wrap gap-1 mb-2">
              {CATEGORIAS[form.tipo].map(cat => (
                <button
                  key={cat} type="button" onClick={() => set('categoria', cat)}
                  style={{
                    padding: '0.25rem 0.65rem', borderRadius: '2rem',
                    fontSize: '0.72rem', fontWeight: 500, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                    ...(form.categoria === cat
                      ? { background: 'rgba(14,165,233,0.12)', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }
                      : { background: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }
                    ),
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text" value={form.categoria}
              onChange={e => set('categoria', e.target.value)}
              placeholder="O escribí una categoría..."
              style={{ ...inputStyle, borderColor: errors.categoria ? 'var(--danger-color)' : 'var(--border-color)' }}
            />
            {errors.categoria && <p style={errStyle}>{errors.categoria}</p>}
          </div>

          {/* Notas */}
          <div className="mb-4">
            <label style={labelStyle}>Notas (opcional)</label>
            <textarea
              value={form.notas} onChange={e => set('notas', e.target.value)}
              rows={2} placeholder="Observaciones..."
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          <button
            type="submit" disabled={saving}
            className="btn w-100 d-flex align-items-center justify-content-center gap-2"
            style={{
              background: 'var(--primary-gradient)', color: '#fff', border: 'none',
              borderRadius: '0.75rem', padding: '0.7rem', fontWeight: 600, fontSize: '0.9rem',
              boxShadow: '0 4px 14px rgba(14,165,233,0.3)', opacity: saving ? 0.7 : 1,
            }}
          >
            <BsCheckCircleFill size={16} />
            {saving ? 'Guardando...' : 'Registrar movimiento'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────

export default function FinanzasPage() {
  const hoyDate = new Date()
  const [mes, setMes]         = useState(hoyDate.getMonth())
  const [anio, setAnio]       = useState(hoyDate.getFullYear())
  const [tab, setTab]         = useState('todos')
  const [movs, setMovs]       = useState([])
  const [todosPend, setTodosPend] = useState([])   // todos los pendientes cross-período
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [errors, setErrors]   = useState({})
  const [modal, setModal]     = useState(null)
  const [error, setError]     = useState(null)

  // Carga movimientos del período seleccionado
  useEffect(() => {
    setLoading(true)
    setError(null)
    const periodo = periodoKey(mes, anio)
    getDocs(query(collection(db, 'movimientos'), where('periodo', '==', periodo)))
      .then(snap => setMovs(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [mes, anio])

  // Carga todos los pendientes (cross-período) una sola vez al montar
  useEffect(() => {
    getDocs(query(collection(db, 'movimientos'), where('estado', '==', 'pendiente')))
      .then(snap => setTodosPend(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {})
  }, [])

  // Pendientes de otros períodos — siempre visible, ordenados por vencimiento
  const pendientesOtros = useMemo(() => {
    const periodoActual = periodoKey(mes, anio)
    return [...todosPend.filter(m => m.periodo !== periodoActual)]
      .sort((a, b) => (a.vencimiento ?? '').localeCompare(b.vencimiento ?? ''))
  }, [todosPend, mes, anio])

  const prevMes = () => { if (mes === 0) { setMes(11); setAnio(a => a - 1) } else setMes(m => m - 1) }
  const nextMes = () => { if (mes === 11) { setMes(0); setAnio(a => a + 1) } else setMes(m => m + 1) }

  const filtrados = useMemo(() => {
    if (tab === 'ingresos')   return movs.filter(m => m.tipo === 'ingreso')
    if (tab === 'egresos')    return movs.filter(m => m.tipo === 'egreso')
    if (tab === 'pendientes') return movs.filter(m => m.estado === 'pendiente')
    return movs
  }, [movs, tab])

  const ingresosConf  = movs.filter(m => m.tipo === 'ingreso' && m.estado === 'confirmado').reduce((s, m) => s + m.monto, 0)
  const egresoConf    = movs.filter(m => m.tipo === 'egreso'  && m.estado === 'confirmado').reduce((s, m) => s + m.monto, 0)
  const ingresosPend  = movs.filter(m => m.tipo === 'ingreso' && m.estado === 'pendiente').reduce((s, m) => s + m.monto, 0)
  const egresosPend   = movs.filter(m => m.tipo === 'egreso'  && m.estado === 'pendiente').reduce((s, m) => s + m.monto, 0)
  const resultadoReal = ingresosConf - egresoConf
  const resultadoProy = (ingresosConf + ingresosPend) - (egresoConf + egresosPend)

  const handleSave = async (formData) => {
    const resultado = movimientoSchema.safeParse(formData)
    if (!resultado.success) {
      const errs = {}
      resultado.error.errors.forEach(e => { errs[e.path[0]] = e.message })
      setErrors(errs)
      return
    }
    setErrors({})
    setSaving(true)

    // El período se deriva del vencimiento, no del mes que se está mirando
    const periodo = periodoDeVencimiento(resultado.data.vencimiento)
    const payload = { ...resultado.data, periodo, notas: formData.notas ?? '', creadoEl: serverTimestamp() }

    try {
      const ref = await addDoc(collection(db, 'movimientos'), payload)
      const nuevo = { id: ref.id, ...payload }

      // Si cae en el período actual, aparece en la lista principal
      if (periodo === periodoKey(mes, anio)) {
        setMovs(ms => [...ms, nuevo])
      }
      // Si es pendiente y es de otro período, aparece en el panel de vencimientos
      if (payload.estado === 'pendiente' && periodo !== periodoKey(mes, anio)) {
        setTodosPend(ms => [...ms, nuevo])
      }

      setModal(null)
    } catch (e) {
      setErrors({ _general: e.message })
    } finally {
      setSaving(false)
    }
  }

  const handleConfirm = async (id) => {
    try {
      await updateDoc(doc(db, 'movimientos', id), { estado: 'confirmado' })
      setMovs(ms => ms.map(m => m.id === id ? { ...m, estado: 'confirmado' } : m))
      setTodosPend(ms => ms.filter(m => m.id !== id))
    } catch (e) {
      alert('Error al confirmar: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este movimiento?')) return
    try {
      await deleteDoc(doc(db, 'movimientos', id))
      setMovs(ms => ms.filter(m => m.id !== id))
      setTodosPend(ms => ms.filter(m => m.id !== id))
    } catch (e) {
      alert('Error al eliminar: ' + e.message)
    }
  }

  const colorResultado = resultadoReal >= 0 ? 'var(--success-color)' : 'var(--danger-color)'

  const TAB_ITEMS = [
    { key: 'todos',      label: 'Todos',      count: movs.length },
    { key: 'ingresos',   label: 'Ingresos',   count: movs.filter(m => m.tipo === 'ingreso').length },
    { key: 'egresos',    label: 'Egresos',    count: movs.filter(m => m.tipo === 'egreso').length },
    { key: 'pendientes', label: 'Pendientes', count: movs.filter(m => m.estado === 'pendiente').length },
  ]

  return (
    <div>
      {/* ── Header ── */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <h5 className="mb-1 fw-bold" style={{ color: 'var(--text-primary)' }}>Finanzas</h5>
          <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
            Ingresos, egresos y deudas del período
          </p>
        </div>
        <button
          onClick={() => { setErrors({}); setModal('nuevo') }}
          className="btn d-flex align-items-center gap-2"
          style={{
            background: 'var(--primary-gradient)', color: '#fff', border: 'none',
            borderRadius: '0.65rem', padding: '0.5rem 1rem', fontWeight: 600,
            fontSize: '0.85rem', boxShadow: '0 4px 14px rgba(14,165,233,0.3)',
          }}
        >
          <BsPlus size={18} /> Nuevo movimiento
        </button>
      </div>

      {/* ── Panel compromisos de otros períodos — siempre visible ── */}
      <VencimientosPanel
        items={pendientesOtros}
        periodoActual={periodoKey(mes, anio)}
        onConfirm={handleConfirm}
        onDelete={handleDelete}
      />

      {/* ── Selector de período ── */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          onClick={prevMes}
          className="btn btn-sm p-1"
          style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
        >
          <BsChevronLeft size={14} />
        </button>
        <span className="fw-semibold" style={{ color: 'var(--text-primary)', minWidth: 150, textAlign: 'center', fontSize: '0.95rem' }}>
          {MESES[mes]} {anio}
        </span>
        <button
          onClick={nextMes}
          className="btn btn-sm p-1"
          style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
        >
          <BsChevronRight size={14} />
        </button>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
          <p className="mt-2 small" style={{ color: 'var(--text-secondary)' }}>Cargando movimientos...</p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger-color)' }}>
          <p className="mb-0 small" style={{ color: 'var(--danger-color)' }}>Error al cargar: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── Cards KPI ── */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            <SummaryCard
              label="Ingresos confirmados"
              monto={ingresosConf}
              color="var(--success-color)"
              icon={BsArrowUpCircleFill}
              sub={ingresosPend > 0 ? `+ ${formatMonto(ingresosPend)} pendiente` : undefined}
            />
            <SummaryCard
              label="Egresos confirmados"
              monto={egresoConf}
              color="var(--danger-color)"
              icon={BsArrowDownCircleFill}
              sub={egresosPend > 0 ? `+ ${formatMonto(egresosPend)} pendiente` : undefined}
            />
            <div
              className="rounded-3 p-3"
              style={{ background: 'var(--bg-secondary)', border: `1px solid ${colorResultado}33`, flex: '1 1 140px', minWidth: 0 }}
            >
              <p className="mb-2 small" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Resultado real</p>
              <p className="mb-0 fw-bold" style={{ color: colorResultado, fontSize: '1.1rem' }}>
                {resultadoReal >= 0 ? '+' : ''}{formatMonto(resultadoReal)}
              </p>
              <p className="mb-0 mt-1" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                Proyectado: {resultadoProy >= 0 ? '+' : ''}{formatMonto(resultadoProy)}
              </p>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div
            className="d-flex gap-1 mb-2 p-1 rounded-3"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            {TAB_ITEMS.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, padding: '0.4rem 0.5rem', borderRadius: '0.5rem',
                  fontSize: '0.78rem', fontWeight: tab === key ? 600 : 400,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: tab === key ? 'var(--bg-primary)' : 'transparent',
                  color: tab === key ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {label}
                {count > 0 && (
                  <span
                    className="ms-1"
                    style={{
                      background: tab === key ? 'var(--primary-color)' : 'var(--border-color)',
                      color: tab === key ? '#fff' : 'var(--text-secondary)',
                      borderRadius: '2rem', padding: '0 0.35rem', fontSize: '0.65rem', fontWeight: 600,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Lista de movimientos ── */}
          <div
            className="rounded-3"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', overflow: 'hidden' }}
          >
            {filtrados.length === 0 ? (
              <div className="py-5 text-center" style={{ color: 'var(--text-secondary)' }}>
                <BsCheckCircleFill size={28} className="mb-2 opacity-25" />
                <p className="mb-0 small">Sin movimientos en este período.</p>
              </div>
            ) : (
              [...filtrados]
                .sort((a, b) => {
                  if (a.estado !== b.estado) return a.estado === 'pendiente' ? -1 : 1
                  return (b.vencimiento ?? '').localeCompare(a.vencimiento ?? '')
                })
                .map(mov => (
                  <MovimientoRow
                    key={mov.id}
                    mov={mov}
                    onConfirm={handleConfirm}
                    onDelete={handleDelete}
                  />
                ))
            )}
          </div>
        </>
      )}

      {/* ── Modal ── */}
      {modal && (
        <MovimientoModal
          saving={saving}
          errors={errors}
          onClose={() => { setModal(null); setErrors({}) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
