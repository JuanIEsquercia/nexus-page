import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { doc, getDoc, setDoc, addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { modeloSchema } from '../../lib/schemas'
import { BsChevronLeft, BsChevronUp, BsChevronDown, BsXLg, BsPlus } from 'react-icons/bs'

const inputStyle = {
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
}

export default function ModeloFormPage() {
  const { modeloId } = useParams()
  const navigate = useNavigate()
  const esEdicion = Boolean(modeloId)

  const [nombre, setNombre] = useState('')
  const [bebidasDisponibles, setBebidasDisponibles] = useState([]) // todas las activas
  const [orden, setOrden] = useState([])                           // array ordenado de bebidaIds
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const fetches = [getDocs(query(collection(db, 'bebidas'), orderBy('orden')))]
    if (esEdicion) fetches.push(getDoc(doc(db, 'modelos', modeloId)))

    Promise.all(fetches).then(([bebidasSnap, modeloSnap]) => {
      const bebidas = bebidasSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((b) => b.activa)
      setBebidasDisponibles(bebidas)
      if (modeloSnap?.exists()) {
        const d = modeloSnap.data()
        setNombre(d.nombre ?? '')
        setOrden(d.bebidas ?? [])
      }
      setLoadingData(false)
    })
  }, [modeloId, esEdicion])

  const agregarBebida = (bebidaId) => {
    setOrden((prev) => [...prev, bebidaId])
  }

  const quitarBebida = (bebidaId) => {
    setOrden((prev) => prev.filter((id) => id !== bebidaId))
  }

  const moverArriba = (index) => {
    if (index === 0) return
    setOrden((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  const moverAbajo = (index) => {
    setOrden((prev) => {
      if (index === prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = modeloSchema.safeParse({ nombre })
    if (!result.success) {
      const errs = {}
      result.error.issues.forEach((err) => { errs[err.path[0]] = err.message })
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const data = {
        nombre: result.data.nombre,
        bebidas: orden,
        updatedAt: serverTimestamp(),
      }
      if (esEdicion) {
        await setDoc(doc(db, 'modelos', modeloId), data, { merge: true })
      } else {
        data.createdAt = serverTimestamp()
        await addDoc(collection(db, 'modelos'), data)
      }
      navigate('/admin/modelos')
    } catch (err) {
      setErrors({ _global: 'Error al guardar: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  const ordenSet = new Set(orden)
  const seleccionadas = orden.map((id) => bebidasDisponibles.find((b) => b.id === id)).filter(Boolean)
  const disponibles = bebidasDisponibles.filter((b) => !ordenSet.has(b.id))

  if (loadingData) return (
    <div className="text-center py-5">
      <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
    </div>
  )

  return (
    <div style={{ maxWidth: 480 }}>
      <Link
        to="/admin/modelos"
        className="d-inline-flex align-items-center gap-1 mb-1 text-decoration-none small"
        style={{ color: 'var(--text-secondary)' }}
      >
        <BsChevronLeft size={12} /> Modelos
      </Link>
      <h5 className="mb-4 mt-1" style={{ color: 'var(--text-primary)' }}>
        {esEdicion ? 'Editar modelo' : 'Nuevo modelo'}
      </h5>

      <form onSubmit={handleSubmit}>
        {/* Nombre */}
        <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <p className="small fw-bold mb-3" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
            Identificación
          </p>
          <div className="mb-2">
            <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>Nombre del modelo *</label>
            <input
              className="form-control"
              style={inputStyle}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Necta Colibri"
            />
            {errors.nombre && <p className="mt-1 mb-0 small" style={{ color: 'var(--danger-color)' }}>{errors.nombre}</p>}
          </div>
        </div>

        {/* Bebidas ordenadas */}
        <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <p className="small fw-bold mb-1" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
            Bebidas del modelo
          </p>
          <p className="small mb-3" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            El orden debe coincidir con el tablero de la máquina.
          </p>

          {bebidasDisponibles.length === 0 ? (
            <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>No hay bebidas configuradas.</p>
          ) : (
            <>
              {/* Lista ordenada */}
              {seleccionadas.length > 0 && (
                <div className="d-flex flex-column gap-1 mb-3">
                  {seleccionadas.map((b, i) => (
                    <div
                      key={b.id}
                      className="d-flex align-items-center gap-2 px-2 py-1 rounded-2"
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                    >
                      <span
                        className="fw-bold"
                        style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', minWidth: 18, textAlign: 'center' }}
                      >
                        {i + 1}
                      </span>
                      <span className="small flex-grow-1" style={{ color: 'var(--text-primary)' }}>{b.nombre}</span>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          onClick={() => moverArriba(i)}
                          disabled={i === 0}
                          style={{ background: 'transparent', border: 'none', padding: '0.1rem 0.25rem', color: i === 0 ? 'var(--border-color)' : 'var(--text-secondary)', cursor: i === 0 ? 'default' : 'pointer' }}
                        >
                          <BsChevronUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moverAbajo(i)}
                          disabled={i === seleccionadas.length - 1}
                          style={{ background: 'transparent', border: 'none', padding: '0.1rem 0.25rem', color: i === seleccionadas.length - 1 ? 'var(--border-color)' : 'var(--text-secondary)', cursor: i === seleccionadas.length - 1 ? 'default' : 'pointer' }}
                        >
                          <BsChevronDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => quitarBebida(b.id)}
                          style={{ background: 'transparent', border: 'none', padding: '0.1rem 0.25rem', color: 'var(--danger-color)', cursor: 'pointer' }}
                        >
                          <BsXLg size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Disponibles para agregar */}
              {disponibles.length > 0 && (
                <>
                  <p className="small mb-2" style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                    {seleccionadas.length > 0 ? 'Agregar más:' : 'Seleccioná las bebidas:'}
                  </p>
                  <div className="d-flex flex-column gap-1">
                    {disponibles.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => agregarBebida(b.id)}
                        className="d-flex align-items-center gap-2 text-start px-2 py-1 rounded-2"
                        style={{ background: 'transparent', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        <BsPlus size={14} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                        {b.nombre}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {errors._global && <div className="alert alert-danger py-2 small mb-3">{errors._global}</div>}

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-theme-primary" disabled={loading}>
            {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear modelo'}
          </button>
          <Link to="/admin/modelos" className="btn btn-theme-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
