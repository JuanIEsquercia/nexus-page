import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  collection, getDocs, deleteDoc, doc,
  orderBy, query, limit, startAfter,
} from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { generarPresupuestoPDF, generarRemitoPDF } from '../../lib/pdf'
import {
  BsPlus, BsDownload, BsTrash,
  BsFileEarmarkRichtext, BsFileEarmarkCheck,
} from 'react-icons/bs'

const PAGE = 10

const formatPesos = (v) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v ?? 0)

// ── Estado por colección ─────────────────────────────
function useDocList(colName) {
  const [items, setItems]         = useState([])
  const [lastDoc, setLastDoc]     = useState(null)
  const [hasMore, setHasMore]     = useState(false)
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    const snap = await getDocs(
      query(collection(db, colName), orderBy('createdAt', 'desc'), limit(PAGE))
    )
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    setItems(docs)
    setLastDoc(snap.docs[snap.docs.length - 1] ?? null)
    setHasMore(snap.docs.length === PAGE)
    setLoading(false)
  }, [colName])

  useEffect(() => { cargar() }, [cargar])

  const cargarMas = async () => {
    if (!lastDoc) return
    setLoadingMore(true)
    const snap = await getDocs(
      query(collection(db, colName), orderBy('createdAt', 'desc'), limit(PAGE), startAfter(lastDoc))
    )
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    setItems((prev) => [...prev, ...docs])
    setLastDoc(snap.docs[snap.docs.length - 1] ?? null)
    setHasMore(snap.docs.length === PAGE)
    setLoadingMore(false)
  }

  const eliminar = async (id) => {
    await deleteDoc(doc(db, colName, id))
    setItems((prev) => prev.filter((x) => x.id !== id))
  }

  return { items, loading, loadingMore, hasMore, cargarMas, eliminar }
}

