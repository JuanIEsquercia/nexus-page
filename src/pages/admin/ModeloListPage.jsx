import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { addBebidasFaltantes } from '../../lib/seed'
import { BsPencil, BsTrash, BsPlus, BsArrowRepeat } from 'react-icons/bs'

export default function ModeloListPage() {
  const [modelos, setModelos] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState(null)

  useEffect(() => {
    getDocs(query(collection(db, 'modelos'), orderBy('nombre'))).then((snap) => {
      setModelos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg(null)
    const result = await addBebidasFaltantes()
    setSyncMsg(result.msg)
    setSyncing(false)
  }

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'modelos', id))
    setConfirmDelete(null)
    setModelos((prev) => prev.filter((m) => m.id !== id))
  }

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
    </div>
  )

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>Modelos de máquina</h5>
        <Link
          to="/admin/modelos/nuevo"
          className="btn btn-theme-primary btn-sm d-flex align-items-center gap-1"
        >
          <BsPlus size={16} /> Nuevo modelo
        </Link>
      </div>

      <div className="d-flex align-items-center gap-2 mb-3">
        <button
          className="btn btn-sm d-flex align-items-center gap-1"
          onClick={handleSync}
          disabled={syncing}
          style={{ color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.5rem', fontSize: '0.75rem' }}
        >
          <BsArrowRepeat size={13} /> {syncing ? 'Sincronizando...' : 'Sincronizar bebidas'}
        </button>
        {syncMsg && <span className="small" style={{ color: 'var(--text-secondary)' }}>{syncMsg}</span>}
      </div>

      {modelos.length === 0 ? (
        <div className="p-4 rounded-3 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>No hay modelos cargados aún.</p>
          <Link to="/admin/modelos/nuevo" className="btn btn-theme-primary btn-sm">Crear primer modelo</Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {modelos.map((modelo) => {
            const cantBebidas = (modelo.bebidas ?? []).length
            return (
              <div
                key={modelo.id}
                className="p-3 rounded-3 d-flex align-items-center justify-content-between gap-2"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              >
                <div>
                  <p className="mb-0 fw-semibold small" style={{ color: 'var(--text-primary)' }}>{modelo.nombre}</p>
                  <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {cantBebidas} bebida{cantBebidas !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  {confirmDelete === modelo.id ? (
                    <>
                      <span className="small" style={{ color: 'var(--text-secondary)' }}>¿Eliminar?</span>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleDelete(modelo.id)}
                        style={{ color: 'var(--danger-color)', background: 'transparent', border: '1px solid var(--danger-color)', borderRadius: '0.4rem', fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}
                      >
                        Sí
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => setConfirmDelete(null)}
                        style={{ color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.4rem', fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to={`/admin/modelos/${modelo.id}/editar`}
                        style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}
                      >
                        <BsPencil size={14} />
                      </Link>
                      <button
                        className="btn btn-sm"
                        onClick={() => setConfirmDelete(modelo.id)}
                        style={{ color: 'var(--danger-color)', background: 'transparent', border: 'none', padding: '0.25rem' }}
                      >
                        <BsTrash size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
