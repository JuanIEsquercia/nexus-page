import { useEffect, useState } from 'react'
import {
  collection, getDocs, addDoc, doc, updateDoc, deleteDoc,
  orderBy, query, writeBatch, serverTimestamp, Timestamp, increment,
} from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { insumoSchema, compraSchema } from '../../lib/schemas'

const emptyItem = () => ({ insumoId: '', cantidad: '', precioItem: '' })
import { formatFecha } from '../../lib/negocio'
import { BsPlus, BsBoxSeam, BsPencil, BsTrash, BsCartPlus, BsExclamationTriangle, BsArrowCounterclockwise } from 'react-icons/bs'

const inputStyle = {
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
}

const UNIDADES = ['kg', 'g', 'litros', 'ml', 'unidades', 'sobres', 'cajas', 'bolsas']

// ── Modal genérico ──────────────────────────────────
function Modal({ title, onClose, children, maxWidth = 420 }) {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="p-4 rounded-3 w-100" style={{ maxWidth, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
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

// ── Componente principal ──────────────────────────
export default function StockPage() {
  const [insumos, setInsumos]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null) // 'nuevo' | 'editar' | 'compra'
  const [selected, setSelected]     = useState(null)
  const [errors, setErrors]         = useState({})
  const [saving, setSaving]         = useState(false)

  // Forms
  const [formInsumo, setFormInsumo] = useState({ nombre: '', unidad: 'kg', stockMinimo: '' })
  const [formCompra, setFormCompra] = useState({ fecha: hoy(), vencimiento: hoy(), notas: '', items: [emptyItem()] })

  const cargarInsumos = () => {
    getDocs(query(collection(db, 'insumos'), orderBy('nombre'))).then((snap) => {
      setInsumos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }

  useEffect(() => { cargarInsumos() }, [])

  const closeModal = () => { setModal(null); setSelected(null); setErrors({}); setSaving(false) }

  // ── Reset stock ──────────────────────────────
  const resetStock = async () => {
    if (!confirm('Esto pondrá el stock de TODOS los insumos en 0. ¿Confirmás? Esta acción no se puede deshacer.')) return
    setSaving(true)
    try {
      const batch = writeBatch(db)
      insumos.forEach((ins) => {
        batch.update(doc(db, 'insumos', ins.id), { stockActual: 0, updatedAt: serverTimestamp() })
      })
      await batch.commit()
      cargarInsumos()
      alert('Stock reiniciado a 0 en todos los insumos.')
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

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
        const stockCorregido = parseFloat(formInsumo.stockActual)
        const extra = !isNaN(stockCorregido) ? { stockActual: stockCorregido } : {}
        await updateDoc(doc(db, 'insumos', selected.id), { ...result.data, ...extra, updatedAt: serverTimestamp() })
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

  const addItem    = () => setFormCompra((f) => ({ ...f, items: [...f.items, emptyItem()] }))
  const removeItem = (idx) => setFormCompra((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  const updateItem = (idx, field, value) =>
    setFormCompra((f) => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [field]: value } : it) }))

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
      const batch          = writeBatch(db)
      const compraRef      = doc(collection(db, 'compras'))
      const vencimientoStr = result.data.vencimiento || result.data.fecha
      const precioTotal    = result.data.items.reduce((s, it) => s + (it.precioItem || 0), 0)

      // Egreso pendiente si hay precio
      let movimientoId = null
      if (precioTotal > 0) {
        const nombres = result.data.items
          .map((it) => insumos.find((i) => i.id === it.insumoId)?.nombre ?? '')
          .join(', ')
        const movRef = doc(collection(db, 'movimientos'))
        movimientoId = movRef.id
        batch.set(movRef, {
          tipo:               'egreso',
          estado:             'pendiente',
          descripcion:        `Compra de ${nombres}`,
          categoria:          'Insumos',
          monto:              precioTotal,
          vencimiento:        vencimientoStr,
          periodo:            vencimientoStr.slice(0, 7),
          notas:              result.data.notas || '',
          creadoEl:           serverTimestamp(),
          cuentaPago:         null,
          socioPago:          null,
          referenciaCompraId: compraRef.id,
        })
      }

      // Compra con items embebidos
      batch.set(compraRef, {
        fecha:        Timestamp.fromDate(new Date(result.data.fecha + 'T12:00:00')),
        vencimiento:  vencimientoStr,
        precioTotal:  precioTotal || null,
        movimientoId: movimientoId,
        notas:        result.data.notas || '',
        items:        result.data.items.map((it) => {
          const ins = insumos.find((i) => i.id === it.insumoId)
          return {
            insumoId:    it.insumoId,
            insumoNombre: ins?.nombre ?? '',
            cantidad:    it.cantidad,
            unidad:      ins?.unidad ?? '',
            precioItem:  it.precioItem ?? null,
          }
        }),
        createdAt: serverTimestamp(),
      })

      // Incrementar stock y costoUnitario por ítem
      result.data.items.forEach((it) => {
        const upd = { stockActual: increment(it.cantidad), updatedAt: serverTimestamp() }
        if (it.precioItem) upd.costoUnitario = it.precioItem / it.cantidad
        batch.update(doc(db, 'insumos', it.insumoId), upd)
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
    setFormInsumo({ nombre: insumo.nombre, unidad: insumo.unidad, stockMinimo: insumo.stockMinimo ?? '', stockActual: insumo.stockActual ?? 0 })
    setErrors({})
    setModal('editar')
  }

  const abrirCompra = (insumo = null) => {
    setFormCompra({
      fecha:       hoy(),
      vencimiento: hoy(),
      notas:       '',
      items:       [{ insumoId: insumo?.id ?? '', cantidad: '', precioItem: '' }],
    })
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
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-sm d-flex align-items-center gap-1"
            onClick={resetStock}
            disabled={saving || insumos.length === 0}
            style={{ color: 'var(--danger-color)', background: 'transparent', border: '1px solid var(--danger-color)', borderRadius: '0.5rem' }}
          >
            <BsArrowCounterclockwise size={14} /> Reiniciar stock
          </button>
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
                    {ins.costoUnitario != null && (
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {' · '}
                        <span style={{ color: 'var(--text-primary)' }}>
                          ${ins.costoUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        /{ins.unidad}
                      </span>
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
            {modal === 'editar' && (
              <>
                <hr style={{ borderColor: 'var(--border-color)', margin: '0.5rem 0 1rem' }} />
                <CAMPO
                  label="Stock actual (corrección manual)"
                  error={errors.stockActual}
                >
                  <input type="number" className="form-control" style={inputStyle} min={0} step="0.01"
                    value={formInsumo.stockActual}
                    onChange={(e) => setFormInsumo((f) => ({ ...f, stockActual: e.target.value }))} />
                  <p className="mt-1 mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                    Usá este campo solo para corregir desfasajes. No crea ni elimina compras.
                  </p>
                </CAMPO>
              </>
            )}
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
      {modal === 'compra' && (() => {
        const totalCompra = formCompra.items.reduce((s, it) => s + (parseFloat(it.precioItem) || 0), 0)
        return (
          <Modal title="Registrar compra" onClose={closeModal} maxWidth={500}>
            <form onSubmit={handleCompra}>
              <div className="row g-2 mb-1">
                <div className="col-6">
                  <CAMPO label="Fecha de compra *" error={errors.fecha}>
                    <input type="date" className="form-control" style={inputStyle}
                      value={formCompra.fecha}
                      onChange={(e) => setFormCompra((f) => ({ ...f, fecha: e.target.value }))} />
                  </CAMPO>
                </div>
                <div className="col-6">
                  <CAMPO label="Fecha de pago" error={errors.vencimiento}>
                    <input type="date" className="form-control" style={inputStyle}
                      value={formCompra.vencimiento}
                      onChange={(e) => setFormCompra((f) => ({ ...f, vencimiento: e.target.value }))} />
                  </CAMPO>
                </div>
              </div>
              <p className="small mb-2 fw-semibold" style={{ color: 'var(--text-secondary)' }}>Productos</p>
              {formCompra.items.map((item, idx) => (
                <div key={idx} className="mb-3 p-2 rounded-2" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                  <div className="mb-2">
                    <select
                      className="form-control"
                      style={{ ...inputStyle, appearance: 'auto', background: 'var(--bg-primary)' }}
                      value={item.insumoId}
                      onChange={(e) => updateItem(idx, 'insumoId', e.target.value)}
                    >
                      <option value="">Seleccioná un insumo</option>
                      {insumos.map((i) => (
                        <option key={i.id} value={i.id}>{i.nombre} (stock: {i.stockActual ?? 0} {i.unidad})</option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex gap-2">
                    <input type="number" className="form-control" style={inputStyle} placeholder="Cantidad"
                      value={item.cantidad} onChange={(e) => updateItem(idx, 'cantidad', e.target.value)} />
                    <input type="number" className="form-control" style={inputStyle} placeholder="Precio total"
                      value={item.precioItem} onChange={(e) => updateItem(idx, 'precioItem', e.target.value)} />
                    {formCompra.items.length > 1 && (
                      <button type="button" className="btn btn-sm" onClick={() => removeItem(idx)}
                        style={{ color: 'var(--danger-color)', background: 'transparent', border: 'none' }}>
                        <BsTrash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-theme-secondary mb-3" onClick={addItem}>
                <BsPlus size={14} /> Agregar ítem
              </button>
              <CAMPO label="Notas">
                <textarea className="form-control" style={inputStyle} rows={2} value={formCompra.notas}
                  onChange={(e) => setFormCompra((f) => ({ ...f, notas: e.target.value }))} />
              </CAMPO>
              <p className="small mb-2">Total: <strong>${totalCompra.toLocaleString('es-AR')}</strong></p>
              {errors._global && <p className="small mb-2" style={{ color: 'var(--danger-color)' }}>{errors._global}</p>}
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-theme-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Registrar compra'}
                </button>
                <button type="button" className="btn btn-theme-secondary" onClick={closeModal}>Cancelar</button>
              </div>
            </form>
          </Modal>
        )
      })()}
    </div>
  )
}
