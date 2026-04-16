import { useEffect, useState } from 'react'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, Timestamp, getDoc,
} from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { formatFecha } from '../../lib/negocio'
import {
  BsPlus, BsTrash, BsPencil, BsCheck2, BsX,
  BsExclamationTriangleFill, BsCheckCircleFill, BsClockFill,
} from 'react-icons/bs'

// ── helpers ────────────────────────────────────────────────────────────────────

const ESTADOS = [
  { value: 'todos',     label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'resuelto',  label: 'Resueltos' },
]

function badgeEstado(estado) {
  if (estado === 'resuelto') {
    return (
      <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
        style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--success-color)', fontSize: '0.72rem', fontWeight: 600 }}>
        <BsCheckCircleFill size={10} /> Resuelto
      </span>
    )
  }
  return (
    <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
      style={{ background: 'rgba(251,191,36,0.12)', color: '#f59e0b', fontSize: '0.72rem', fontWeight: 600 }}>
      <BsClockFill size={10} /> Pendiente
    </span>
  )
}

const inputStyle = {
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
}

const FORM_EMPTY = {
  clienteId: '',
  maquinaId: '',
  maquinaNombre: '',
  clienteNombre: '',
  fechaIncidencia: '',
  fechaResolucion: '',
  motivo: '',
  descripcion: '',
}

// Convierte "YYYY-MM-DD" → Timestamp medianoche BA, o null
function dateToTimestamp(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  const date = new Date(y, m - 1, d, 12, 0, 0) // mediodía local → evita off-by-one
  return Timestamp.fromDate(date)
}

// Timestamp → "YYYY-MM-DD"
function timestampToInputDate(ts) {
  if (!ts) return ''
  const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts)
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
}

// ── componente ────────────────────────────────────────────────────────────────

