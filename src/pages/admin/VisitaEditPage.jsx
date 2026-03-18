import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  doc, getDoc, collection, getDocs, orderBy, query,
  writeBatch, serverTimestamp, Timestamp, increment, limit,
} from 'firebase/firestore'
import { db } from '../../firebase/firebase'
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

export default function VisitaEditPage() {
  const { visitaId } = useParams()
  const clienteId  = new URLSearchParams(window.location.search).get('cliente')
  const maquinaId  = new URLSearchParams(window.location.search).get('maquina')
  const navigate   = useNavigate()

  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [errors, setErrors]     = useState({})

  // Datos del contexto
  const [maquina, setMaquina]           = useState(null)
  const [bebidas, setBebidas]           = useState([])
  const [catalogoInsumos, setCatalogoInsumos] = useState([])
  const [visitaAnterior, setVisitaAnterior]   = useState(null)

  // Datos originales (para restaurar stock al guardar)
  const [insumosOriginales, setInsumosOriginales] = useState([])
  const [expendiosOriginales, setExpendiosOriginales] = useState([])

  // Form
  const [fecha, setFecha]             = useState('')
  const [contadorTotal, setContadorTotal] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [expendios, setExpendios]     = useState({}) // { bebidaId: contadorAcumulado_string }
  const [insumos, setInsumos]         = useState([{ insumoId: '', cantidad: '' }])

  useEffect(() => {
    if (!clienteId || !maquinaId) { setLoading(false); return }

    const visitaPath = ['clientes', clienteId, 'maquinas', maquinaId, 'visitas', visitaId]

    Promise.all([
      getDoc(doc(db, ...visitaPath)),
      getDocs(collection(db, ...visitaPath, 'insumos')),
      getDocs(collection(db, ...visitaPath, 'expendios')),
      getDoc(doc(db, 'clientes', clienteId, 'maquinas', maquinaId)),
      getDocs(query(collection(db, 'bebidas'), orderBy('orden'))),
      getDocs(query(collection(db, 'insumos'), orderBy('nombre'))),
      // Cargar todas las visitas para encontrar la anterior
      getDocs(query(
        collection(db, 'clientes', clienteId, 'maquinas', maquinaId, 'visitas'),
        orderBy('fecha', 'desc'), limit(20)
      )),
    ]).then(([visitaSnap, insumosSnap, expendiosSnap, maqSnap, bebidasSnap, insumosCtlgSnap, visitasSnap]) => {
      if (!visitaSnap.exists()) { setLoading(false); return }

      const visita = { id: visitaSnap.id, ...visitaSnap.data() }

      // Fecha
      const fechaStr = visita.fecha?.toDate
        ? visita.fecha.toDate().toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
      setFecha(fechaStr)
      setContadorTotal(String(visita.contadorTotal ?? ''))
      setObservaciones(visita.observaciones ?? '')

      // Insumos originales
      const insOrig = insumosSnap.docs.map((d) => ({ docId: d.id, ...d.data() }))
      setInsumosOriginales(insOrig)
      setInsumos(
        insOrig.length > 0
          ? insOrig.map((r) => ({ insumoId: r.insumoId, cantidad: String(r.cantidad) }))
          : [{ insumoId: '', cantidad: '' }]
      )

      // Expendios originales
      const expOrig = expendiosSnap.docs.map((d) => ({ docId: d.id, ...d.data() }))
      setExpendiosOriginales(expOrig)
      const expMap = {}
      expOrig.forEach((e) => { expMap[e.bebidaId] = String(e.contadorAcumulado ?? '') })
      setExpendios(expMap)

      // Máquina
      if (maqSnap.exists()) setMaquina({ id: maqSnap.id, ...maqSnap.data() })

      // Bebidas
      const bebidasData = bebidasSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((b) => b.activa)
      setBebidas(bebidasData)
      // Completar expendios con bebidas que no tenían valor
      bebidasData.forEach((b) => {
        if (expMap[b.id] == null) expMap[b.id] = ''
      })
      setExpendios({ ...expMap })

      setCatalogoInsumos(insumosCtlgSnap.docs.map((d) => ({ id: d.id, ...d.data() })))

      // Visita anterior (la inmediatamente anterior a ésta en orden de fecha)
      const todasVisitas = visitasSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const idx = todasVisitas.findIndex((v) => v.id === visitaId)
      setVisitaAnterior(todasVisitas[idx + 1] ?? null) // la siguiente en orden desc = la anterior cronológicamente

      setLoading(false)
    })
  }, [visitaId, clienteId, maquinaId])

  // ── Insumos helpers ──────────────────────────────────
  const addInsumo    = () => setInsumos((p) => [...p, { insumoId: '', cantidad: '' }])
  const removeInsumo = (i) => setInsumos((p) => p.filter((_, idx) => idx !== i))
  const setInsumo    = (i, field, value) =>
    setInsumos((p) => p.map((row, idx) => idx === i ? { ...row, [field]: value } : row))

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

    setErrors({})
    setSaving(true)
    try {
      const contadorNum  = result.data.contadorTotal
      const fechaDate    = new Date(fecha + 'T12:00:00')
      const serviciosPeriodo = calcularServiciosPeriodo(contadorNum, visitaAnterior?.contadorTotal ?? null)

      const visitaPath = ['clientes', clienteId, 'maquinas', maquinaId, 'visitas', visitaId]
      const batch = writeBatch(db)

      // 1 — Restaurar stock de insumos originales
      insumosOriginales.forEach((ins) => {
        if (ins.insumoId && ins.cantidad > 0) {
          batch.update(doc(db, 'insumos', ins.insumoId), { stockActual: increment(ins.cantidad) })
        }
        batch.delete(doc(db, ...visitaPath, 'insumos', ins.docId))
      })

      // 2 — Guardar nuevos insumos y descontar stock
      const insumosValidos = insumos.filter((r) => r.insumoId && Number(r.cantidad) > 0)
      insumosValidos.forEach((ins) => {
        const ctlg = catalogoInsumos.find((c) => c.id === ins.insumoId)
        const newRef = doc(collection(db, ...visitaPath, 'insumos'))
        batch.set(newRef, {
          insumoId: ins.insumoId,
          nombre:   ctlg?.nombre ?? '',
          unidad:   ctlg?.unidad ?? '',
          cantidad: Number(ins.cantidad),
        })
        batch.update(doc(db, 'insumos', ins.insumoId), {
          stockActual: increment(-Number(ins.cantidad)),
        })
      })

      // 3 — Eliminar expendios originales y recrear con nuevos valores
      // Obtener expendios de la visita anterior para calcular cantidadPeriodo
      let lastExpendios = {}
      if (visitaAnterior) {
        const expSnap = await getDocs(
          collection(db, 'clientes', clienteId, 'maquinas', maquinaId, 'visitas', visitaAnterior.id, 'expendios')
        )
        expSnap.docs.forEach((d) => {
          const data = d.data()
          lastExpendios[data.bebidaId] = data.contadorAcumulado
        })
      }

      expendiosOriginales.forEach((exp) => {
        batch.delete(doc(db, ...visitaPath, 'expendios', exp.docId))
      })

      bebidas.forEach((bebida) => {
        const valorStr = expendios[bebida.id]
        if (valorStr === '' || valorStr == null) return
        const contadorAcumulado = parseInt(valorStr, 10)
        if (isNaN(contadorAcumulado)) return
        const cantidadPeriodo = lastExpendios[bebida.id] != null
          ? Math.max(0, contadorAcumulado - lastExpendios[bebida.id])
          : null
        const expRef = doc(collection(db, ...visitaPath, 'expendios'))
        batch.set(expRef, {
          bebidaId:          bebida.id,
          bebidaNombre:      bebida.nombre,
          contadorAcumulado,
          cantidadPeriodo,
        })
      })

      // 4 — Actualizar visita
      batch.update(doc(db, ...visitaPath), {
        fecha:            Timestamp.fromDate(fechaDate),
        contadorTotal:    contadorNum,
        serviciosPeriodo: serviciosPeriodo,
        observaciones:    observaciones || '',
        updatedAt:        serverTimestamp(),
      })

      // 5 — Si es la visita más reciente, actualizar máquina
      // (verificamos comparando con contadorActual de la máquina)
      if (maquina?.contadorActual === parseInt(contadorTotal, 10)) {
        batch.update(doc(db, 'clientes', clienteId, 'maquinas', maquinaId), {
          contadorActual: contadorNum,
          ultimaVisita:   Timestamp.fromDate(fechaDate),
        })
      }

      await batch.commit()
      navigate(`/admin/maquinas/${maquinaId}?cliente=${clienteId}`)
    } catch (err) {
      setErrors({ _global: 'Error al guardar: ' + err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
    </div>
  )
  if (!maquinaId || !clienteId) return <p style={{ color: 'var(--danger-color)' }}>Faltan parámetros en la URL.</p>

  return (
    <div style={{ maxWidth: 580 }}>
      <Link
        to={`/admin/maquinas/${maquinaId}?cliente=${clienteId}`}
        className="d-inline-flex align-items-center gap-1 mb-1 text-decoration-none small"
        style={{ color: 'var(--text-secondary)' }}
      >
        <BsChevronLeft size={12} /> {maquina?.nombre ?? 'Máquina'}
      </Link>

      <h5 className="mb-1 mt-1" style={{ color: 'var(--text-primary)' }}>Editar visita</h5>
      <p className="small mb-3" style={{ color: 'var(--warning-color)' }}>
        El stock de insumos se ajustará automáticamente al guardar.
      </p>

      <form onSubmit={handleSubmit}>
        {/* General */}
        <SECTION title="General">
          <div className="row g-2">
            <div className="col-12 col-sm-6">
              <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>Fecha *</label>
              <input
                type="date" className="form-control" style={inputStyle}
                value={fecha} onChange={(e) => setFecha(e.target.value)}
              />
              {errors.fecha && <p className="mt-1 mb-0 small" style={{ color: 'var(--danger-color)' }}>{errors.fecha}</p>}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>
                Contador total *
                {visitaAnterior && <span className="ms-1" style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(anterior: {visitaAnterior.contadorTotal})</span>}
              </label>
              <input
                type="number" className="form-control" style={inputStyle}
                min={0} value={contadorTotal}
                onChange={(e) => setContadorTotal(e.target.value)}
              />
              {errors.contadorTotal && <p className="mt-1 mb-0 small" style={{ color: 'var(--danger-color)' }}>{errors.contadorTotal}</p>}
            </div>
          </div>
          <div className="mt-2">
            <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>Observaciones</label>
            <textarea
              className="form-control" style={{ ...inputStyle, resize: 'vertical' }}
              rows={2} value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </SECTION>

        {/* Contadores por bebida */}
        {bebidas.length > 0 && (
          <SECTION title="Contadores por bebida" subtitle="Contador acumulado que muestra la máquina.">
            <div className="d-flex flex-column gap-2">
              {bebidas.map((bebida) => (
                <div key={bebida.id} className="d-flex align-items-center gap-2">
                  <label className="small mb-0 flex-grow-1" style={{ color: 'var(--text-primary)', minWidth: 0 }}>
                    {bebida.nombre}
                  </label>
                  <input
                    type="number" min={0}
                    className="form-control form-control-sm"
                    style={{ ...inputStyle, width: 110, textAlign: 'right' }}
                    value={expendios[bebida.id] ?? ''}
                    onChange={(e) => setExpendios((p) => ({ ...p, [bebida.id]: e.target.value }))}
                    placeholder="—"
                  />
                </div>
              ))}
            </div>
          </SECTION>
        )}

        {/* Insumos */}
        <SECTION title="Insumos cargados" subtitle="Cantidad real que cargaste en esta visita.">
          {catalogoInsumos.length === 0 ? (
            <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>No hay insumos en el catálogo.</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {insumos.map((row, i) => {
                const sel = catalogoInsumos.find((c) => c.id === row.insumoId)
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
                        <option key={c.id} value={c.id}>{c.nombre} ({c.stockActual ?? 0} {c.unidad})</option>
                      ))}
                    </select>
                    <input
                      type="number" min={0} step="0.01"
                      className="form-control form-control-sm"
                      style={{ ...inputStyle, width: 90 }}
                      placeholder={sel?.unidad ?? 'Cant.'}
                      value={row.cantidad}
                      onChange={(e) => setInsumo(i, 'cantidad', e.target.value)}
                    />
                    {insumos.length > 1 && (
                      <button type="button" className="btn btn-sm"
                        onClick={() => removeInsumo(i)}
                        style={{ color: 'var(--danger-color)', background: 'transparent', border: 'none', padding: '0.25rem' }}>
                        <BsTrash size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          <button type="button" className="btn btn-sm mt-2 d-flex align-items-center gap-1"
            onClick={addInsumo}
            style={{ color: 'var(--primary-color)', background: 'transparent', border: '1px dashed var(--primary-color)', borderRadius: '0.5rem' }}>
            <BsPlus size={16} /> Agregar insumo
          </button>
        </SECTION>

        {errors._global && <div className="alert alert-danger py-2 small mb-3">{errors._global}</div>}

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-theme-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <Link to={`/admin/maquinas/${maquinaId}?cliente=${clienteId}`} className="btn btn-theme-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