// ── Componente principal ─────────────────────────────
export default function DocumentosPage() {
  const [tab, setTab] = useState('presupuestos')

  const pre = useDocList('presupuestos')
  const rem = useDocList('remitos')

  const [descargando, setDescargando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // { id, col }

  const reDescargarPresupuesto = (p) => {
    setDescargando(p.id)
    try { generarPresupuestoPDF(p) } finally { setDescargando(null) }
  }

  const reDescargarRemito = (r) => {
    setDescargando(r.id)
    try { generarRemitoPDF(r) } finally { setDescargando(null) }
  }

  const pedirConfirm = (id, col) => setConfirmDelete({ id, col })

  const handleEliminar = async () => {
    if (!confirmDelete) return
    const { id, col } = confirmDelete
    if (col === 'presupuestos') await pre.eliminar(id)
    else await rem.eliminar(id)
    setConfirmDelete(null)
  }

  const tabs = [
    { key: 'presupuestos', label: 'Presupuestos', icon: BsFileEarmarkRichtext, count: pre.items.length },
    { key: 'remitos',      label: 'Remitos',      icon: BsFileEarmarkCheck,    count: rem.items.length },
  ]

  const active = tab === 'presupuestos' ? pre : rem

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>Documentos</h5>
        <div className="d-flex gap-2">
          <Link
            to="/admin/documentos/presupuesto/nuevo"
            className="btn btn-sm btn-theme-secondary d-flex align-items-center gap-1"
          >
            <BsPlus size={16} /> Presupuesto
          </Link>
          <Link
            to="/admin/documentos/remito/nuevo"
            className="btn btn-sm btn-theme-primary d-flex align-items-center gap-1"
          >
            <BsPlus size={16} /> Remito
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-1 mb-3">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="btn btn-sm d-flex align-items-center gap-2"
            style={{
              background:   tab === key ? 'var(--primary-gradient)' : 'var(--bg-secondary)',
              color:        tab === key ? '#fff' : 'var(--text-secondary)',
              border:       `1px solid ${tab === key ? 'transparent' : 'var(--border-color)'}`,
              borderRadius: '0.6rem',
              fontWeight:   tab === key ? 600 : 400,
            }}
          >
            <Icon size={14} />
            {label}
            <span
              className="rounded-pill px-2"
              style={{
                background: tab === key ? 'rgba(255,255,255,0.25)' : 'var(--bg-accent)',
                color:      tab === key ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.7rem',
              }}
            >
              {count}{active.hasMore ? '+' : ''}
            </span>
          </button>
        ))}
      </div>

      {/* Confirm delete inline banner */}
      {confirmDelete && (
        <div className="d-flex align-items-center justify-content-between gap-2 p-3 rounded-3 mb-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger-color)' }}>
          <p className="mb-0 small" style={{ color: 'var(--danger-color)' }}>
            ¿Eliminar este documento? Esta acción no se puede deshacer.
          </p>
          <div className="d-flex gap-2 flex-shrink-0">
            <button
              className="btn btn-sm"
              onClick={() => setConfirmDelete(null)}
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              Cancelar
            </button>
            <button
              className="btn btn-sm"
              onClick={handleEliminar}
              style={{ color: '#fff', background: 'var(--danger-color)', border: 'none' }}
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {active.loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
        </div>
      ) : tab === 'presupuestos' ? (
        pre.items.length === 0 ? (
          <EmptyState
            icon={BsFileEarmarkRichtext}
            texto="No hay presupuestos aún."
            link="/admin/documentos/presupuesto/nuevo"
            linkLabel="Crear presupuesto"
          />
        ) : (
          <Lista>
            {pre.items.map((p) => (
              <DocRow
                key={p.id}
                titulo={p.titulo}
                subtitulo={`${p.clienteNombre} · ${p.numero}`}
                meta={[
                  p.fechaEmision ? new Date(p.fechaEmision + 'T12:00:00').toLocaleDateString('es-AR') : '',
                  p.total > 0 ? formatPesos(p.total) : '',
                ].filter(Boolean).join(' · ')}
                metaColor={p.total > 0 ? 'var(--success-color)' : undefined}
                onPdf={() => reDescargarPresupuesto(p)}
                onDelete={() => pedirConfirm(p.id, 'presupuestos')}
                pdfDisabled={descargando === p.id}
                deleting={confirmDelete?.id === p.id}
              />
            ))}
          </Lista>
        )
      ) : (
        rem.items.length === 0 ? (
          <EmptyState
            icon={BsFileEarmarkCheck}
            texto="No hay remitos aún."
            link="/admin/documentos/remito/nuevo"
            linkLabel="Crear remito"
          />
        ) : (
          <Lista>
            {rem.items.map((r) => (
              <DocRow
                key={r.id}
                titulo={r.clienteNombre}
                subtitulo={r.numero}
                meta={[
                  r.fechaEmision ? new Date(r.fechaEmision + 'T12:00:00').toLocaleDateString('es-AR') : '',
                  r.items?.length > 0 ? `${r.items.length} ítem${r.items.length > 1 ? 's' : ''}` : '',
                ].filter(Boolean).join(' · ')}
                onPdf={() => reDescargarRemito(r)}
                onDelete={() => pedirConfirm(r.id, 'remitos')}
                pdfDisabled={descargando === r.id}
                deleting={confirmDelete?.id === r.id}
              />
            ))}
          </Lista>
        )
      )}

      {/* Cargar más */}
      {!active.loading && active.hasMore && (
        <div className="text-center mt-3">
          <button
            className="btn btn-sm"
            onClick={tab === 'presupuestos' ? pre.cargarMas : rem.cargarMas}
            disabled={active.loadingMore}
            style={{ color: 'var(--primary-color)', background: 'transparent', border: '1px solid var(--primary-color)', borderRadius: '0.5rem' }}
          >
            {active.loadingMore ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Sub-componentes ──────────────────────────────────

function Lista({ children }) {
  return <div className="d-flex flex-column gap-2">{children}</div>
}

function DocRow({ titulo, subtitulo, meta, metaColor, onPdf, onDelete, pdfDisabled, deleting }) {
  return (
    <div
      className="p-3 rounded-3 d-flex align-items-center justify-content-between gap-2 flex-wrap"
      style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${deleting ? 'var(--danger-color)' : 'var(--border-color)'}`,
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p className="mb-0 fw-semibold text-truncate" style={{ color: 'var(--text-primary)' }}>{titulo}</p>
        <p className="mb-0 small text-truncate" style={{ color: 'var(--text-secondary)' }}>{subtitulo}</p>
        {meta && (
          <p className="mb-0 small" style={{ color: metaColor ?? 'var(--text-secondary)' }}>{meta}</p>
        )}
      </div>
      <div className="d-flex gap-2 flex-shrink-0">
        <button
          className="btn btn-sm d-flex align-items-center gap-1"
          onClick={onPdf}
          disabled={pdfDisabled}
          style={{ color: 'var(--primary-color)', background: 'transparent', border: '1px solid var(--primary-color)', borderRadius: '0.5rem' }}
        >
          <BsDownload size={13} /> PDF
        </button>
        <button
          className="btn btn-sm d-flex align-items-center"
          onClick={onDelete}
          style={{ color: 'var(--danger-color)', background: 'transparent', border: '1px solid var(--danger-color)', borderRadius: '0.5rem' }}
        >
          <BsTrash size={13} />
        </button>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, texto, link, linkLabel }) {
  return (
    <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
      <Icon size={32} className="mb-2 opacity-50" />
      <p className="mb-3 small">{texto}</p>
      <Link to={link} className="btn btn-sm btn-theme-primary">{linkLabel}</Link>
    </div>
  )
}
