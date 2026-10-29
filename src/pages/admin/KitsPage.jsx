import { useEffect, useState, useMemo } from 'react'
import { collection, getDocs, addDoc, doc, updateDoc, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { BsPlus, BsBoxSeam, BsPeopleFill, BsCashCoin } from 'react-icons/bs'

const KIT_BASE = [
  { key: 'cafe',         label: 'Café',         cantidad: 1 },
  { key: 'chocolate',    label: 'Chocolate',    cantidad: 2 },
  { key: 'leche',        label: 'Leches',       cantidad: 4 },
  { key: 'vasos',        label: 'Vasos',        cantidad: 350 },
  { key: 'revolvedores', label: 'Revolvedores', cantidad: 350 },
]

function formatMonto(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0)
}

export default function KitsPage() {
  const [clientes, setClientes] = useState([])
  const [insumos, setInsumos]   = useState([])
  const [kits, setKits]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null) // { clienteId }
  const [saving, setSaving]     = useState(false)

  const cargar = async () => {
    const [cliSnap, insSnap] = await Promise.all([
      getDocs(query(collection(db, 'clientes'), orderBy('razonSocial'))),
      getDocs(query(collection(db, 'insumos'), orderBy('nombre'))),
    ])
    const clis = cliSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    const conMaq = await Promise.all(clis.map(async (c) => {
      const maqSnap = await getDocs(collection(db, 'clientes', c.id, 'maquinas'))
      return { ...c, cantMaquinas: maqSnap.size }
    }))
    setClientes(conMaq)
    setInsumos(insSnap.docs.map((d) => ({ id: d.id, ...d.data() })))

    // Cargar kits activos de todos los clientes
    const allKits = []
    for (const c of conMaq) {
      const kitSnap = await getDocs(collection(db, 'clientes', c.id, 'kitsAsignados'))
      kitSnap.docs.forEach((d) => allKits.push({ id: d.id, clienteId: c.id, clienteNombre: c.razonSocial, ...d.data() }))
    }
    setKits(allKits)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const insumosPorKey = useMemo(() => {
    const map = {}
    insumos.forEach((i) => {
      const n = (i.nombre || '').toLowerCase()
      if (n.includes('café') || n.includes('cafe')) map.cafe = i
      if (n.includes('chocolate')) map.chocolate = i
      if (n.includes('leche')) map.leche = i
      if (n.includes('vaso')) map.vasos = i
      if (n.includes('revolvedor') || n.includes('palito') || n.includes('mezclador')) map.revolvedores = i
    })
    return map
  }, [insumos])

  const abrirAsignar = (clienteId) => setModal({ clienteId })

  const asignarKit = async (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId)
    if (!cliente) return
    setSaving(true)
    try {
      const kitsCount = cliente.cantMaquinas || 1
      const items = KIT_BASE.map((base) => {
        const ins = insumosPorKey[base.key]
        const cant = base.cantidad * kitsCount
        return {
          insumoId: ins?.id ?? null,
          nombre: ins?.nombre ?? base.label,
          unidad: ins?.unidad ?? '',
          cantidadAsignada: cant,
          cantidadConsumida: 0,
          costoUnitario: ins?.costoUnitario ?? 0,
        }
      })

      await addDoc(collection(db, 'clientes', clienteId, 'kitsAsignados'), {
        periodo: new Date().toISOString().slice(0, 7),
        modoServicio: cliente.modoServicio ?? 'presencial',
        items,
        estado: 'activo',
        createdAt: serverTimestamp(),
      })
      setModal(null)
      cargar()
    } finally {
      setSaving(false)
    }
  }

  const registrarConsumo = async (kit, itemIndex, cantidad) => {
    const newItems = kit.items.map((it, i) => i === itemIndex ? { ...it, cantidadConsumida: (it.cantidadConsumida || 0) + cantidad } : it)
    await updateDoc(doc(db, 'clientes', kit.clienteId, 'kitsAsignados', kit.id), { items: newItems })
    cargar()
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border spinner-border-sm" /></div>

  const kitsActivos = kits.filter((k) => k.estado === 'activo')

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h5 className="mb-1" style={{ color: 'var(--text-primary)' }}>Kits asignados</h5>
          <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Asigná kits por cliente. El remanente no es costo: mejora el margen.</p>
        </div>
      </div>

      {/* Clientes sin kit activo */}
      <div className="mb-4">
        <p className="small fw-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Asignar nuevo kit</p>
        <div className="d-flex flex-wrap gap-2">
          {clientes.filter((c) => c.cantMaquinas > 0).map((c) => (
            <button key={c.id} className="btn btn-sm btn-theme-secondary" onClick={() => abrirAsignar(c.id)}>
              {c.razonSocial} <span className="opacity-75">({c.modoServicio ?? 'presencial'})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Kits activos */}
      {kitsActivos.length === 0 ? (
        <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
          <BsBoxSeam size={32} className="mb-2 opacity-50" />
          <p className="mb-0 small">No hay kits activos. Asigná el primero.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {kitsActivos.map((kit) => {
            const costoAsignado = kit.items.reduce((s, it) => s + (it.cantidadAsignada * (it.costoUnitario || 0)), 0)
            const costoReal = kit.items.reduce((s, it) => s + ((it.cantidadConsumida || 0) * (it.costoUnitario || 0)), 0)
            const remanenteCosto = costoAsignado - costoReal
            return (
              <div key={kit.id} className="rounded-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div className="px-3 py-2 d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{kit.clienteNombre}</span>
                    <span className="small ms-2" style={{ color: 'var(--text-secondary)' }}>· {kit.modoServicio} · {kit.periodo}</span>
                  </div>
                  <div className="text-end small">
                    <div>Costo asignado: <strong>{formatMonto(costoAsignado)}</strong></div>
                    <div>Costo real consumido: <strong style={{ color: 'var(--primary-color)' }}>{formatMonto(costoReal)}</strong></div>
                    <div style={{ color: 'var(--success-color)' }}>Remanente (margen): {formatMonto(remanenteCosto)}</div>
                  </div>
                </div>
                <div className="p-3">
                  {kit.items.map((it, idx) => {
                    const rem = (it.cantidadAsignada || 0) - (it.cantidadConsumida || 0)
                    return (
                      <div key={idx} className="d-flex align-items-center justify-content-between py-1 small">
                        <span>{it.nombre}</span>
                        <span>
                          {it.cantidadConsumida || 0} / {it.cantidadAsignada} {it.unidad}
                          <span className="ms-2" style={{ color: 'var(--success-color)' }}>(remanente {rem})</span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal asignar */}
      {modal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="p-4 rounded-3" style={{ background: 'var(--bg-secondary)', maxWidth: 400 }}>
            <h6>Asignar kit estándar</h6>
            <p className="small" style={{ color: 'var(--text-secondary)' }}>
              Se creará un kit con la receta base multiplicada por la cantidad de máquinas del cliente. Los costos se toman de los precios actuales de compra.
            </p>
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-theme-primary" disabled={saving} onClick={() => asignarKit(modal.clienteId)}>
                {saving ? 'Asignando...' : 'Asignar'}
              </button>
              <button className="btn btn-theme-secondary" onClick={() => setModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
