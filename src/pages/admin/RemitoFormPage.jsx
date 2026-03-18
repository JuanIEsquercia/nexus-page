import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs, addDoc, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { remitoSchema } from '../../lib/schemas'
import { generarRemitoPDF, genNumero } from '../../lib/pdf'
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

export default function RemitoFormPage() {
  const navigate   = useNavigate()
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState({
    clienteId: '', clienteNombre: '', clienteCuit: '',
    fechaEmision: hoy(), fechaEntrega: hoy(), observaciones: '',
  })
  const [items, setItems]   = useState([{ descripcion: '', cantidad: '' }])
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
      clienteId:     id,
      clienteNombre: c?.razonSocial ?? '',
      clienteCuit:   c?.cuit        ?? '',
    }))
  }

  const setItemField = (i, field, value) =>
    setItems((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row))

  const addItem    = () => setItems((p) => [...p, { descripcion: '', cantidad: '' }])
  const removeItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result      = remitoSchema.safeParse(form)
    const itemsValidos = items.filter((i) => i.descripcion.trim() && i.cantidad)

    if (!result.success) {
      const errs = {}
      result.error.issues.forEach((err) => { errs[err.path[0]] = err.message })
      setErrors(errs)
      return
    }
    if (itemsValidos.length === 0) {
      setErrors({ _global: 'Agregá al menos un producto con descripción y cantidad.' })
      return
    }

    setErrors({})
    setSaving(true)
    try {
      const numero    = genNumero('REM')
      const itemsData = itemsValidos.map((i) => ({
        descripcion: i.descripcion,
        cantidad:    Number(i.cantidad) || 0,
      }))

      // 1 — Guardar en Firestore
      await addDoc(collection(db, 'remitos'), {
        numero,
        clienteNombre: result.data.clienteNombre,
        clienteCuit:   result.data.clienteCuit  || '',
        fechaEmision:  result.data.fechaEmision,
        fechaEntrega:  result.data.fechaEntrega,
        observaciones: result.data.observaciones || '',
        items:         itemsData,
        createdAt:     serverTimestamp(),
      })

      // 2 — Generar y descargar PDF
      generarRemitoPDF({
        numero,
        clienteNombre: result.data.clienteNombre,
        clienteCuit:   result.data.clienteCuit,
        fechaEmision:  result.data.fechaEmision,
        fechaEntrega:  result.data.fechaEntrega,
        items:         itemsData,
        observaciones: result.data.observaciones,
      })

      navigate('/admin/documentos')
    } catch (err) {
      setErrors({ _global: 'Error: ' + err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <Link to="/admin/documentos" className="d-inline-flex align-items-center gap-1 mb-3 text-decoration-none small" style={{ color: 'var(--text-secondary)' }}>
        <BsChevronLeft size={12} /> Documentos
      </Link>
      <h5 className="mb-4" style={{ color: 'var(--text-primary)' }}>Nuevo remito</h5>

      <form onSubmit={handleSubmit}>
        {/* Cliente */}
        <SECTION title="Destinatario">
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
              <CAMPO label="CUIT" error={errors.clienteCuit}>
                <input className="form-control" style={inputStyle} value={form.clienteCuit} onChange={set('clienteCuit')} placeholder="20-12345678-9" />
              </CAMPO>
            </div>
          </div>
        </SECTION>

        {/* Fechas */}
        <SECTION title="Fechas">
          <div className="row g-2">
            <div className="col-6">
              <CAMPO label="Fecha de emisión *" error={errors.fechaEmision}>
                <input type="date" className="form-control" style={inputStyle} value={form.fechaEmision} onChange={set('fechaEmision')} />
              </CAMPO>
            </div>
            <div className="col-6">
              <CAMPO label="Fecha de entrega *" error={errors.fechaEntrega}>
                <input type="date" className="form-control" style={inputStyle} value={form.fechaEntrega} onChange={set('fechaEntrega')} />
              </CAMPO>
            </div>
          </div>
        </SECTION>

        {/* Productos */}
        <SECTION title="Productos entregados">
          <div className="d-flex flex-column gap-2 mb-2">
            {items.map((item, i) => (
              <div key={i} className="d-flex align-items-center gap-2">
                <input
                  className="form-control form-control-sm flex-grow-1"
                  style={inputStyle}
                  placeholder="Descripción del producto"
                  value={item.descripcion}
                  onChange={(e) => setItemField(i, 'descripcion', e.target.value)}
                />
                <input
                  type="number" min={0}
                  className="form-control form-control-sm"
                  style={{ ...inputStyle, width: 90 }}
                  placeholder="Cant."
                  value={item.cantidad}
                  onChange={(e) => setItemField(i, 'cantidad', e.target.value)}
                />
                {items.length > 1 && (
                  <button type="button" className="btn btn-sm p-1"
                    onClick={() => removeItem(i)}
                    style={{ color: 'var(--danger-color)', background: 'transparent', border: 'none', flexShrink: 0 }}>
                    <BsTrash size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem}
            className="btn btn-sm d-flex align-items-center gap-1"
            style={{ color: 'var(--primary-color)', background: 'transparent', border: '1px dashed var(--primary-color)', borderRadius: '0.5rem' }}>
            <BsPlus size={16} /> Agregar producto
          </button>
        </SECTION>

        {/* Observaciones */}
        <SECTION title="Observaciones">
          <textarea
            className="form-control"
            style={{ ...inputStyle, resize: 'vertical' }}
            rows={3}
            placeholder="Opcional — aparece en el PDF resaltado"
            value={form.observaciones}
            onChange={set('observaciones')}
          />
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