export default function IncidenciasPage() {
  const [incidencias, setIncidencias]   = useState([])
  const [clientes, setClientes]         = useState([])   // [{ id, razonSocial, maquinas: [{id, nombre}] }]
  const [loading, setLoading]           = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('todos')

  // Formulario nueva / edición
  const [showForm, setShowForm]         = useState(false)
  const [form, setForm]                 = useState(FORM_EMPTY)
  const [editId, setEditId]             = useState(null)   // null → nueva
  const [saving, setSaving]             = useState(false)

  // Confirmación eliminación
  const [confirmDelete, setConfirmDelete] = useState(null) // incidenciaId

  // ── cargar datos ────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      getDocs(query(collection(db, 'incidencias'), orderBy('fechaIncidencia', 'desc'))),
      getDocs(collection(db, 'clientes')),
    ]).then(async ([incSnap, cliSnap]) => {
      setIncidencias(incSnap.docs.map((d) => ({ id: d.id, ...d.data() })))

      // Para cada cliente cargamos sus máquinas
      const clientesConMaquinas = await Promise.all(
        cliSnap.docs.map(async (c) => {
          const maqSnap = await getDocs(collection(db, 'clientes', c.id, 'maquinas'))
          return {
            id: c.id,
            razonSocial: c.data().razonSocial,
            maquinas: maqSnap.docs.map((m) => ({ id: m.id, nombre: m.data().nombre })),
          }
        })
      )
      setClientes(clientesConMaquinas)
      setLoading(false)
    })
  }, [])

  // ── opciones de máquinas según cliente seleccionado ─────────────────────────
  const maquinasDelCliente = clientes.find((c) => c.id === form.clienteId)?.maquinas ?? []

  // ── handlers form ────────────────────────────────────────────────────────────
  function abrirFormNueva() {
    setForm(FORM_EMPTY)
    setEditId(null)
    setShowForm(true)
  }

  function abrirFormEditar(inc) {
    setForm({
      clienteId:       inc.clienteId       ?? '',
      maquinaId:       inc.maquinaId       ?? '',
      maquinaNombre:   inc.maquinaNombre   ?? '',
      clienteNombre:   inc.clienteNombre   ?? '',
      fechaIncidencia: timestampToInputDate(inc.fechaIncidencia),
      fechaResolucion: timestampToInputDate(inc.fechaResolucion),
      motivo:          inc.motivo          ?? '',
      descripcion:     inc.descripcion     ?? '',
    })
    setEditId(inc.id)
    setShowForm(true)
  }

  function cerrarForm() {
    setShowForm(false)
    setEditId(null)
    setForm(FORM_EMPTY)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }

      // Al cambiar cliente, resetear máquina
      if (name === 'clienteId') {
        next.maquinaId     = ''
        next.maquinaNombre = ''
        next.clienteNombre = clientes.find((c) => c.id === value)?.razonSocial ?? ''
      }

      // Al cambiar máquina, guardar nombre legible
      if (name === 'maquinaId') {
        const cliente = clientes.find((c) => c.id === prev.clienteId)
        next.maquinaNombre = cliente?.maquinas.find((m) => m.id === value)?.nombre ?? ''
      }

      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.motivo.trim() || !form.fechaIncidencia) return

    setSaving(true)
    try {
      const data = {
        clienteId:       form.clienteId       || null,
        clienteNombre:   form.clienteNombre   || null,
        maquinaId:       form.maquinaId       || null,
        maquinaNombre:   form.maquinaNombre   || null,
        motivo:          form.motivo.trim(),
        descripcion:     form.descripcion.trim() || null,
        fechaIncidencia: dateToTimestamp(form.fechaIncidencia),
        fechaResolucion: dateToTimestamp(form.fechaResolucion),
        estado:          form.fechaResolucion ? 'resuelto' : 'pendiente',
      }

      if (editId) {
        await updateDoc(doc(db, 'incidencias', editId), data)
        setIncidencias((prev) =>
          prev.map((inc) => (inc.id === editId ? { ...inc, ...data } : inc))
            .sort((a, b) => {
              const ta = a.fechaIncidencia?.seconds ?? 0
              const tb = b.fechaIncidencia?.seconds ?? 0
              return tb - ta
            })
        )
      } else {
        const ref = await addDoc(collection(db, 'incidencias'), data)
        setIncidencias((prev) =>
          [{ id: ref.id, ...data }, ...prev]
        )
      }
      cerrarForm()
    } catch (err) {
      alert('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'incidencias', id))
    setIncidencias((prev) => prev.filter((i) => i.id !== id))
    setConfirmDelete(null)
  }

  // Marcar como resuelto rápido (sin abrir formulario)
  async function marcarResuelto(inc) {
    const fechaResolucion = Timestamp.now()
    await updateDoc(doc(db, 'incidencias', inc.id), { fechaResolucion, estado: 'resuelto' })
    setIncidencias((prev) =>
      prev.map((i) => i.id === inc.id ? { ...i, fechaResolucion, estado: 'resuelto' } : i)
    )
  }

  // ── filtro ──────────────────────────────────────────────────────────────────
  const lista = incidencias.filter((i) => {
    if (filtroEstado === 'todos') return true
    return i.estado === filtroEstado
  })

  const pendientesCount = incidencias.filter((i) => i.estado === 'pendiente').length

  // ── render ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
    </div>
  )

  return (
    <div style={{ maxWidth: 720 }}>

      {/* Header */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>
            Incidencias
            {pendientesCount > 0 && (
              <span className="ms-2 px-2 py-0 rounded-pill"
                style={{ background: 'rgba(251,191,36,0.15)', color: '#f59e0b', fontSize: '0.72rem', fontWeight: 700, verticalAlign: 'middle' }}>
                {pendientesCount} pendiente{pendientesCount > 1 ? 's' : ''}
              </span>
            )}
          </h5>
          <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Registro de problemas y resoluciones en máquinas</p>
        </div>
        <button
          onClick={abrirFormNueva}
          className="btn btn-sm btn-theme-primary d-flex align-items-center gap-1"
        >
          <BsPlus size={16} /> Nueva incidencia
        </button>
      </div>

      {/* Filtros */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {ESTADOS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFiltroEstado(value)}
            className="btn btn-sm"
            style={{
              borderRadius: '2rem',
              border: filtroEstado === value ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
              background:  filtroEstado === value ? 'rgba(14,165,233,0.1)' : 'transparent',
              color:       filtroEstado === value ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight:  filtroEstado === value ? 600 : 400,
              fontSize: '0.8rem',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Formulario nueva / editar */}
      {showForm && (
        <div className="rounded-3 p-3 mb-3"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--primary-color)' }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="mb-0" style={{ color: 'var(--text-primary)' }}>
              {editId ? 'Editar incidencia' : 'Nueva incidencia'}
            </h6>
            <button onClick={cerrarForm} className="btn btn-sm p-0"
              style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}>
              <BsX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-2">
              {/* Cliente */}
              <div className="col-12 col-sm-6">
                <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>Cliente</label>
                <select
                  name="clienteId"
                  value={form.clienteId}
                  onChange={handleChange}
                  className="form-select form-select-sm"
                  style={inputStyle}
                >
                  <option value="">— Sin especificar —</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.razonSocial}</option>
                  ))}
                </select>
              </div>

              {/* Máquina */}
              <div className="col-12 col-sm-6">
                <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>Máquina</label>
                <select
                  name="maquinaId"
                  value={form.maquinaId}
                  onChange={handleChange}
                  className="form-select form-select-sm"
                  style={inputStyle}
                  disabled={!form.clienteId}
                >
                  <option value="">— Sin especificar —</option>
                  {maquinasDelCliente.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Fecha incidencia */}
              <div className="col-12 col-sm-6">
                <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Fecha del problema <span style={{ color: 'var(--danger-color)' }}>*</span>
                </label>
                <input
                  type="date"
                  name="fechaIncidencia"
                  value={form.fechaIncidencia}
                  onChange={handleChange}
                  required
                  className="form-control form-control-sm"
                  style={inputStyle}
                />
              </div>

              {/* Fecha resolución */}
              <div className="col-12 col-sm-6">
                <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>Fecha de resolución</label>
                <input
                  type="date"
                  name="fechaResolucion"
                  value={form.fechaResolucion}
                  onChange={handleChange}
                  className="form-control form-control-sm"
                  style={inputStyle}
                />
              </div>

              {/* Motivo */}
              <div className="col-12">
                <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Motivo / tipo de problema <span style={{ color: 'var(--danger-color)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="motivo"
                  value={form.motivo}
                  onChange={handleChange}
                  required
                  placeholder="Ej: No entrega café, Error en pantalla, Fuga de agua…"
                  className="form-control form-control-sm"
                  style={inputStyle}
                />
              </div>

              {/* Descripción */}
              <div className="col-12">
                <label className="form-label small mb-1" style={{ color: 'var(--text-secondary)' }}>Descripción / detalles</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Descripción detallada del problema y/o de la solución aplicada…"
                  className="form-control form-control-sm"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Acciones */}
              <div className="col-12 d-flex gap-2 justify-content-end mt-1">
                <button type="button" onClick={cerrarForm} className="btn btn-sm btn-theme-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-sm btn-theme-primary" disabled={saving}>
                  {saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Registrar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {lista.length === 0 ? (
        <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
          <BsExclamationTriangleFill size={28} className="mb-2 opacity-30" />
          <p className="mb-0 small">
            {filtroEstado === 'todos' ? 'No hay incidencias registradas.' : `No hay incidencias ${filtroEstado === 'pendiente' ? 'pendientes' : 'resueltas'}.`}
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {lista.map((inc) => {
            const esConfirm = confirmDelete === inc.id
            return (
              <div
                key={inc.id}
                className="rounded-3"
                style={{
                  background: 'var(--bg-secondary)',
                  border: `1px solid ${esConfirm ? 'var(--danger-color)' : 'var(--border-color)'}`,
                  overflow: 'hidden',
                  transition: 'border-color 0.15s',
                }}
              >
                {esConfirm ? (
                  <div className="p-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <p className="mb-0 small" style={{ color: 'var(--text-primary)' }}>
                      ¿Eliminar esta incidencia?
                    </p>
                    <div className="d-flex gap-2">
                      <button className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                        onClick={() => handleDelete(inc.id)}>
                        <BsCheck2 size={13} /> Confirmar
                      </button>
                      <button className="btn btn-sm btn-theme-secondary"
                        onClick={() => setConfirmDelete(null)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3">
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      {/* Info principal */}
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                          {badgeEstado(inc.estado)}
                          {inc.maquinaNombre && (
                            <span className="small fw-semibold" style={{ color: 'var(--primary-color)' }}>
                              {inc.maquinaNombre}
                            </span>
                          )}
                          {inc.clienteNombre && (
                            <span className="small" style={{ color: 'var(--text-secondary)' }}>
                              — {inc.clienteNombre}
                            </span>
                          )}
                        </div>

                        <p className="mb-0 fw-semibold small" style={{ color: 'var(--text-primary)' }}>
                          {inc.motivo}
                        </p>

                        {inc.descripcion && (
                          <p className="mb-1 small" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            {inc.descripcion}
                          </p>
                        )}

                        {/* Fechas */}
                        <div className="d-flex gap-3 mt-1 flex-wrap">
                          <span className="small" style={{ color: 'var(--text-secondary)' }}>
                            <span style={{ opacity: 0.6 }}>Incidencia:</span>{' '}
                            <span style={{ color: 'var(--text-primary)' }}>{formatFecha(inc.fechaIncidencia)}</span>
                          </span>
                          {inc.fechaResolucion && (
                            <span className="small" style={{ color: 'var(--text-secondary)' }}>
                              <span style={{ opacity: 0.6 }}>Resolución:</span>{' '}
                              <span style={{ color: 'var(--success-color)' }}>{formatFecha(inc.fechaResolucion)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="d-flex gap-1 flex-shrink-0">
                        {inc.estado === 'pendiente' && (
                          <button
                            className="btn btn-sm"
                            onClick={() => marcarResuelto(inc)}
                            title="Marcar como resuelto"
                            style={{ color: 'var(--success-color)', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.4rem', padding: '0.2rem 0.5rem' }}
                          >
                            <BsCheckCircleFill size={13} />
                          </button>
                        )}
                        <button
                          className="btn btn-sm"
                          onClick={() => abrirFormEditar(inc)}
                          title="Editar"
                          style={{ color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.4rem', padding: '0.2rem 0.5rem' }}
                        >
                          <BsPencil size={12} />
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => setConfirmDelete(inc.id)}
                          title="Eliminar"
                          style={{ color: 'var(--danger-color)', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.4rem', padding: '0.2rem 0.5rem' }}
                        >
                          <BsTrash size={12} />
                        </button>
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
