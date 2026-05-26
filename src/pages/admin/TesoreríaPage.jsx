import { useEffect, useState } from 'react'
import {
  collection, getDocs, addDoc, updateDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import {
  BsPlus, BsWallet2, BsPeopleFill, BsToggleOn, BsToggleOff,
} from 'react-icons/bs'

function SeccionLista({ titulo, icon: Icon, color, items, onToggle, onAdd, placeholder }) {
  const [nombre, setNombre] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    const val = nombre.trim()
    if (!val) return
    setSaving(true)
    await onAdd(val)
    setNombre('')
    setSaving(false)
  }

  const activos = items.filter(i => i.activo).length

  const inputStyle = {
    flex: 1,
    background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
    borderRadius: '0.5rem', color: 'var(--text-primary)',
    padding: '0.45rem 0.75rem', fontSize: '0.875rem', outline: 'none',
  }

  return (
    <div
      className="rounded-3 mb-4"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', overflow: 'hidden' }}
    >
      <div
        className="px-4 py-3 d-flex align-items-center gap-2"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <Icon size={16} style={{ color }} />
        <span className="fw-semibold" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
          {titulo}
        </span>
        <span
          className="ms-auto"
          style={{
            background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
            borderRadius: '2rem', padding: '0.1rem 0.55rem',
            fontSize: '0.7rem', color: 'var(--text-secondary)',
          }}
        >
          {activos} activo{activos !== 1 ? 's' : ''}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-3" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Sin registros aún.
        </div>
      ) : (
        items.map(item => (
          <div
            key={item.id}
            className="px-4 py-2 d-flex align-items-center gap-3"
            style={{
              borderBottom: '1px solid var(--border-color)',
              opacity: item.activo ? 1 : 0.5,
              transition: 'opacity 0.15s',
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-2"
              style={{
                width: 32, height: 32, flexShrink: 0,
                background: item.activo ? `${color}18` : 'var(--bg-primary)',
              }}
            >
              <Icon size={14} style={{ color: item.activo ? color : 'var(--text-secondary)' }} />
            </div>

            <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
              {item.nombre}
            </span>

            {!item.activo && (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Inactivo</span>
            )}

            <button
              onClick={() => onToggle(item.id, !item.activo)}
              title={item.activo ? 'Desactivar' : 'Activar'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.25rem', color: item.activo ? color : 'var(--text-secondary)',
                lineHeight: 1,
              }}
            >
              {item.activo ? <BsToggleOn size={24} /> : <BsToggleOff size={24} />}
            </button>
          </div>
        ))
      )}

      <div className="px-4 py-3 d-flex gap-2">
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
          placeholder={placeholder}
          style={inputStyle}
        />
        <button
          onClick={handleAdd}
          disabled={saving || !nombre.trim()}
          className="btn d-flex align-items-center gap-1"
          style={{
            background: 'var(--primary-gradient)', color: '#fff', border: 'none',
            borderRadius: '0.5rem', padding: '0.45rem 0.9rem',
            fontWeight: 600, fontSize: '0.82rem',
            opacity: saving || !nombre.trim() ? 0.5 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <BsPlus size={16} />
          Agregar
        </button>
      </div>
    </div>
  )
}

export default function TesoreríaPage() {
  const [cuentas, setCuentas] = useState([])
  const [socios, setSocios]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, 'cuentas')),
      getDocs(collection(db, 'socios')),
    ]).then(([cSnap, sSnap]) => {
      setCuentas(cSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setSocios(sSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    }).finally(() => setLoading(false))
  }, [])

  const addCuenta = async (nombre) => {
    const ref = await addDoc(collection(db, 'cuentas'), { nombre, activo: true, creadoEl: serverTimestamp() })
    setCuentas(cs => [...cs, { id: ref.id, nombre, activo: true }])
  }

  const toggleCuenta = async (id, activo) => {
    await updateDoc(doc(db, 'cuentas', id), { activo })
    setCuentas(cs => cs.map(c => c.id === id ? { ...c, activo } : c))
  }

  const addSocio = async (nombre) => {
    const ref = await addDoc(collection(db, 'socios'), { nombre, activo: true, creadoEl: serverTimestamp() })
    setSocios(ss => [...ss, { id: ref.id, nombre, activo: true }])
  }

  const toggleSocio = async (id, activo) => {
    await updateDoc(doc(db, 'socios', id), { activo })
    setSocios(ss => ss.map(s => s.id === id ? { ...s, activo } : s))
  }

  return (
    <div>
      <div className="mb-4">
        <h5 className="mb-1 fw-bold" style={{ color: 'var(--text-primary)' }}>Tesorería</h5>
        <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
          Cuentas de la empresa y socios
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
        </div>
      ) : (
        <>
          <SeccionLista
            titulo="Cuentas de la empresa"
            icon={BsWallet2}
            color="var(--primary-color)"
            items={cuentas}
            onToggle={toggleCuenta}
            onAdd={addCuenta}
            placeholder="Ej: MercadoPago, ICBC, Efectivo..."
          />
          <SeccionLista
            titulo="Socios"
            icon={BsPeopleFill}
            color="#a78bfa"
            items={socios}
            onToggle={toggleSocio}
            onAdd={addSocio}
            placeholder="Nombre del socio..."
          />
        </>
      )}
    </div>
  )
}
