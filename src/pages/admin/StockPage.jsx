import { useEffect, useState } from 'react'
import {
  collection, getDocs, addDoc, doc, updateDoc, deleteDoc,
  orderBy, query, writeBatch, serverTimestamp, Timestamp, increment,
} from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { insumoSchema, compraSchema } from '../../lib/schemas'
import { formatFecha } from '../../lib/negocio'
import { BsPlus, BsBoxSeam, BsPencil, BsTrash, BsCartPlus, BsExclamationTriangle } from 'react-icons/bs'

const inputStyle = {
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
}

const UNIDADES = ['kg', 'g', 'litros', 'ml', 'unidades', 'sobres', 'cajas', 'bolsas']

// ── Modal genérico ────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="p-4 rounded-3 w-100" style={{ maxWidth: 420, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="mb-0" style={{ color: 'var(--text-primary)' }}>{title}</h6>
          <button onClick={onClose} className="btn btn-sm" style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function CAMPO({ label, error, children }) {
  return (
    <div className="mb-3">
      <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
      {error && <p className="mt-1 mb-0" style={{ color: 'var(--danger-color)', fontSize: '0.75rem' }}>{error}</p>}
    </div>
  )
}

function hoy() {
  return new Date().toISOString().split('T')[0]
}

// ── Componente principal ──────────────────────────────
export default function StockPage() {
  const [insumos, setInsumos]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null) // 'nuevo' | 'editar' | 'compra'
  const [selected, setSelected]     = useState(null)
  const [errors, setErrors]         = useState({})
  const [saving, setSaving]         = useState(false)

  // Forms
  const [formInsumo, setFormInsumo] = useState({ nombre: '', unidad: 'kg', stockMinimo: '' })
  const [formCompra, setFormCompra] = useState({ insumoId: '', cantidad: '', fecha: hoy(), notas: '' })

  const cargarInsumos = () => {
    getDocs(query(collection(db, 'insumos'), orderBy('nombre'))).then((snap) => {
      setInsumos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }

  useEffect(() => { cargarInsumos() }, [])

  const closeModal = () => { setModal(null); setSelected(null); setErrors({}); setSaving(false) }

  // ── Guardar insumo (nuevo o editar) ──────────────────
  const handleGuardarInsumo = async (e) => {
    e.preventDefault()
    const result = insumoSchema.safeParse(formInsumo)
    if (!result.success) {
      const errs = {}
      result.error.issues.forEach((err) => { errs[err.path[0]] = err.message })
      setErrors(errs)
      return
    }
    setSaving(true)
    try {
      if (selected) {
        await updateDoc(doc(db, 'insumos', selected.id), { ...result.data, updatedAt: serverTimestamp() })
      } else {
        await addDoc(collection(db, 'insumos'), { ...result.data, stockActual: 0, createdAt: serverTimestamp() })
      }
      cargarInsumos()
      closeModal()
    } catch (err) {
      setErrors({ _global: err.message })
    } finally {
      setSaving(false)
    }
  }

  // ── Registrar compra (entrada de stock) ──────────────
  const handleCompra = async (e) => {
    e.preventDefault()
    const result = compraSchema.safeParse(formCompra)
    if (!result.success) {
      const errs = {}
      result.error.issues.forEach((err) => { errs[err.path[0]] = err.message })
      setErrors(errs)
      return
    }
    setSaving(true)
    try {
      const insumo = insumos.find((i) => i.id === result.data.insumoId)
      const batch = writeBatch(db)

      // Registrar compra
      const compraRef = doc(collection(db, 'compras'))
      batch.set(compraRef, {
        insumoId:     result.data.insumoId,
        insumoNombre: insumo?.nombre ?? '',
        cantidad:     result.data.cantidad,
        unidad:       insumo?.unidad ?? '',
        fecha:        Timestamp.fromDate(new Date(result.data.fecha + 'T12:00:00')),
        notas:        result.data.notas || '',
        createdAt:    serverTimestamp(),
      })

      // Incrementar stock
      batch.update(doc(db, 'insumos', result.data.insumoId), {
        stockActual: increment(result.data.cantidad),
        updatedAt:   serverTimestamp(),
      })

      await batch.commit()
      cargarInsumos()
      closeModal()
    } catch (err) {
      setErrors({ _global: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (insumo) => {
    if (!confirm(`¿Eliminar "${insumo.nombre}"?`)) return
    await deleteDoc(doc(db, 'insumos', insumo.id))
    cargarInsumos()
  }

  const abrirEditar = (insumo) => {
    setSelected(insumo)
    setFormInsumo({ nombre: insumo.nombre, unidad: insumo.unidad, stockMinimo: insumo.stockMinimo ?? '' })
    setErrors({})
    setModal('editar')
  }

  const abrirCompra = (insumo = null) => {
    setFormCompra({ insumoId: insumo?.id ?? '', cantidad: '', fecha: hoy(), notas: '' })
    setErrors({})
    setModal('compra')
  }

  const bajStock = insumos.filter((i) => (i.stockActual ?? 0) <= (i.stockMinimo ?? 0))

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>Stock de insumos</h5>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-theme-secondary d-flex align-items-center gap-1"
            onClick={() => abrirCompra()}
          >
            <BsCartPlus size={15} /> Registrar compra
          </button>
          <button
            className="btn btn-sm btn-theme-primary d-flex align-items-center gap-1"
            onClick={() => { setFormInsumo({ nombre: '', unidad: 'kg', stockMinimo: '' }); setErrors({}); setModal('nuevo') }}
          >
            <BsPlus size={17} /> Nuevo insumo
          </button>
        </div>
      </div>

      {/* Alerta stock bajo */}
      {bajStock.length > 0 && (
        <div className="p-3 rounded-3 mb-3 d-flex align-items-start gap-2"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid var(--warning-color)' }}>
          <BsExclamationTriangle style={{ color: 'var(--warning-color)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="mb-0 small fw-semibold" style={{ color: 'var(--warning-color)' }}>Stock bajo</p>
            <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
              {bajStock.map((i) => i.nombre).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
        </div>
      ) : insumos.length === 0 ? (
        <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
          <BsBoxSeam size={32} className="mb-2 opacity-50" />
          <p className="mb-0 small">No hay insumos. Agregá el primero.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {insumos.map((ins) => {
            const bajo = (ins.stockActual ?? 0) <= (ins.stockMinimo ?? 0)
            return (
              <div
                key={ins.id}
                className="p-3 rounded-3 d-flex align-items-center justify-content-between gap-2"
                style={{ background: 'var(--bg-secondary)', border: `1px solid ${bajo ? 'var(--warning-color)' : 'var(--border-color)'}` }}
              >
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <p className="mb-0 fw-semibold text-truncate" style={{ color: 'var(--text-primary)' }}>{ins.nombre}</p>
                  <p className="mb-0 small" style={{ color: bajo ? 'var(--warning-color)' : 'var(--text-secondary)' }}>
                    Stock: <strong style={{ color: bajo ? 'var(--warning-color)' : 'var(--primary-color)' }}>
                      {ins.stockActual ?? 0} {ins.unidad}
                    </strong>
                    {ins.stockMinimo > 0 && (
                      <span style={{ color: 'var(--text-secondary)' }}> · mín. {ins.stockMinimo} {ins.unidad}</span>
                    )}
                  </p>
                </div>
                <div className="d-flex gap-1 flex-shrink-0">
                  <button
                    className="btn btn-sm d-flex align-items-center gap-1"
                    onClick={() => abrirCompra(ins)}
                    style={{ color: 'var(--primary-color)', background: 'transparent', border: '1px solid var(--primary-color)', borderRadius: '0.5rem', fontSize: '0.8rem' }}
                  >
                    <BsCartPlus size={14} /> <span className="d-none d-sm-inline">Cargar</span>
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => abrirEditar(ins)}
                    style={{ color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
                  >
                    <BsPencil size={13} />
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleEliminar(ins)}
                    style={{ color: 'var(--danger-color)', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
                  >
                    <BsTrash size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal nuevo/editar insumo ── */}
      {(modal === 'nuevo' || modal === 'editar') && (
        <Modal title={modal === 'editar' ? 'Editar insumo' : 'Nuevo insumo'} onClose={closeModal}>
          <form onSubmit={handleGuardarInsumo}>
            <CAMPO label="Nombre *" error={errors.nombre}>
              <input className="form-control" style={inputStyle} value={formInsumo.nombre}
                onChange={(e) => setFormInsumo((f) => ({ ...f, nombre: e.target.value }))} />
            </CAMPO>
            <div className="row g-2">
              <div className="col-7">
                <CAMPO label="Unidad *" error={errors.unidad}>
                  <select className="form-control" style={{ ...inputStyle, appearance: 'auto' }}
                    value={formInsumo.unidad}
                    onChange={(e) => setFormInsumo((f) => ({ ...f, unidad: e.target.value }))}>
                    {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </CAMPO>
              </div>
              <div className="col-5">
                <CAMPO label="Stock mínimo" error={errors.stockMinimo}>
                  <input type="number" className="form-control" style={inputStyle} min={0} step="0.01"
                    value={formInsumo.stockMinimo}
                    onChange={(e) => setFormInsumo((f) => ({ ...f, stockMinimo: e.target.value }))} />
                </CAMPO>
              </div>
            </div>
            {errors._global && <p className="small mb-2" style={{ color: 'var(--danger-color)' }}>{errors._global}</p>}
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-theme-primary" disabled={saving}>
                {saving ? 'Guardando...' : modal === 'editar' ? 'Guardar cambios' : 'Crear insumo'}
              </button>
              <button type="button" className="btn btn-theme-secondary" onClick={closeModal}>Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal registrar compra ── */}
      {modal === 'compra' && (
        <Modal title="Registrar compra" onClose={closeModal}>
          <form onSubmit={handleCompra}>
            <CAMPO label="Insumo *" error={errors.insumoId}>
              <select className="form-control" style={{ ...inputStyle, appearance: 'auto' }}
                value={formCompra.insumoId}
                onChange={(e) => setFormCompra((f) => ({ ...f, insumoId: e.target.value }))}>
                <option value="">Seleccioná un insumo</option>
                {insumos.map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre} ({i.stockActual ?? 0} {i.unidad})</option>
                ))}
              </select>
            </CAMPO>
            <div className="row g-2">
              <div className="col-6">
                <CAMPO label="Cantidad *" error={errors.cantidad}>
                  <input type="number" className="form-control" style={inputStyle} min={0} step="0.01"
                    value={formCompra.cantidad}
                    onChange={(e) => setFormCompra((f) => ({ ...f, cantidad: e.target.value }))} />
                </CAMPO>
              </div>
              <div className="col-6">
                <CAMPO label="Fecha *" error={errors.fecha}>
                  <input type="date" className="form-control" style={inputStyle}
                    value={formCompra.fecha}
                    onChange={(e) => setFormCompra((f) => ({ ...f, fecha: e.target.value }))} />
                </CAMPO>
              </div>
            </div>
            <CAMPO label="Notas" error={errors.notas}>
              <input className="form-control" style={inputStyle} placeholder="Opcional"
                value={formCompra.notas}
                onChange={(e) => setFormCompra((f) => ({ ...f, notas: e.target.value }))} />
            </CAMPO>
            {errors._global && <p className="small mb-2" style={{ color: 'var(--danger-color)' }}>{errors._global}</p>}
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-theme-primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Confirmar compra'}
              </button>
              <button type="button" className="btn btn-theme-secondary" onClick={closeModal}>Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
