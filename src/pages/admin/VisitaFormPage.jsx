import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  doc, getDoc, collection, getDocs, orderBy, query,
  writeBatch, serverTimestamp, Timestamp, limit, increment,
} from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { useAuth } from '../../context/AuthContext'
import { visitaSchema } from '../../lib/schemas'
import { calcularServiciosPeriodo } from '../../lib/negocio'
import { BsChevronLeft, BsPlus, BsTrash } from 'react-icons/bs'

const inputStyle = {
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
}

const SECTION = ({ title, subtitle, children }) => (
  <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
    <p className="small fw-bold mb-0" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
      {title}
    </p>
    {subtitle && <p className="small mb-2 mt-1" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{subtitle}</p>}
    {!subtitle && <div className="mb-3" />}
    {children}
  </div>
)

function hoy() {
  return new Date().toISOString().split('T')[0]
}

export default function VisitaFormPage() {
  const { maquinaId } = useParams()
  const clienteId = new URLSearchParams(window.location.search).get('cliente')
  const navigate = useNavigate()
  const { user } = useAuth()

  const [maquina, setMaquina]           = useState(null)
  const [cliente, setCliente]           = useState(null)
  const [bebidas, setBebidas]           = useState([])
  const [catalogoInsumos, setCatalogoInsumos] = useState([])
  const [ultimaVisita, setUltimaVisita] = useState(null)
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)

  // Form state
  const [fecha, setFecha]               = useState(hoy())
  const [contadorTotal, setContadorTotal] = useState('')
  const [expendios, setExpendios]       = useState({}) // { bebidaId: contador_string }
  const [insumos, setInsumos]           = useState([{ insumoId: '', cantidad: '' }])
  const [observaciones, setObservaciones] = useState('')
  const [errors, setErrors]             = useState({})
  const [resumen, setResumen]           = useState(null) // mostrar tras guardar

  useEffect(() => {
    if (!clienteId) { setLoading(false); return }
    Promise.all([
      getDoc(doc(db, 'clientes', clienteId, 'maquinas', maquinaId)),
      getDoc(doc(db, 'clientes', clienteId)),
      getDocs(query(collection(db, 'bebidas'), orderBy('orden'))),
      getDocs(query(collection(db, 'insumos'), orderBy('nombre'))),
      getDocs(query(
        collection(db, 'clientes', clienteId, 'maquinas', maquinaId, 'visitas'),
        orderBy('fecha', 'desc'), limit(1)
      )),
    ]).then(async ([maqSnap, cliSnap, bebidasSnap, insumosSnap, visitasSnap]) => {
      const maqData = maqSnap.exists() ? { id: maqSnap.id, ...maqSnap.data() } : null
      if (maqData) setMaquina(maqData)
      if (cliSnap.exists()) setCliente({ id: cliSnap.id, ...cliSnap.data() })

      const todasBebidas = bebidasSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((b) => b.activa)
      let bebidasData = todasBebidas

      if (maqData?.modeloId) {
        const modeloSnap = await getDoc(doc(db, 'modelos', maqData.modeloId))
        if (modeloSnap.exists()) {
          const ids = modeloSnap.data().bebidas ?? []
          const filtradas = ids.map((id) => todasBebidas.find((b) => b.id === id)).filter(Boolean)
          if (filtradas.length > 0) bebidasData = filtradas
        }
      }

      setBebidas(bebidasData)
      const init = {}
      bebidasData.forEach((b) => { init[b.id] = '' })
      setExpendios(init)
      setCatalogoInsumos(insumosSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      if (!visitasSnap.empty) setUltimaVisita({ id: visitasSnap.docs[0].id, ...visitasSnap.docs[0].data() })
      setLoading(false)
    })
  }, [maquinaId, clienteId])

  // ── Suma en vivo de expendios de la visita ───────────
  const totalExpendios = useMemo(() => {
    let total = 0
    let hayAlguno = false
    bebidas.forEach((b) => {
      const val = parseInt(expendios[b.id], 10)
      if (isNaN(val)) return
      hayAlguno = true
      total += val
    })
    return hayAlguno ? total : null
  }, [expendios, bebidas])

  // ── Auto-completar contadorTotal desde la suma de expendios ──
  useEffect(() => {
    if (totalExpendios == null) return
    setContadorTotal(String(totalExpendios))
  }, [totalExpendios])

  // ── Insumos helpers ──────────────────────────────────
  const addInsumo = () => setInsumos((prev) => [...prev, { insumoId: '', cantidad: '' }])
  const removeInsumo = (i) => setInsumos((prev) => prev.filter((_, idx) => idx !== i))
  const setInsumo = (i, field, value) =>
    setInsumos((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row))

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = visitaSchema.safeParse({ fecha, contadorTotal, observaciones })
    if (!result.success) {
      const errs = {}
      result.error.issues.forEach((err) => { errs[err.path[0]] = err.message })
      setErrors(errs)
      return
    }

    // Validar que contador no sea menor al anterior
    const contadorNum = result.data.contadorTotal
    if (ultimaVisita && contadorNum < (ultimaVisita.contadorTotal ?? 0)) {
      setErrors({ contadorTotal: `Debe ser ≥ al contador anterior (${ultimaVisita.contadorTotal})` })
      return
    }

    setErrors({})
    setSaving(true)
    try {
      const fechaDate = new Date(fecha + 'T12:00:00')
      const serviciosPeriodo = calcularServiciosPeriodo(contadorNum, ultimaVisita?.contadorTotal ?? null)

      const batch = writeBatch(db)

      // 1 — Crear doc de visita
      const visitaRef = doc(collection(db, 'clientes', clienteId, 'maquinas', maquinaId, 'visitas'))
      batch.set(visitaRef, {
        fecha:            Timestamp.fromDate(fechaDate),
        contadorTotal:    contadorNum,
        serviciosPeriodo: serviciosPeriodo,
        tecnico:          user?.email ?? '',
        observaciones:    observaciones || '',
        createdAt:        serverTimestamp(),
      })

      // 2 — Crear subdocs de expendios
      const expendiosResumen = []
      bebidas.forEach((bebida) => {
        const valorStr = expendios[bebida.id]
        if (valorStr === '' || valorStr == null) return
        const cantidad = parseInt(valorStr, 10)
        if (isNaN(cantidad) || cantidad <= 0) return
        const expRef = doc(collection(db, 'clientes', clienteId, 'maquinas', maquinaId, 'visitas', visitaRef.id, 'expendios'))
        batch.set(expRef, {
          bebidaId:       bebida.id,
          bebidaNombre:   bebida.nombre,
          cantidad,
          cantidadPeriodo: cantidad,
        })
        expendiosResumen.push({ nombre: bebida.nombre, cantidad })
      })

      // 3 — Crear subdocs de insumos cargados + descontar stock global
      const insumosValidos = insumos.filter((r) => r.insumoId && Number(r.cantidad) > 0)
      insumosValidos.forEach((insumo) => {
        const catalogoItem = catalogoInsumos.find((c) => c.id === insumo.insumoId)
        const insumoRef = doc(collection(db, 'clientes', clienteId, 'maquinas', maquinaId, 'visitas', visitaRef.id, 'insumos'))
        batch.set(insumoRef, {
          insumoId: insumo.insumoId,
          nombre:   catalogoItem?.nombre ?? '',
          unidad:   catalogoItem?.unidad ?? '',
          cantidad: Number(insumo.cantidad),
        })
        // Descontar del stock global
        batch.update(doc(db, 'insumos', insumo.insumoId), {
          stockActual: increment(-Number(insumo.cantidad)),
        })
      })

      // 4 — Actualizar contadores de la máquina
      batch.update(doc(db, 'clientes', clienteId, 'maquinas', maquinaId), {
        contadorActual: contadorNum,
        ultimaVisita:   Timestamp.fromDate(fechaDate),
      })

      await batch.commit()

      setResumen({ serviciosPeriodo, expendiosResumen, insumosValidos })
    } catch (err) {
      setErrors({ _global: 'Error al guardar: ' + err.message })
    } finally {
      setSaving(false)
    }
  }

  // ── Loading ───────────────────────────────────────────
  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
    </div>
  )

  // ── Pantalla de confirmación ──────────────────────────
  if (resumen) return (
    <div style={{ maxWidth: 480 }}>
      <div className="p-4 rounded-3 text-center mb-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--success-color)' }}>
        <p className="fw-bold mb-2" style={{ color: 'var(--success-color)', fontSize: '1.1rem' }}>✓ Visita registrada</p>
        <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
          Contador: <strong style={{ color: 'var(--text-primary)' }}>{contadorTotal}</strong>
        </p>
        {resumen.serviciosPeriodo != null ? (
          <p className="small mb-0 mt-1" style={{ color: 'var(--text-secondary)' }}>
            Servicios del período: <strong style={{ color: 'var(--primary-color)' }}>{resumen.serviciosPeriodo}</strong>
          </p>
        ) : (
          <p className="small mb-0 mt-1" style={{ color: 'var(--text-secondary)' }}>Primera visita registrada</p>
        )}
        {resumen.expendiosResumen.length > 0 && (
          <div className="mt-3 text-start">
            <p className="small fw-bold mb-1" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Bebidas del período
            </p>
            {resumen.expendiosResumen.map((exp) => (
              <p key={exp.nombre} className="small mb-0" style={{ color: 'var(--text-primary)' }}>
                {exp.nombre}: <strong>{exp.cantidad}</strong>
              </p>
            ))}
          </div>
        )}
        {resumen.insumosValidos.length > 0 && (
          <div className="mt-3 text-start">
            <p className="small fw-bold mb-1" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Insumos cargados
            </p>
            {resumen.insumosValidos.map((ins, i) => (
              <p key={i} className="small mb-0" style={{ color: 'var(--text-primary)' }}>
                {ins.nombre}: <strong>{ins.cantidad}</strong>
              </p>
            ))}
          </div>
        )}
      </div>
      <div className="d-flex gap-2">
        <button
          className="btn btn-theme-primary"
          onClick={() => { setResumen(null); setContadorTotal(''); setObservaciones(''); setInsumos([{ insumoId: '', cantidad: '' }]); setExpendios(Object.fromEntries(bebidas.map((b) => [b.id, '']))) }}
        >
          Nueva visita
        </button>
        <Link to={`/admin/maquinas/${maquinaId}?cliente=${clienteId}`} className="btn btn-theme-secondary">
          Ver máquina
        </Link>
      </div>
    </div>
  )

  // ── Formulario ────────────────────────────────────────
  return (
    <div style={{ maxWidth: 580 }}>
      <Link
        to={`/admin/maquinas/${maquinaId}?cliente=${clienteId}`}
        className="d-inline-flex align-items-center gap-1 mb-1 text-decoration-none small"
        style={{ color: 'var(--text-secondary)' }}
      >
        <BsChevronLeft size={12} /> {maquina?.nombre ?? 'Máquina'}
      </Link>

      <div className="d-flex align-items-start justify-content-between flex-wrap gap-1 mb-3 mt-1">
        <div>
          <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>Registrar visita</h5>
          <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>{cliente?.razonSocial}</p>
        </div>
        {ultimaVisita && (
          <div className="text-end">
            <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>Contador anterior</p>
            <p className="mb-0 fw-semibold" style={{ color: 'var(--text-secondary)' }}>
              {ultimaVisita.contadorTotal?.toLocaleString('es-AR')}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* General */}
        <SECTION title="General">
          <div className="row g-2">
            <div className="col-12 col-sm-6">
              <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>Fecha *</label>
              <input
                type="date"
                className="form-control"
                style={inputStyle}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
              {errors.fecha && <p className="mt-1 mb-0 small" style={{ color: 'var(--danger-color)' }}>{errors.fecha}</p>}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>
                Contador total actual
              </label>
              <input
                type="number"
                className="form-control"
                style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                min={0}
                value={contadorTotal}
                readOnly
                placeholder="Se calcula automáticamente"
              />
              {errors.contadorTotal && <p className="mt-1 mb-0 small" style={{ color: 'var(--danger-color)' }}>{errors.contadorTotal}</p>}
            </div>
          </div>
          <div className="mt-2">
            <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>Observaciones</label>
            <textarea
              className="form-control"
              style={{ ...inputStyle, resize: 'vertical' }}
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </SECTION>

        {/* Expendios por bebida */}
        <SECTION
          title="Contadores por bebida"
          subtitle="Ingresá el número acumulado que muestra la máquina para cada bebida."
        >
          {bebidas.length === 0 ? (
            <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
              No hay bebidas configuradas. Inicializá la base de datos desde el Dashboard.
            </p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {bebidas.map((bebida) => (
                <div key={bebida.id} className="d-flex align-items-center gap-2">
                  <label
                    className="small mb-0 flex-grow-1"
                    style={{ color: 'var(--text-primary)', minWidth: 0 }}
                  >
                    {bebida.nombre}
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ ...inputStyle, width: 110, textAlign: 'right' }}
                    min={0}
                    value={expendios[bebida.id] ?? ''}
                    onChange={(e) => setExpendios((prev) => ({ ...prev, [bebida.id]: e.target.value }))}
                    placeholder="—"
                  />
                </div>
              ))}
              {totalExpendios != null && (
                <div
                  className="d-flex align-items-center justify-content-between pt-2 mt-1"
                  style={{ borderTop: '1px solid var(--border-color)' }}
                >
                  <span className="small fw-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Total servicios
                  </span>
                  <span className="fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1rem' }}>
                    {totalExpendios}
                  </span>
                </div>
              )}
            </div>
          )}
        </SECTION>

        {/* Insumos cargados */}
        <SECTION
          title="Insumos cargados"
          subtitle="Registrá qué insumos cargaste y en qué cantidad."
        >
          {catalogoInsumos.length === 0 ? (
            <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
              No hay insumos en el catálogo.{' '}
              <a href="/admin/stock" style={{ color: 'var(--primary-color)' }}>Agregá insumos en Stock</a> primero.
            </p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {insumos.map((row, i) => {
                const seleccionado = catalogoInsumos.find((c) => c.id === row.insumoId)
                return (
                  <div key={i} className="d-flex align-items-center gap-2">
                    <select
                      className="form-control form-control-sm flex-grow-1"
                      style={{ ...inputStyle, appearance: 'auto' }}
                      value={row.insumoId}
                      onChange={(e) => setInsumo(i, 'insumoId', e.target.value)}
                    >
                      <option value="">Seleccioná insumo</option>
                      {catalogoInsumos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} ({c.stockActual ?? 0} {c.unidad})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ ...inputStyle, width: 90 }}
                      placeholder={seleccionado?.unidad ?? 'Cant.'}
                      min={0}
                      step="0.01"
                      value={row.cantidad}
                      onChange={(e) => setInsumo(i, 'cantidad', e.target.value)}
                    />
                    {insumos.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => removeInsumo(i)}
                        style={{ color: 'var(--danger-color)', background: 'transparent', border: 'none', padding: '0.25rem' }}
                      >
                        <BsTrash size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          <button
            type="button"
            className="btn btn-sm mt-2 d-flex align-items-center gap-1"
            onClick={addInsumo}
            style={{ color: 'var(--primary-color)', background: 'transparent', border: '1px dashed var(--primary-color)', borderRadius: '0.5rem' }}
          >
            <BsPlus size={16} /> Agregar insumo
          </button>
        </SECTION>

        {errors._global && <div className="alert alert-danger py-2 small mb-3">{errors._global}</div>}

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-theme-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar visita'}
          </button>
          <Link to={`/admin/maquinas/${maquinaId}?cliente=${clienteId}`} className="btn btn-theme-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
