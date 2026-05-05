import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  doc, getDoc, collection, getDocs, orderBy, query, deleteDoc,
  writeBatch, increment, limit, addDoc, serverTimestamp, Timestamp, updateDoc, where,
} from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { useAuth } from '../../context/AuthContext'
import { formatFecha } from '../../lib/negocio'
import {
  BsChevronLeft, BsPencil, BsTrash, BsPlus, BsClipboardCheck,
  BsCheck2, BsFileEarmarkArrowDown, BsLink,
} from 'react-icons/bs'
import { generarRendicionPDF } from '../../lib/pdf'

const inputStyle = {
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
}

export default function MaquinaDetallePage() {
  const { maquinaId } = useParams()
  const navigate = useNavigate()
  const clienteId = new URLSearchParams(window.location.search).get('cliente')
  const { user } = useAuth()

  const [maquina, setMaquina]               = useState(null)
  const [cliente, setCliente]               = useState(null)
  const [visitas, setVisitas]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [confirmDelete, setConfirmDelete]   = useState(false)
  const [modeloNombre, setModeloNombre]     = useState(null)
  const [accion, setAccion]                 = useState({})
  const [saving, setSaving]                 = useState(null)

  // Token para visita a distancia
  const [tokenActivo, setTokenActivo]       = useState(null)
  const [mostrarGenerar, setMostrarGenerar] = useState(false)
  const [generandoLink, setGenerandoLink]   = useState(false)
  const [linkCopiado, setLinkCopiado]       = useState(false)

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
      getDocs(query(
        collection(db, 'tokensVisita'),
        where('maquinaId', '==', maquinaId),
      )),
    ]).then(([maqSnap, cliSnap, visitasSnap, tokensSnap]) => {
      if (maqSnap.exists()) setMaquina({ id: maqSnap.id, ...maqSnap.data() })
      if (cliSnap.exists()) setCliente({ id: cliSnap.id, ...cliSnap.data() })
      setVisitas(visitasSnap.docs.map((d) => ({ id: d.id, ...d.data() })))

      const ahora = new Date()
      const activo = tokensSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .find((t) => {
          if (t.estado !== 'pendiente') return false
          const expira = t.expiraEn instanceof Timestamp ? t.expiraEn.toDate() : new Date(t.expiraEn)
          return expira > ahora
        })
      setTokenActivo(activo ?? null)
      setLoading(false)
    })
  }, [maquinaId, clienteId])

  useEffect(() => {
    if (!maquina?.modeloId) return
    getDoc(doc(db, 'modelos', maquina.modeloId)).then((snap) => {
      if (snap.exists()) setModeloNombre(snap.data().nombre)
    })
  }, [maquina?.modeloId])

  // ── Generar link de visita a distancia ───────────────
  const handleGenerarToken = async () => {
    setGenerandoLink(true)
    try {
      // Cargar bebidas filtradas por modelo (igual que VisitaFormPage)
      const todasBebidas = (await getDocs(query(collection(db, 'bebidas'), orderBy('orden'))))
        .docs.map((d) => ({ id: d.id, ...d.data() })).filter((b) => b.activa)

      let bebidasToken = todasBebidas
      if (maquina.modeloId) {
        const modeloSnap = await getDoc(doc(db, 'modelos', maquina.modeloId))
        if (modeloSnap.exists()) {
          const ids = modeloSnap.data().bebidas ?? []
          const filtradas = ids.map((id) => todasBebidas.find((b) => b.id === id)).filter(Boolean)
          if (filtradas.length > 0) bebidasToken = filtradas
        }
      }

      const expiraEn = new Date()
      expiraEn.setDate(expiraEn.getDate() + 2)

      const tokenRef = await addDoc(collection(db, 'tokensVisita'), {
        maquinaId,
        clienteId,
        clienteNombre:    cliente?.razonSocial ?? '',
        maquinaNombre:    maquina.nombre ?? '',
        modeloId:         maquina.modeloId ?? null,
        estado:           'pendiente',
        creadoEn:         serverTimestamp(),
        expiraEn:         Timestamp.fromDate(expiraEn),
        usadoEn:          null,
        visitaId:         null,
        creadoPor:        user?.email ?? '',
        contadorAnterior: maquina.contadorActual ?? null,
        bebidas:          bebidasToken.map((b) => ({ id: b.id, nombre: b.nombre, orden: b.orden ?? 0 })),
      })

      setTokenActivo({ id: tokenRef.id, expiraEn, estado: 'pendiente' })
      setMostrarGenerar(false)
    } catch (err) {
      alert('Error al generar link: ' + err.message)
    } finally {
      setGenerandoLink(false)
    }
  }

  const handleCancelarToken = async () => {
    if (!tokenActivo) return
    try {
      await updateDoc(doc(db, 'tokensVisita', tokenActivo.id), { estado: 'cancelado' })
      setTokenActivo(null)
    } catch (err) {
      alert('Error al cancelar: ' + err.message)
    }
  }

  const handleCopiarLink = () => {
    const link = `${window.location.origin}/visita/${tokenActivo.id}`
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 2000)
    })
  }

  const linkRemoto = tokenActivo ? `${window.location.origin}/visita/${tokenActivo.id}` : ''

  const expiraTexto = tokenActivo?.expiraEn
    ? (tokenActivo.expiraEn instanceof Date
        ? tokenActivo.expiraEn.toLocaleDateString('es-AR')
        : tokenActivo.expiraEn.toDate?.().toLocaleDateString('es-AR') ?? '—')
    : '—'

  // ── Eliminar visita ───────────────────────────────────
  const handleDeleteMaquina = async () => {
    await deleteDoc(doc(db, 'clientes', clienteId, 'maquinas', maquinaId))
    navigate(`/admin/clientes/${clienteId}`)
  }

  const handleDeleteVisita = async (visita) => {
    setSaving(visita.id)
    try {
      const visitaPath = ['clientes', clienteId, 'maquinas', maquinaId, 'visitas', visita.id]
      const [insumosSnap, expendiosSnap] = await Promise.all([
        getDocs(collection(db, ...visitaPath, 'insumos')),
        getDocs(collection(db, ...visitaPath, 'expendios')),
      ])

      const batch = writeBatch(db)

      insumosSnap.docs.forEach((d) => {
        const { insumoId, cantidad } = d.data()
        if (insumoId && cantidad > 0) {
          batch.update(doc(db, 'insumos', insumoId), { stockActual: increment(cantidad) })
        }
        batch.delete(d.ref)
      })

      expendiosSnap.docs.forEach((d) => batch.delete(d.ref))
      batch.delete(doc(db, ...visitaPath))

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
            {(modeloNombre ?? maquina.modelo) && <span>{modeloNombre ?? maquina.modelo}</span>}
            {(modeloNombre ?? maquina.modelo) && maquina.serie && <span> · </span>}
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

      {/* Confirmar eliminar máquina */}
      {confirmDelete && (
        <div
          className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger-color)' }}
        >
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

      {/* Historial de visitas — header */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="mb-0" style={{ color: 'var(--text-primary)' }}>
          Visitas <span className="small fw-normal" style={{ color: 'var(--text-secondary)' }}>({visitas.length})</span>
        </h6>
        <div className="d-flex gap-2">
          {!tokenActivo && (
            <button
              className="btn btn-sm btn-theme-secondary d-flex align-items-center gap-1"
              onClick={() => setMostrarGenerar((v) => !v)}
              title="Generar link de visita a distancia"
            >
              <BsLink size={13} /> A distancia
            </button>
          )}
          <Link
            to={`/admin/visitas/nueva/${maquinaId}?cliente=${clienteId}`}
            className="btn btn-sm btn-theme-primary d-flex align-items-center gap-1"
          >
            <BsPlus size={16} /> Registrar visita
          </Link>
        </div>
      </div>

      {/* Confirmar generación de link */}
      {mostrarGenerar && !tokenActivo && (
        <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <p className="small mb-1" style={{ color: 'var(--text-primary)' }}>
            Generar link de visita a distancia para <strong>{maquina.nombre}</strong>
          </p>
          <p className="small mb-3" style={{ color: 'var(--text-secondary)' }}>
            El operador podrá reportar los consumos del equipo. El link es de único uso y vence en 2 días.
          </p>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-theme-primary"
              onClick={handleGenerarToken}
              disabled={generandoLink}
            >
              {generandoLink ? 'Generando...' : 'Generar link'}
            </button>
            <button
              className="btn btn-sm btn-theme-secondary"
              onClick={() => setMostrarGenerar(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Link activo */}
      {tokenActivo && (
        <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--primary-color)' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <p className="small fw-bold mb-0" style={{ color: 'var(--primary-color)' }}>
              <BsLink size={13} className="me-1" />Link activo
            </p>
            <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>Vence: {expiraTexto}</p>
          </div>
          <input
            readOnly
            value={linkRemoto}
            className="form-control form-control-sm mb-2"
            style={{ ...inputStyle, fontSize: '0.75rem', cursor: 'text' }}
            onClick={(e) => e.target.select()}
          />
          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-sm btn-theme-primary"
              onClick={handleCopiarLink}
            >
              {linkCopiado ? '✓ Copiado' : 'Copiar link'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hola! Te enviamos un link para reportar los consumos del equipo *${maquina.nombre}*.\nEs de único uso y vence en 2 días.\n\n${linkRemoto}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-theme-secondary"
            >
              WhatsApp
            </a>
            <button
              className="btn btn-sm"
              onClick={handleCancelarToken}
              style={{ color: 'var(--danger-color)', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
            >
              Cancelar link
            </button>
          </div>
        </div>
      )}

      {/* Lista de visitas */}
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
            const visitaAnterior = visitas[idx + 1] ?? null

            const handleDescargarRendicion = async () => {
              const expSnap = await getDocs(
                collection(db, 'clientes', clienteId, 'maquinas', maquinaId, 'visitas', v.id, 'expendios')
              )
              const expendios = expSnap.docs
                .map((d) => d.data())
                .filter((e) => (e.cantidadPeriodo ?? e.cantidad ?? 0) > 0)
                .sort((a, b) => a.bebidaNombre.localeCompare(b.bebidaNombre))

              const contadorAnterior = visitaAnterior?.contadorTotal ?? null
              const serviciosPeriodo = contadorAnterior != null
                ? Math.max(0, v.contadorTotal - contadorAnterior)
                : null

              generarRendicionPDF({
                clienteNombre:   cliente?.razonSocial    ?? '',
                clienteCuit:     cliente?.cuit           ?? '',
                clienteContacto: cliente?.contactoNombre ?? '',
                maquinaNombre:   maquina.nombre          ?? '',
                fecha:           v.fecha,
                contadorTotal:   v.contadorTotal,
                contadorAnterior,
                serviciosPeriodo,
                observaciones:   v.observaciones,
                expendios,
              })
            }

            return (
              <div
                key={v.id}
                className="rounded-3"
                style={{
                  background: 'var(--bg-secondary)',
                  border: `1px solid ${estado === 'confirm-delete' ? 'var(--danger-color)' : 'var(--border-color)'}`,
                  transition: 'border-color 0.15s',
                  overflow: 'hidden',
                }}
              >
                {estado === 'confirm-delete' ? (
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
                  <div className="p-3">
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex align-items-center gap-2">
                          <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>{formatFecha(v.fecha)}</p>
                          {v.tecnico === 'remoto' && (
                            <span
                              className="badge"
                              style={{ background: 'rgba(var(--primary-color-rgb, 99,102,241),0.12)', color: 'var(--primary-color)', fontSize: '0.65rem', fontWeight: 500, borderRadius: '0.35rem', padding: '0.15rem 0.4rem' }}
                            >
                              a distancia
                            </span>
                          )}
                        </div>
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
                            onClick={handleDescargarRendicion}
                            style={{ color: 'var(--success-color)', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.4rem', padding: '0.2rem 0.4rem' }}
                            title="Descargar rendición PDF"
                          >
                            <BsFileEarmarkArrowDown size={12} />
                          </button>
                          <Link
                            to={`/admin/visitas/${v.id}/editar?cliente=${clienteId}&maquina=${maquinaId}`}
                            className="btn btn-sm"
                            style={{ color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.4rem', padding: '0.2rem 0.4rem' }}
                            title="Editar visita"
                          >
                            <BsPencil size={12} />
                          </Link>
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
