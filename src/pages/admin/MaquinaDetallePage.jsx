import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  doc, getDoc, collection, getDocs, orderBy, query, deleteDoc,
  writeBatch, serverTimestamp, Timestamp, increment, limit,
} from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { formatFecha, calcularServiciosPeriodo } from '../../lib/negocio'
import { BsChevronLeft, BsPencil, BsTrash, BsPlus, BsClipboardCheck, BsCheck2 } from 'react-icons/bs'

const inputStyle = {
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
}

function hoy() {
  return new Date().toISOString().split('T')[0]
}

export default function MaquinaDetallePage() {
  const { maquinaId } = useParams()
  const navigate = useNavigate()
  const clienteId = new URLSearchParams(window.location.search).get('cliente')

  const [maquina, setMaquina]           = useState(null)
  const [cliente, setCliente]           = useState(null)
  const [visitas, setVisitas]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Estado de acción por visita: { [visitaId]: 'confirm-delete' | 'editing' | null }
  const [accion, setAccion] = useState({})
  // Formulario de edición inline
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving]     = useState(null) // visitaId que se está guardando

  useEffect(() => {
    if (!clienteId) { setLoading(false); return }
    Promise.all([
      getDoc(doc(db, 'clientes', clienteId, 'maquinas', maquinaId)),
      getDoc(doc(db, 'clientes', clienteId)),
      getDocs(query(
        collection(db, 'clientes', clienteId, 'maquinas', maquinaId, 'visitas'),
        orderBy('fecha', 'desc'),
        limit(10),
      )),
    ]).then(([maqSnap, cliSnap, visitasSnap]) => {
      if (maqSnap.exists()) setMaquina({ id: maqSnap.id, ...maqSnap.data() })
      if (cliSnap.exists()) setCliente({ id: cliSnap.id, ...cliSnap.data() })
      setVisitas(visitasSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [maquinaId, clienteId])

  const handleDeleteMaquina = async () => {
    await deleteDoc(doc(db, 'clientes', clienteId, 'maquinas', maquinaId))
    navigate(`/admin/clientes/${clienteId}`)
  }

  // ── Eliminar visita ──────────────────────────────────
  const handleDeleteVisita = async (visita) => {
    setSaving(visita.id)
    try {
      const visitaPath = ['clientes', clienteId, 'maquinas', maquinaId, 'visitas', visita.id]
      const [insumosSnap, expendiosSnap] = await Promise.all([
        getDocs(collection(db, ...visitaPath, 'insumos')),
        getDocs(collection(db, ...visitaPath, 'expendios')),
      ])

      const batch = writeBatch(db)

      // Restaurar stock de insumos que se cargaron en esa visita
      insumosSnap.docs.forEach((d) => {
        const { insumoId, cantidad } = d.data()
        if (insumoId && cantidad > 0) {
          batch.update(doc(db, 'insumos', insumoId), { stockActual: increment(cantidad) })
        }
        batch.delete(d.ref)
      })

      // Borrar expendios
      expendiosSnap.docs.forEach((d) => batch.delete(d.ref))

      // Borrar la visita
      batch.delete(doc(db, ...visitaPath))

      // Si era la última visita (primera en lista desc), actualizar la máquina
      const esUltimaVisita = visitas[0]?.id === visita.id
      if (esUltimaVisita) {
        const visitaAnterior = visitas[1] ?? null
        batch.update(doc(db, 'clientes', clienteId, 'maquinas', maquinaId), {
          contadorActual: visitaAnterior?.contadorTotal ?? null,
          ultimaVisita:   visitaAnterior?.fecha ?? null,
        })
      }

      await batch.commit()

      const nuevasVisitas = visitas.filter((v) => v.id !== visita.id)
      setVisitas(nuevasVisitas)
      if (esUltimaVisita) {
        setMaquina((prev) => ({
          ...prev,
          contadorActual: visitas[1]?.contadorTotal ?? null,
          ultimaVisita:   visitas[1]?.fecha ?? null,
        }))
      }
      setAccion((prev) => { const n = { ...prev }; delete n[visita.id]; return n })
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    } finally {
      setSaving(null)
    }
  }

  // ── Editar visita ────────────────────────────────────
  const abrirEdicion = (visita) => {
    const fechaStr = visita.fecha?.toDate
      ? visita.fecha.toDate().toISOString().split('T')[0]
      : hoy()
    setEditForm({
      contadorTotal:  String(visita.contadorTotal ?? ''),
      observaciones:  visita.observaciones ?? '',
      fecha:          fechaStr,
    })
    setAccion((prev) => ({ ...prev, [visita.id]: 'editing' }))
  }

  const handleGuardarEdicion = async (visita) => {
    const contadorNum = parseInt(editForm.contadorTotal, 10)
    if (isNaN(contadorNum) || contadorNum < 0) return

    // Calcular serviciosPeriodo contra la visita anterior (más antigua en lista desc)
    const idx = visitas.findIndex((v) => v.id === visita.id)
    const visitaAnterior = visitas[idx + 1] ?? null
    const serviciosPeriodo = calcularServiciosPeriodo(contadorNum, visitaAnterior?.contadorTotal ?? null)

    setSaving(visita.id)
    try {
      const fechaDate = new Date(editForm.fecha + 'T12:00:00')
      const batch = writeBatch(db)

      batch.update(doc(db, 'clientes', clienteId, 'maquinas', maquinaId, 'visitas', visita.id), {
        contadorTotal:    contadorNum,
        observaciones:    editForm.observaciones || '',
        fecha:            Timestamp.fromDate(fechaDate),
        serviciosPeriodo: serviciosPeriodo,
        updatedAt:        serverTimestamp(),
      })

      // Si es la visita más reciente, actualizar la máquina
      if (visitas[0]?.id === visita.id) {
        batch.update(doc(db, 'clientes', clienteId, 'maquinas', maquinaId), {
          contadorActual: contadorNum,
          ultimaVisita:   Timestamp.fromDate(fechaDate),
        })
        setMaquina((prev) => ({ ...prev, contadorActual: contadorNum }))
      }

      await batch.commit()

      setVisitas((prev) => prev.map((v) =>
        v.id === visita.id
          ? { ...v, contadorTotal: contadorNum, observaciones: editForm.observaciones, fecha: Timestamp.fromDate(fechaDate), serviciosPeriodo }
          : v
      ))
      setAccion((prev) => { const n = { ...prev }; delete n[visita.id]; return n })
    } catch (err) {
      alert('Error al guardar: ' + err.message)
    } finally {
      setSaving(null)
    }
  }

  // ── Render ────────────────────────────────────────────
  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
    </div>
  )
  if (!maquina) return <p style={{ color: 'var(--text-secondary)' }}>Máquina no encontrada.</p>

  return (
    <div style={{ maxWidth: 680 }}>
      <Link
        to={`/admin/clientes/${clienteId}`}
        className="d-inline-flex align-items-center gap-1 mb-1 text-decoration-none small"
        style={{ color: 'var(--text-secondary)' }}
      >
        <BsChevronLeft size={12} /> {cliente?.razonSocial ?? 'Cliente'}
      </Link>

      {/* Header */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3 mt-1">
        <div>
          <h5 className="mb-1" style={{ color: 'var(--text-primary)' }}>{maquina.nombre}</h5>
          <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
            {maquina.modelo && <span>{maquina.modelo}</span>}
            {maquina.modelo && maquina.serie && <span> · </span>}
            {maquina.serie && <span>S/N: {maquina.serie}</span>}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link
            to={`/admin/maquinas/${maquinaId}/editar?cliente=${clienteId}`}
            className="btn btn-sm btn-theme-secondary d-flex align-items-center gap-1"
          >
            <BsPencil size={12} /> Editar
          </Link>
          <button
            className="btn btn-sm"
            onClick={() => setConfirmDelete(true)}
            style={{ border: '1px solid var(--danger-color)', color: 'var(--danger-color)', background: 'transparent', borderRadius: '0.5rem' }}
          >
            <BsTrash size={12} />
          </button>
        </div>
      </div>

      {/* Confirm delete máquina */}
      {confirmDelete && (
        <div className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger-color)' }}>
          <span className="small" style={{ color: 'var(--text-primary)' }}>¿Eliminar esta máquina y todas sus visitas?</span>
          <div className="d-flex gap-2">
            <button className="btn btn-danger btn-sm" onClick={handleDeleteMaquina}>Confirmar</button>
            <button className="btn btn-sm btn-theme-secondary" onClick={() => setConfirmDelete(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="row g-2 mb-3">
        <div className="col-6 col-sm-3">
          <div className="p-3 rounded-3 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Contador actual</p>
            <p className="mb-0 fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>
              {maquina.contadorActual != null ? maquina.contadorActual.toLocaleString('es-AR') : '—'}
            </p>
          </div>
        </div>
        <div className="col-6 col-sm-3">
          <div className="p-3 rounded-3 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Visitas</p>
            <p className="mb-0 fw-bold" style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>{visitas.length}</p>
          </div>
        </div>
        <div className="col-12 col-sm-6">
          <div className="p-3 rounded-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Última visita</p>
            <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>
              {visitas[0] ? formatFecha(visitas[0].fecha) : 'Sin visitas aún'}
            </p>
          </div>
        </div>
      </div>

      {maquina.notas && (
        <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <p className="small fw-bold mb-1" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em' }}>Notas</p>
          <p className="mb-0 small" style={{ color: 'var(--text-primary)' }}>{maquina.notas}</p>
        </div>
      )}

      {/* Historial de visitas */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="mb-0" style={{ color: 'var(--text-primary)' }}>
          Visitas <span className="small fw-normal" style={{ color: 'var(--text-secondary)' }}>({visitas.length})</span>
        </h6>
        <Link
          to={`/admin/visitas/nueva/${maquinaId}?cliente=${clienteId}`}
          className="btn btn-sm btn-theme-primary d-flex align-items-center gap-1"
        >
          <BsPlus size={16} /> Registrar visita
        </Link>
      </div>

      {visitas.length === 0 ? (
        <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
          <BsClipboardCheck size={28} className="mb-2 opacity-50" />
          <p className="mb-0 small">Todavía no hay visitas registradas.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {visitas.map((v, idx) => {
            const estado = accion[v.id]
            const estaGuardando = saving === v.id
            const esUltima = idx === 0

            return (
              <div
                key={v.id}
                className="rounded-3"
                style={{
                  background: 'var(--bg-secondary)',
                  border: `1px solid ${estado === 'confirm-delete' ? 'var(--danger-color)' : estado === 'editing' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  transition: 'border-color 0.15s',
                  overflow: 'hidden',
                }}
              >
                {/* ── Edición inline ── */}
                {estado === 'editing' ? (
                  <div className="p-3">
                    <p className="small fw-bold mb-2" style={{ color: 'var(--primary-color)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em' }}>
                      Editando visita
                    </p>
                    {!esUltima && (
                      <p className="small mb-2 p-2 rounded-2" style={{ background: 'rgba(245,158,11,0.08)', color: 'var(--warning-color)', border: '1px solid var(--warning-color)' }}>
                        Esta no es la última visita. El serviciosPeriodo de visitas posteriores no se recalculará automáticamente.
                      </p>
                    )}
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>Fecha</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          style={inputStyle}
                          value={editForm.fecha}
                          onChange={(e) => setEditForm((f) => ({ ...f, fecha: e.target.value }))}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>Contador total</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          style={inputStyle}
                          min={0}
                          value={editForm.contadorTotal}
                          onChange={(e) => setEditForm((f) => ({ ...f, contadorTotal: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>Observaciones</label>
                      <textarea
                        className="form-control form-control-sm"
                        style={{ ...inputStyle, resize: 'vertical' }}
                        rows={2}
                        value={editForm.observaciones}
                        onChange={(e) => setEditForm((f) => ({ ...f, observaciones: e.target.value }))}
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-theme-primary d-flex align-items-center gap-1"
                        onClick={() => handleGuardarEdicion(v)}
                        disabled={estaGuardando}
                      >
                        <BsCheck2 size={14} /> {estaGuardando ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        className="btn btn-sm btn-theme-secondary"
                        onClick={() => setAccion((p) => ({ ...p, [v.id]: undefined }))}
                        disabled={estaGuardando}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : estado === 'confirm-delete' ? (
                  /* ── Confirmar eliminación ── */
                  <div className="p-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <p className="mb-0 small fw-semibold" style={{ color: 'var(--danger-color)' }}>¿Eliminar visita del {formatFecha(v.fecha)}?</p>
                      <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
                        El stock de insumos cargados se restaurará.{esUltima && ' El contador de la máquina volverá a la visita anterior.'}
                      </p>
                    </div>
                    <div className="d-flex gap-2 flex-shrink-0">
                      <button
                        className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                        onClick={() => handleDeleteVisita(v)}
                        disabled={estaGuardando}
                      >
                        <BsCheck2 size={14} /> {estaGuardando ? 'Eliminando...' : 'Confirmar'}
                      </button>
                      <button
                        className="btn btn-sm btn-theme-secondary"
                        onClick={() => setAccion((p) => ({ ...p, [v.id]: undefined }))}
                        disabled={estaGuardando}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Vista normal ── */
                  <div className="p-3">
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>{formatFecha(v.fecha)}</p>
                        {v.serviciosPeriodo != null ? (
                          <p className="mb-0 small" style={{ color: 'var(--success-color)' }}>
                            +{v.serviciosPeriodo} servicios en el período
                          </p>
                        ) : (
                          <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Primera visita</p>
                        )}
                        {v.observaciones && (
                          <p className="mb-0 small mt-1" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>{v.observaciones}</p>
                        )}
                      </div>
                      <div className="d-flex align-items-center gap-3 flex-shrink-0">
                        <div className="text-end">
                          <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Contador</p>
                          <p className="mb-0 fw-semibold" style={{ color: 'var(--primary-color)' }}>
                            {v.contadorTotal?.toLocaleString('es-AR') ?? '—'}
                          </p>
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm"
                            onClick={() => abrirEdicion(v)}
                            style={{ color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.4rem', padding: '0.2rem 0.4rem' }}
                            title="Editar visita"
                          >
                            <BsPencil size={12} />
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => setAccion((p) => ({ ...p, [v.id]: 'confirm-delete' }))}
                            style={{ color: 'var(--danger-color)', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.4rem', padding: '0.2rem 0.4rem' }}
                            title="Eliminar visita"
                          >
                            <BsTrash size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
