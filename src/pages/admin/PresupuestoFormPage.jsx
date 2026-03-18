import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs, addDoc, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { presupuestoSchema } from '../../lib/schemas'
import { generarPresupuestoPDF, genNumero } from '../../lib/pdf'
import { BsChevronLeft, BsPlus, BsTrash, BsFiletypePdf } from 'react-icons/bs'

const inputStyle = {
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
}

const SECTION = ({ title, children }) => (
  <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
    <p className="small fw-bold mb-3" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>{title}</p>
    {children}
  </div>
)

const CAMPO = ({ label, error, children }) => (
  <div className="mb-2">
    <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
    {children}
    {error && <p className="mt-1 mb-0" style={{ color: 'var(--danger-color)', fontSize: '0.75rem' }}>{error}</p>}
  </div>
)

function hoy() { return new Date().toISOString().split('T')[0] }

const EMPTY_ITEM = { descripcion: '', cantidad: '1', precioUnitario: '' }

export default function PresupuestoFormPage() {
  const navigate   = useNavigate()
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState({
    titulo: '', descripcion: '', clienteId: '',
    clienteNombre: '', clienteContacto: '',
    fechaEmision: hoy(), vigenciaDias: '7',
  })
  const [items, setItems]   = useState([{ ...EMPTY_ITEM }])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getDocs(query(collection(db, 'clientes'), orderBy('razonSocial'))).then((snap) => {
      setClientes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }, [])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const seleccionarCliente = (e) => {
    const id = e.target.value
    const c  = clientes.find((c) => c.id === id)
    setForm((f) => ({
      ...f,
      clienteId:       id,
      clienteNombre:   c?.razonSocial     ?? '',
      clienteContacto: c?.contactoNombre  ?? '',
    }))
  }

  // Items
  const setItem = (i, field, value) =>
    setItems((prev) => prev.map((row, idx) => {
      if (idx !== i) return row
      const updated = { ...row, [field]: value }
      const cant    = parseFloat(updated.cantidad)      || 0
      const precio  = parseFloat(updated.precioUnitario) || 0
      updated.subtotal = cant * precio
      return updated
    }))

  const addItem    = () => setItems((p) => [...p, { ...EMPTY_ITEM }])
  const removeItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i))

  const total = items.reduce((s, i) => s + (Number(i.subtotal) || 0), 0)

  const formatPesos = (v) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v ?? 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = presupuestoSchema.safeParse(form)
    const itemsValidos = items.filter((i) => i.descripcion.trim())
    if (!result.success) {
      const errs = {}
      result.error.issues.forEach((err) => { errs[err.path[0]] = err.message })
      setErrors(errs)
      return
    }
    if (itemsValidos.length === 0) {
      setErrors({ _global: 'Agregá al menos un ítem con descripción.' })
      return
    }

    setErrors({})
    setSaving(true)
    try {
      const numero  = genNumero('PRE')
      const itemsData = itemsValidos.map((i) => ({
        descripcion:    i.descripcion,
        cantidad:       Number(i.cantidad)       || 1,
        precioUnitario: Number(i.precioUnitario) || 0,
        subtotal:       Number(i.subtotal)       || 0,
      }))

      // 1 — Guardar en Firestore
      await addDoc(collection(db, 'presupuestos'), {
        numero,
        titulo:          result.data.titulo,
        descripcion:     result.data.descripcion || '',
        clienteNombre:   result.data.clienteNombre,
        clienteContacto: result.data.clienteContacto || '',
        fechaEmision:    result.data.fechaEmision,
        vigenciaDias:    result.data.vigenciaDias,
        items:           itemsData,
        total,
        createdAt:       serverTimestamp(),
      })

      // 2 — Generar y descargar PDF
      generarPresupuestoPDF({
        numero,
        titulo:          result.data.titulo,
        descripcion:     result.data.descripcion,
        clienteNombre:   result.data.clienteNombre,
        clienteContacto: result.data.clienteContacto,
        fechaEmision:    result.data.fechaEmision,
        vigenciaDias:    result.data.vigenciaDias,
        items:           itemsData,
      })

      navigate('/admin/documentos')
    } catch (err) {
      setErrors({ _global: 'Error: ' + err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <Link to="/admin/documentos" className="d-inline-flex align-items-center gap-1 mb-3 text-decoration-none small" style={{ color: 'var(--text-secondary)' }}>
        <BsChevronLeft size={12} /> Documentos
      </Link>
      <h5 className="mb-4" style={{ color: 'var(--text-primary)' }}>Nuevo presupuesto</h5>

      <form onSubmit={handleSubmit}>
        {/* Info documento */}
        <SECTION title="Documento">
          <CAMPO label="Título *" error={errors.titulo}>
            <input className="form-control" style={inputStyle} value={form.titulo} onChange={set('titulo')}
              placeholder="Ej: Servicio de café con gestión de usuarios" />
          </CAMPO>
          <CAMPO label="Descripción" error={errors.descripcion}>
            <input className="form-control" style={inputStyle} value={form.descripcion} onChange={set('descripcion')}
              placeholder="Descripción breve (aparece en el PDF)" />
          </CAMPO>
          <div className="row g-2">
            <div className="col-6">
              <CAMPO label="Fecha de emisión *" error={errors.fechaEmision}>
                <input type="date" className="form-control" style={inputStyle} value={form.fechaEmision} onChange={set('fechaEmision')} />
              </CAMPO>
            </div>
            <div className="col-6">
              <CAMPO label="Vigencia (días) *" error={errors.vigenciaDias}>
                <input type="number" className="form-control" style={inputStyle} min={1} max={365} value={form.vigenciaDias} onChange={set('vigenciaDias')} />
              </CAMPO>
            </div>
          </div>
        </SECTION>

        {/* Cliente */}
        <SECTION title="Cliente">
          <CAMPO label="Seleccionar cliente existente">
            <select className="form-control" style={{ ...inputStyle, appearance: 'auto' }} value={form.clienteId} onChange={seleccionarCliente}>
              <option value="">— libre o seleccioná —</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.razonSocial}</option>)}
            </select>
          </CAMPO>
          <div className="row g-2">
            <div className="col-12 col-sm-7">
              <CAMPO label="Nombre / Razón social *" error={errors.clienteNombre}>
                <input className="form-control" style={inputStyle} value={form.clienteNombre} onChange={set('clienteNombre')} />
              </CAMPO>
            </div>
            <div className="col-12 col-sm-5">
              <CAMPO label="Contacto" error={errors.clienteContacto}>
                <input className="form-control" style={inputStyle} value={form.clienteContacto} onChange={set('clienteContacto')} />
              </CAMPO>
            </div>
          </div>
        </SECTION>

        {/* Ítems */}
        <SECTION title="Conceptos">
          <div className="d-flex flex-column gap-2 mb-2">
            {items.map((item, i) => (
              <div key={i} className="d-flex flex-column gap-1 p-2 rounded-2" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    className="form-control form-control-sm flex-grow-1"
                    style={inputStyle}
                    placeholder="Descripción"
                    value={item.descripcion}
                    onChange={(e) => setItem(i, 'descripcion', e.target.value)}
                  />
                  {items.length > 1 && (
                    <button type="button" className="btn btn-sm p-1 flex-shrink-0"
                      onClick={() => removeItem(i)}
                      style={{ color: 'var(--danger-color)', background: 'transparent', border: 'none' }}>
                      <BsTrash size={13} />
                    </button>
                  )}
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="number" min={1}
                    className="form-control form-control-sm"
                    style={{ ...inputStyle, width: 80 }}
                    placeholder="Cant."
                    value={item.cantidad}
                    onChange={(e) => setItem(i, 'cantidad', e.target.value)}
                  />
                  <input
                    type="number" min={0} step="0.01"
                    className="form-control form-control-sm flex-grow-1"
                    style={inputStyle}
                    placeholder="Precio unitario"
                    value={item.precioUnitario}
                    onChange={(e) => setItem(i, 'precioUnitario', e.target.value)}
                  />
                  {item.subtotal > 0 && (
                    <span className="small fw-semibold flex-shrink-0" style={{ color: 'var(--success-color)', minWidth: 80, textAlign: 'right' }}>
                      {formatPesos(item.subtotal)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addItem}
            className="btn btn-sm d-flex align-items-center gap-1"
            style={{ color: 'var(--primary-color)', background: 'transparent', border: '1px dashed var(--primary-color)', borderRadius: '0.5rem' }}>
            <BsPlus size={16} /> Agregar ítem
          </button>

          {total > 0 && (
            <div className="mt-3 p-2 rounded-2 text-end"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid var(--success-color)' }}>
              <span className="fw-bold" style={{ color: 'var(--success-color)', fontSize: '1.05rem' }}>
                Total: {formatPesos(total)}
              </span>
            </div>
          )}
        </SECTION>

        {errors._global && <div className="alert alert-danger py-2 small mb-3">{errors._global}</div>}

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-theme-primary d-flex align-items-center gap-2" disabled={saving}>
            <BsFiletypePdf size={16} /> {saving ? 'Generando...' : 'Generar y descargar PDF'}
          </button>
          <Link to="/admin/documentos" className="btn btn-theme-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
