import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { BsBarChartFill, BsInfoCircle, BsDownload } from 'react-icons/bs'

// ── Constantes ────────────────────────────────────────
const FACTOR_REMANENTE = 0.875 // 12.5% de remanente fijo

// Unidades continuas (peso/volumen) → aplica corrección de remanente
const UNIDADES_CONTINUAS = new Set(['kg', 'g', 'litros', 'ml'])

function aplicaRemanente(unidad) {
  return UNIDADES_CONTINUAS.has((unidad ?? '').toLowerCase())
}

// ── Formateo de tasa ──────────────────────────────────
function formatTasa(tasa, unidad) {
  if (tasa === null || tasa === undefined) return '—'
  const u = (unidad ?? '').toLowerCase()
  if (u === 'kg' && tasa < 0.1)     return `${(tasa * 1000).toFixed(2)} g/serv`
  if (u === 'litros' && tasa < 0.1) return `${(tasa * 1000).toFixed(2)} ml/serv`
  return `${tasa.toFixed(5)} ${unidad}/serv`
}

function formatCantidad(n, decimales = 3) {
  return Number(n).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  })
}

// ── Lógica de cálculo (enfoque histórico global) ──────
//
// CAMBIO CLAVE respecto a la versión anterior:
//  1. Servicios totales = contador última visita − contador primera visita
//     por máquina. Ya no sumamos tramo a tramo, lo que dejaba fuera la
//     última visita de cada máquina.
//  2. Insumos = se suman de TODAS las visitas (incluyendo la última).
//     Antes se saltaba la última porque no tenía "siguiente", lo que
//     causaba que los insumos aparecieran de forma parcial.
//  3. Tasa por servicio = totalEfectivo / totalServicios globales del
//     cliente (suma de todas las máquinas).
//
async function calcularAnalytics(clienteId) {
  const maqSnap = await getDocs(
    collection(db, 'clientes', clienteId, 'maquinas')
  )
  const maquinas = maqSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  const mapa = {}           // nombre → acumulador por insumo
  let totalServicios = 0    // servicios totales (primera → última de cada maquina)
  let totalVisitas   = 0    // visitas procesadas (para el KPI de contexto)
  let maquinasConDatos = 0  // maquinas con al menos 1 visita

  for (const maq of maquinas) {
    const visitasSnap = await getDocs(
      query(
        collection(db, 'clientes', clienteId, 'maquinas', maq.id, 'visitas'),
        orderBy('fecha', 'asc'),
      )
    )
    const visitas = visitasSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    if (visitas.length === 0) continue

    maquinasConDatos++
    totalVisitas += visitas.length

    // Servicios globales de esta máquina: primera → última visita
    const cPrimera = visitas[0].contadorTotal ?? null
    const cUltima  = visitas[visitas.length - 1].contadorTotal ?? null
    const serviciosMaquina =
      cPrimera != null && cUltima != null && cUltima > cPrimera
        ? cUltima - cPrimera
        : 0
    totalServicios += serviciosMaquina

    // Sumar insumos de TODAS las visitas (incluida la última)
    for (const visita of visitas) {
      const insumosSnap = await getDocs(
        collection(
          db,
          'clientes', clienteId,
          'maquinas', maq.id,
          'visitas',  visita.id,
          'insumos'
        )
      )
      const insumos = insumosSnap.docs.map((d) => d.data())
      if (insumos.length === 0) continue

      for (const ins of insumos) {
        const key = ins.nombre
        if (!mapa[key]) {
          mapa[key] = {
            nombre:           ins.nombre,
            unidad:           ins.unidad,
            conRemanente:     aplicaRemanente(ins.unidad),
            totalCargado:     0,
            totalEfectivo:    0,
            cantidadPeriodos: 0,
          }
        }
        const factor = mapa[key].conRemanente ? FACTOR_REMANENTE : 1
        mapa[key].totalCargado     += ins.cantidad
        mapa[key].totalEfectivo    += ins.cantidad * factor
        mapa[key].cantidadPeriodos += 1
      }
    }
  }

  // Tasa por servicio usa el total global de servicios del cliente
  const filas = Object.values(mapa)
    .map((item) => ({
      ...item,
      tasaPorServicio: totalServicios > 0
        ? item.totalEfectivo / totalServicios
        : null,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  return {
    filas,
    totalServicios,
    totalVisitas,
    maquinasConDatos,
    // Retrocompatibilidad con los KPI cards del render
    totalPares:        totalVisitas,
    paresConInsumos:   filas.filter((f) => f.cantidadPeriodos > 0).length,
    totalServiciosTodos: totalServicios,
  }
}

// ── Export CSV global ─────────────────────────────────
async function exportarTodoCSV(setLoading) {
  setLoading(true)
  try {
    const clientesSnap = await getDocs(
      query(collection(db, 'clientes'), orderBy('razonSocial'))
    )
    const clientes = clientesSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    const filas = []

    for (const cliente of clientes) {
      const maqSnap = await getDocs(
        collection(db, 'clientes', cliente.id, 'maquinas')
      )
      const maquinas = maqSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

      for (const maq of maquinas) {
        const visitasSnap = await getDocs(
          query(
            collection(db, 'clientes', cliente.id, 'maquinas', maq.id, 'visitas'),
            orderBy('fecha', 'asc')
          )
        )
        const visitas = visitasSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

        for (const visita of visitas) {
          const fecha = visita.fecha?.toDate
            ? visita.fecha.toDate().toLocaleDateString('es-AR', {
                timeZone: 'America/Argentina/Buenos_Aires',
                day:   '2-digit',
                month: '2-digit',
                year:  'numeric',
              })
            : ''

          const insumosSnap = await getDocs(
            collection(
              db,
              'clientes', cliente.id,
              'maquinas', maq.id,
              'visitas',  visita.id,
              'insumos'
            )
          )
          const insumos = insumosSnap.docs.map((d) => d.data())

          if (insumos.length === 0) {
            filas.push([
              fecha,
              cliente.razonSocial ?? '',
              maq.nombre ?? maq.id,
              visita.contadorTotal ?? '',
              '', '', '',
            ])
          } else {
            for (const ins of insumos) {
              filas.push([
                fecha,
                cliente.razonSocial ?? '',
                maq.nombre ?? maq.id,
                visita.contadorTotal ?? '',
                ins.nombre ?? '',
                ins.cantidad ?? '',
                ins.unidad  ?? '',
              ])
            }
          }
        }
      }
    }

    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
    const headers = ['Fecha', 'Cliente', 'Máquina', 'Contador Total', 'Insumo', 'Cantidad', 'Unidad']
    const csv = [
      headers.map(esc).join(','),
      ...filas.map((row) => row.map(esc).join(',')),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `visitas_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } finally {
    setLoading(false)
  }
}

// ── Estilos compartidos ───────────────────────────────
const selectStyle = {
  background:   'var(--bg-primary)',
  color:        'var(--text-primary)',
  border:       '1px solid var(--border-color)',
  borderRadius: '0.5rem',
}

const thStyle = {
  padding:      '0.6rem 0.85rem',
  fontSize:     '0.72rem',
  fontWeight:   600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color:        'var(--text-secondary)',
  whiteSpace:   'nowrap',
  borderBottom: '1px solid var(--border-color)',
  background:   'var(--bg-primary)',
}

const tdStyle = {
  padding:      '0.65rem 0.85rem',
  fontSize:     '0.82rem',
  color:        'var(--text-primary)',
  borderBottom: '1px solid var(--border-color)',
  verticalAlign: 'middle',
}

// ── Componente ────────────────────────────────────────
export default function AnalyticsPage() {
  const [clientes,         setClientes]         = useState([])
  const [clienteId,        setClienteId]        = useState('')
  const [resultado,        setResultado]        = useState(null)
  const [loadingClientes,  setLoadingClientes]  = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [loadingExport,    setLoadingExport]    = useState(false)
  const [error,            setError]            = useState(null)

  useEffect(() => {
    getDocs(query(collection(db, 'clientes'), orderBy('razonSocial')))
      .then((snap) => setClientes(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingClientes(false))
  }, [])

  const handleClienteChange = async (id) => {
    setClienteId(id)
    setResultado(null)
    setError(null)
    if (!id) return
    setLoadingAnalytics(true)
    try {
      const res = await calcularAnalytics(id)
      setResultado(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const clienteNombre = clientes.find((c) => c.id === clienteId)?.razonSocial

  return (
    <div>

      {/* Header */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <h5 className="mb-1" style={{ color: 'var(--text-primary)' }}>
            Analytics · Consumo de insumos
          </h5>
          <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
            Tasa de consumo por insumo y cliente
          </p>
        </div>
        <button
          className="btn btn-sm"
          style={{
            background:   'var(--bg-secondary)',
            border:       '1px solid var(--border-color)',
            color:        'var(--text-primary)',
            borderRadius: '0.5rem',
            display:      'flex',
            alignItems:   'center',
            gap:          '0.4rem',
            fontSize:     '0.8rem',
            flexShrink:   0,
          }}
          onClick={() => exportarTodoCSV(setLoadingExport)}
          disabled={loadingExport}
        >
          {loadingExport
            ? <span className="spinner-border spinner-border-sm" />
            : <BsDownload size={14} />
          }
          {loadingExport ? 'Exportando…' : 'Exportar visitas CSV'}
        </button>
      </div>

      {/* Selector de cliente */}
      <div className="mb-4" style={{ maxWidth: 360 }}>
        <label className="form-label small fw-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
          Cliente
        </label>
        <select
          className="form-select form-select-sm"
          value={clienteId}
          onChange={(e) => handleClienteChange(e.target.value)}
          disabled={loadingClientes}
          style={selectStyle}
        >
          <option value="">— Elegí un cliente —</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.razonSocial}</option>
          ))}
        </select>
      </div>

      {/* Loading analytics */}
      {loadingAnalytics && (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
          <p className="mt-2 small" style={{ color: 'var(--text-secondary)' }}>
            Calculando consumos...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loadingAnalytics && (
        <div
          className="p-3 rounded-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger-color)' }}
        >
          <p className="mb-0 small" style={{ color: 'var(--danger-color)' }}>
            Error: {error}
          </p>
        </div>
      )}

      {/* Resultado */}
      {resultado && !loadingAnalytics && (
        <>
          {/* KPIs resumen */}
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <div
              className="rounded-3 px-3 py-2"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', minWidth: 140 }}
            >
              <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Servicios totales</p>
              <p className="mb-0 fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1.4rem', lineHeight: 1.2 }}>
                {resultado.totalServicios.toLocaleString('es-AR')}
              </p>
              <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                {resultado.maquinasConDatos} máquina{resultado.maquinasConDatos !== 1 ? 's' : ''} · {resultado.totalVisitas} visitas
              </p>
            </div>
            <div
              className="rounded-3 px-3 py-2"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', minWidth: 140 }}
            >
              <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Insumos distintos</p>
              <p className="mb-0 fw-bold" style={{ color: 'var(--text-primary)', fontSize: '1.4rem', lineHeight: 1.2 }}>
                {resultado.filas.length}
              </p>
              <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                con registros de carga
              </p>
            </div>
          </div>

          {/* Sin datos */}
          {resultado.filas.length === 0 ? (
            <div
              className="text-center py-5 rounded-3"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              <BsBarChartFill size={28} className="mb-2 opacity-25" style={{ color: 'var(--text-secondary)' }} />
              <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
                {clienteNombre} no tiene insumos cargados para analizar.
              </p>
            </div>
          ) : (
            <>
              {/* Tabla */}
              <div
                className="rounded-3 mb-3"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', overflow: 'hidden' }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Insumo</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Total cargado</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Consumo efectivo</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Cargas</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Tasa / servicio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.filas.map((fila, idx) => (
                        <tr
                          key={fila.nombre}
                          style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(14,165,233,0.02)' }}
                        >
                          <td style={tdStyle}>
                            <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                              {fila.nombre}
                            </span>
                            {!fila.conRemanente && (
                              <span
                                className="ms-2 badge"
                                style={{ background: 'rgba(14,165,233,0.12)', color: 'var(--primary-color)', fontSize: '0.65rem', fontWeight: 500 }}
                              >
                                sin remanente
                              </span>
                            )}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-secondary)' }}>
                            {formatCantidad(fila.totalCargado)} {fila.unidad}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right' }}>
                            {formatCantidad(fila.totalEfectivo)} {fila.unidad}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-secondary)' }}>
                            {fila.cantidadPeriodos}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right' }}>
                            <span className="fw-semibold" style={{ color: 'var(--primary-color)' }}>
                              {formatTasa(fila.tasaPorServicio, fila.unidad)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Nota metodológica */}
              <div
                className="p-3 rounded-3 d-flex align-items-start gap-2"
                style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}
              >
                <BsInfoCircle size={13} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: 2 }} />
                <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Metodología:</strong>{' '}
                  Los servicios totales se calculan como la diferencia entre el contador de la primera y la última visita de cada máquina.
                  Los insumos se suman de <em>todas</em> las visitas registradas, incluyendo la más reciente.
                  El consumo efectivo aplica un remanente fijo del 12,5% a insumos en unidades continuas (kg, g, litros, ml).
                  Los insumos en unidades discretas (cajas, bolsas, sobres) no tienen corrección de remanente.
                  La tasa por servicio es el consumo efectivo acumulado dividido sobre el total de servicios del cliente.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
