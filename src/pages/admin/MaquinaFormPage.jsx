import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { maquinaSchema } from '../../lib/schemas'
import { BsChevronLeft } from 'react-icons/bs'

const inputStyle = {
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
}

const CAMPO = ({ label, hint, error, children }) => (
  <div className="mb-2">
    <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
    {children}
    {hint && !error && <p className="mt-1 mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{hint}</p>}
    {error && <p className="mt-1 mb-0" style={{ color: 'var(--danger-color)', fontSize: '0.75rem' }}>{error}</p>}
  </div>
)

const EMPTY = { nombre: '', modelo: '', serie: '', notas: '' }

export default function MaquinaFormPage() {
  // Ruta nueva:  /admin/clientes/:clienteId/maquinas/nueva
  // Ruta editar: /admin/maquinas/:maquinaId/editar  (clienteId viene del doc)
  const { clienteId, maquinaId } = useParams()
  const navigate = useNavigate()
  const esEdicion = Boolean(maquinaId)

  const [form, setForm] = useState(EMPTY)
  const [clienteNombre, setClienteNombre] = useState('')
  const [resolvedClienteId, setResolvedClienteId] = useState(clienteId ?? null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (esEdicion) {
      // Buscar la máquina en todas las subcolecciones no es directo en Firestore.
      // Guardamos clienteId dentro del doc de la máquina para facilitar esto.
      // Acá lo leemos del collectionGroup o del doc directamente buscando por el campo.
      // Usamos un enfoque simple: el maquinaId lleva el clienteId codificado NO,
      // en cambio guardamos clienteId en el documento de la máquina al crear.
      // Por eso podemos hacer una búsqueda directa si tenemos el clienteId.
      // Como en edición llegamos desde el detalle de la máquina, pasamos clienteId como query param.
      const params = new URLSearchParams(window.location.search)
      const cId = params.get('cliente') ?? clienteId
      if (cId) {
        setResolvedClienteId(cId)
        Promise.all([
          getDoc(doc(db, 'clientes', cId, 'maquinas', maquinaId)),
          getDoc(doc(db, 'clientes', cId)),
        ]).then(([maqSnap, cliSnap]) => {
          if (maqSnap.exists()) {
            const d = maqSnap.data()
            setForm({
              nombre: d.nombre ?? '',
              modelo: d.modelo ?? '',
              serie:  d.serie  ?? '',
              notas:  d.notas  ?? '',
            })
          }
          if (cliSnap.exists()) setClienteNombre(cliSnap.data().razonSocial ?? '')
          setLoadingData(false)
        })
      } else {
        setLoadingData(false)
      }
    } else {
      // Nueva máquina — cargar nombre del cliente
      getDoc(doc(db, 'clientes', clienteId)).then((snap) => {
        if (snap.exists()) setClienteNombre(snap.data().razonSocial ?? '')
        setLoadingData(false)
      })
    }
  }, [clienteId, maquinaId, esEdicion])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = maquinaSchema.safeParse(form)
    if (!result.success) {
      const errs = {}
      result.error.issues.forEach((err) => { errs[err.path[0]] = err.message })
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const cId = resolvedClienteId
      const data = { ...result.data, clienteId: cId, updatedAt: serverTimestamp() }
      if (esEdicion) {
        await setDoc(doc(db, 'clientes', cId, 'maquinas', maquinaId), data, { merge: true })
        navigate(`/admin/maquinas/${maquinaId}?cliente=${cId}`)
      } else {
        data.createdAt = serverTimestamp()
        const ref = await addDoc(collection(db, 'clientes', cId, 'maquinas'), data)
        navigate(`/admin/maquinas/${ref.id}?cliente=${cId}`)
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
    <div style={{ maxWidth: 480 }}>
      <Link
        to={resolvedClienteId ? `/admin/clientes/${resolvedClienteId}` : '/admin/clientes'}
        className="d-inline-flex align-items-center gap-1 mb-1 text-decoration-none small"
        style={{ color: 'var(--text-secondary)' }}
      >
        <BsChevronLeft size={12} /> {clienteNombre || 'Cliente'}
      </Link>
      <h5 className="mb-4 mt-1" style={{ color: 'var(--text-primary)' }}>
        {esEdicion ? 'Editar máquina' : 'Nueva máquina'}
      </h5>

      <form onSubmit={handleSubmit}>
        <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <p className="small fw-bold mb-3" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
            Identificación
          </p>

          <CAMPO label="Nombre / Ubicación *" hint='Ej: "Piso 3 — Recepción" o "Planta baja"' error={errors.nombre}>
            <input className="form-control" style={inputStyle} value={form.nombre} onChange={set('nombre')} />
          </CAMPO>

          <div className="row g-2">
            <div className="col-12 col-sm-6">
              <CAMPO label="Modelo" error={errors.modelo}>
                <input className="form-control" style={inputStyle} value={form.modelo} onChange={set('modelo')} placeholder="Ej: Necta Colibri" />
              </CAMPO>
            </div>
            <div className="col-12 col-sm-6">
              <CAMPO label="Nº de serie" error={errors.serie}>
                <input className="form-control" style={inputStyle} value={form.serie} onChange={set('serie')} />
              </CAMPO>
            </div>
          </div>

          <CAMPO label="Notas" error={errors.notas}>
            <textarea className="form-control" style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={form.notas} onChange={set('notas')} placeholder="Observaciones sobre la máquina" />
          </CAMPO>
        </div>

        {errors._global && <div className="alert alert-danger py-2 small mb-3">{errors._global}</div>}

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-theme-primary" disabled={loading}>
            {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear máquina'}
          </button>
          <Link
            to={resolvedClienteId ? `/admin/clientes/${resolvedClienteId}` : '/admin/clientes'}
            className="btn btn-theme-secondary"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
