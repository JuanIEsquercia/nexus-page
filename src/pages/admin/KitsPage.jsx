import { useEffect, useState, useMemo } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { BsBoxSeam, BsPeopleFill, BsCalendar3 } from 'react-icons/bs'

// Receta estándar por máquina / mes
const KIT_RECETA = [
  { key: 'cafe',      label: 'Café',         cantidad: 1,   unidad: 'bolsa' },
  { key: 'chocolate', label: 'Chocolate',    cantidad: 2,   unidad: 'bolsas' },
  { key: 'leche',     label: 'Leches',       cantidad: 4,   unidad: 'bolsas' },
  { key: 'vasos',     label: 'Vasos',        cantidad: 350, unidad: 'unidades' },
  { key: 'revolvedores', label: 'Revolvedores', cantidad: 350, unidad: 'unidades' },
]

function getPeriodoActual(diaCobro) {
  const hoy = new Date()
  const dia = Math.min(Math.max(Number(diaCobro) || 1, 1), 28) // evita problemas de meses cortos
  let inicio = new Date(hoy.getFullYear(), hoy.getMonth(), dia)
  if (hoy.getDate() < dia) {
    inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, dia)
  }
  const fin = new Date(inicio)
  fin.setMonth(fin.getMonth() + 1)
  fin.setDate(fin.getDate() - 1)
  return { inicio, fin }
}

function formatRango(inicio, fin) {
  const opts = { day: '2-digit', month: 'short' }
  return `${inicio.toLocaleDateString('es-AR', opts)} – ${fin.toLocaleDateString('es-AR', opts)}`
}

export default function KitsPage() {
  const [clientes, setClientes] = useState([])
  const [insumos, setInsumos]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      getDocs(query(collection(db, 'clientes'), orderBy('razonSocial'))),
      getDocs(query(collection(db, 'insumos'), orderBy('nombre'))),
    ]).then(async ([cliSnap, insSnap]) => {
      const clis = cliSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const conMaquinas = await Promise.all(
        clis.map(async (c) => {
          const maqSnap = await getDocs(collection(db, 'clientes', c.id, 'maquinas'))
          return { ...c, cantMaquinas: maqSnap.size }
        })
      )
      setClientes(conMaquinas.filter((c) => c.cantMaquinas > 0))
      setInsumos(insSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  const datos = useMemo(() => {
    const porCliente = clientes.map((c) => {
      const periodo = getPeriodoActual(c.diaCobro)
      const kits = c.cantMaquinas
      const items = KIT_RECETA.map((r) => ({
        ...r,
        total: r.cantidad * kits,
      }))
      return { ...c, periodo, kits, items }
    })

    const totales = KIT_RECETA.map((r) => ({
      ...r,
      total: porCliente.reduce((s, c) => s + c.kits * r.cantidad, 0),
    }))

    return { porCliente, totales }
  }, [clientes])

  // Matching simple de stock por nombre (aproximado)
  const stockMap = useMemo(() => {
    const map = {}
    insumos.forEach((i) => {
      const n = (i.nombre || '').toLowerCase()
      if (n.includes('café') || n.includes('cafe')) map.cafe = (map.cafe || 0) + (i.stockActual || 0)
      if (n.includes('chocolate')) map.chocolate = (map.chocolate || 0) + (i.stockActual || 0)
      if (n.includes('leche')) map.leche = (map.leche || 0) + (i.stockActual || 0)
      if (n.includes('vaso')) map.vasos = (map.vasos || 0) + (i.stockActual || 0)
      if (n.includes('revolvedor') || n.includes('palito') || n.includes('mezclador')) map.revolvedores = (map.revolvedores || 0) + (i.stockActual || 0)
    })
    return map
  }, [insumos])

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
      <p className="mt-2 small" style={{ color: 'var(--text-secondary)' }}>Cargando kits...</p>
    </div>
  )

  return (
    <div>
      <div className="mb-4">
        <h5 className="mb-1" style={{ color: 'var(--text-primary)' }}>Kits del mes</h5>
        <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
          Insumos a preparar según período de facturación y cantidad de máquinas
        </p>
      </div>

      {/* Totales globales */}
      <div className="rounded-3 p-3 mb-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <p className="small fw-semibold mb-2" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Total a tener este mes
        </p>
        <div className="d-flex flex-wrap gap-3">
          {datos.totales.map((t) => {
            const stock = stockMap[t.key] ?? 0
            const falta = Math.max(0, t.total - stock)
            return (
              <div key={t.key} className="rounded-3 px-3 py-2" style={{ background: 'var(--bg-primary)', minWidth: 140 }}>
                <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>{t.label}</p>
                <p className="mb-0 fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1.3rem' }}>
                  {t.total.toLocaleString('es-AR')}
                </p>
                <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                  Stock: {stock.toLocaleString('es-AR')} {falta > 0 && <span style={{ color: 'var(--danger-color)' }}>· falta {falta.toLocaleString('es-AR')}</span>}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Por cliente */}
      {datos.porCliente.length === 0 ? (
        <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
          <BsPeopleFill size={32} className="mb-2 opacity-50" />
          <p className="mb-0 small">No hay clientes con máquinas registradas.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {datos.porCliente.map((c) => (
            <div key={c.id} className="rounded-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div className="px-3 py-2 d-flex align-items-center justify-content-between" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                <div className="d-flex align-items-center gap-2">
                  <BsPeopleFill size={14} style={{ color: 'var(--primary-color)' }} />
                  <span className="fw-semibold small" style={{ color: 'var(--text-primary)' }}>{c.razonSocial}</span>
                  <span className="small" style={{ color: 'var(--text-secondary)' }}>· {c.cantMaquinas} máquina{c.cantMaquinas !== 1 ? 's' : ''}</span>
                </div>
                <div className="d-flex align-items-center gap-1 small" style={{ color: 'var(--text-secondary)' }}>
                  <BsCalendar3 size={12} />
                  {formatRango(c.periodo.inicio, c.periodo.fin)}
                </div>
              </div>
              <div className="px-3 py-2 d-flex flex-wrap gap-3">
                {c.items.map((it) => (
                  <div key={it.key} className="small">
                    <span style={{ color: 'var(--text-secondary)' }}>{it.label}:</span>{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>{it.total.toLocaleString('es-AR')}</strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
        <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Receta por máquina / mes:</strong> 1 café, 2 chocolate, 4 leches, 350 vasos, 350 revolvedores.
          El matching de stock es aproximado (busca por nombre). Ajustá los nombres de insumos para que coincidan mejor.
        </p>
      </div>
    </div>
  )
}
