import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { clienteSchema } from '../../lib/schemas'
import { BsChevronLeft } from 'react-icons/bs'

const inputStyle = {
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
}

const SECTION = ({ title, children }) => (
  <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
    <p className="small fw-bold mb-3" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
      {title}
    </p>
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

const EMPTY = {
  razonSocial: '', cuit: '', contactoNombre: '', contactoTelefono: '',
  contactoEmail: '', direccion: '', diaCobro: '', notas: '',
}

export default function ClienteFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const esEdicion = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(esEdicion)

  useEffect(() => {
    if (!esEdicion) return
    getDoc(doc(db, 'clientes', id)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data()
        setForm({
          razonSocial:      d.razonSocial      ?? '',
          cuit:             d.cuit             ?? '',
          contactoNombre:   d.contactoNombre   ?? '',
          contactoTelefono: d.contactoTelefono ?? '',
          contactoEmail:    d.contactoEmail    ?? '',
          direccion:        d.direccion        ?? '',
          diaCobro:         d.diaCobro         ?? '',
          notas:            d.notas            ?? '',
        })
      }
      setLoadingData(false)
    })
  }, [id, esEdicion])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = clienteSchema.safeParse(form)
    if (!result.success) {
      const errs = {}
      result.error.issues.forEach((err) => { errs[err.path[0]] = err.message })
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const data = { ...result.data, updatedAt: serverTimestamp() }
      if (esEdicion) {
        await setDoc(doc(db, 'clientes', id), data, { merge: true })
        navigate(`/admin/clientes/${id}`)
      } else {
        data.createdAt = serverTimestamp()
        const ref = await addDoc(collection(db, 'clientes'), data)
        navigate(`/admin/clientes/${ref.id}`)
      }
    } catch (err) {
      setErrors({ _global: 'Error al guardar: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return (
    <div className="text-center py-5">
      <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
    </div>
  )

  return (
    <div style={{ maxWidth: 560 }}>
      <Link
        to={esEdicion ? `/admin/clientes/${id}` : '/admin/clientes'}
        className="d-inline-flex align-items-center gap-1 mb-3 text-decoration-none small"
        style={{ color: 'var(--text-secondary)' }}
      >
        <BsChevronLeft size={12} /> {esEdicion ? 'Volver al cliente' : 'Clientes'}
      </Link>

      <h5 className="mb-4" style={{ color: 'var(--text-primary)' }}>
        {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
      </h5>

      <form onSubmit={handleSubmit}>
        <SECTION title="Empresa">
          <CAMPO label="Razón social *" error={errors.razonSocial}>
            <input className="form-control" style={inputStyle} value={form.razonSocial} onChange={set('razonSocial')} />
          </CAMPO>
          <div className="row g-2">
            <div className="col-12 col-sm-6">
              <CAMPO label="CUIT *" error={errors.cuit}>
                <input className="form-control" style={inputStyle} value={form.cuit} onChange={set('cuit')} placeholder="20-12345678-9" />
              </CAMPO>
            </div>
            <div className="col-12 col-sm-6">
              <CAMPO label="Dirección" error={errors.direccion}>
                <input className="form-control" style={inputStyle} value={form.direccion} onChange={set('direccion')} />
              </CAMPO>
            </div>
          </div>
        </SECTION>

        <SECTION title="Contacto">
          <div className="row g-2">
            <div className="col-12 col-sm-6">
              <CAMPO label="Nombre *" error={errors.contactoNombre}>
                <input className="form-control" style={inputStyle} value={form.contactoNombre} onChange={set('contactoNombre')} />
              </CAMPO>
            </div>
            <div className="col-12 col-sm-6">
              <CAMPO label="Teléfono *" error={errors.contactoTelefono}>
                <input className="form-control" style={inputStyle} value={form.contactoTelefono} onChange={set('contactoTelefono')} />
              </CAMPO>
            </div>
          </div>
          <CAMPO label="Email" error={errors.contactoEmail}>
            <input className="form-control" style={inputStyle} type="email" value={form.contactoEmail} onChange={set('contactoEmail')} />
          </CAMPO>
        </SECTION>

        <SECTION title="Facturación">
          <CAMPO label="Día de cobro (1–31) *" error={errors.diaCobro}>
            <input className="form-control" style={{ ...inputStyle, maxWidth: 120 }} type="number" min={1} max={31} value={form.diaCobro} onChange={set('diaCobro')} />
          </CAMPO>
          <CAMPO label="Notas internas" error={errors.notas}>
            <textarea className="form-control" style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.notas} onChange={set('notas')} placeholder="Condiciones del contrato, acuerdos, precio por servicio, etc." />
          </CAMPO>
        </SECTION>

        {errors._global && <div className="alert alert-danger py-2 small mb-3">{errors._global}</div>}

        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-theme-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear cliente'}
          </button>
          <Link
            to={esEdicion ? `/admin/clientes/${id}` : '/admin/clientes'}
            className="btn btn-theme-secondary"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
