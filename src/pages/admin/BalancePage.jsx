import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { formatFecha } from '../../lib/negocio'
import {
  BsGraphUp, BsFiletypeCsv, BsFiletypeJson,
  BsBuilding, BsCpu, BsExclamationTriangle,
} from 'react-icons/bs'

// ── Helpers de exportación ────────────────────────────

function descargarArchivo(nombre, contenido, tipo) {
  const blob = new Blob([contenido], { type: tipo })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}

function exportarCSV(filas) {
  const headers = ['Cliente', 'CUIT', 'Día cobro', 'Máquina', 'Modelo', 'Contador actual', 'Última visita', 'Servicios período']
  const escape  = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lineas  = [
    headers.map(escape).join(','),
    ...filas.map((f) => [
      f.clienteNombre, f.cuit, f.diaCobro, f.maquinaNombre, f.modelo,
      f.contadorActual ?? '', f.ultimaVisita, f.serviciosPeriodo ?? '',
    ].map(escape).join(',')),
  ]
  descargarArchivo(`nexus-balance-${fechaHoy()}.csv`, lineas.join('\n'), 'text/csv;charset=utf-8;')
}

function exportarJSON(datos) {
  descargarArchivo(
    `nexus-backup-${fechaHoy()}.json`,
    JSON.stringify(datos, null, 2),
    'application/json',
  )
}

function fechaHoy() {
  return new Date().toISOString().split('T')[0]
}

// ── Carga de datos ────────────────────────────────────

async function cargarDatos() {
  const [clientesSnap, insumosSnap] = await Promise.all([
    getDocs(query(collection(db, 'clientes'), orderBy('razonSocial'))),
    getDocs(query(collection(db, 'insumos'), orderBy('nombre'))),
  ])

  const clientes = clientesSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const insumos  = insumosSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  // Cargar máquinas y última visita de cada cliente en paralelo
  const clientesConMaquinas = await Promise.all(
    clientes.map(async (cliente) => {
      const maqSnap = await getDocs(
        query(collection(db, 'clientes', cliente.id, 'maquinas'), orderBy('nombre'))
      )
      const maquinas = await Promise.all(
        maqSnap.docs.map(async (maqDoc) => {
          const maq = { id: maqDoc.id, ...maqDoc.data() }
          // Última visita para serviciosPeriodo
          const visitasSnap = await getDocs(
            query(
              collection(db, 'clientes', cliente.id, 'maquinas', maq.id, 'visitas'),
              orderBy('fecha', 'desc'),
              limit(1),
            )
          )
          const ultimaVisita = visitasSnap.empty ? null : { id: visitasSnap.docs[0].id, ...visitasSnap.docs[0].data() }
          return { ...maq, ultimaVisita }
        })
      )
      return { ...cliente, maquinas }
    })
  )

  return { clientes: clientesConMaquinas, insumos }
}

// ── Componente ────────────────────────────────────────

export default function BalancePage() {
  const [datos, setDatos]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [exportando, setExportando] = useState(false)

  useEffect(() => {
    cargarDatos()
      .then(setDatos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
      <p className="mt-2 small" style={{ color: 'var(--text-secondary)' }}>Cargando datos...</p>
    </div>
  )

  if (error) return (
    <div className="p-3 rounded-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger-color)' }}>
      <p className="mb-0 small" style={{ color: 'var(--danger-color)' }}>Error al cargar: {error}</p>
    </div>
  )

  // Armar filas planas para CSV
  const filasCSV = []
  datos.clientes.forEach((c) => {
    c.maquinas.forEach((m) => {
      filasCSV.push({
        clienteNombre:    c.razonSocial,
        cuit:             c.cuit,
        diaCobro:         c.diaCobro,
        maquinaNombre:    m.nombre,
        modelo:           m.modelo ?? '',
        contadorActual:   m.contadorActual ?? '',
        ultimaVisita:     m.ultimaVisita ? formatFecha(m.ultimaVisita.fecha) : 'Sin visitas',
        serviciosPeriodo: m.ultimaVisita?.serviciosPeriodo ?? '',
      })
    })
    if (c.maquinas.length === 0) {
      filasCSV.push({
        clienteNombre: c.razonSocial, cuit: c.cuit, diaCobro: c.diaCobro,
        maquinaNombre: '(sin máquinas)', modelo: '', contadorActual: '',
        ultimaVisita: '', serviciosPeriodo: '',
      })
    }
  })

  const handleExportarCSV = () => exportarCSV(filasCSV)

  const handleBackupJSON = async () => {
    setExportando(true)
    try {
      const backup = {
        exportadoEl: new Date().toISOString(),
        clientes:    datos.clientes.map((c) => ({
          id:               c.id,
          razonSocial:      c.razonSocial,
          cuit:             c.cuit,
          diaCobro:         c.diaCobro,
          contactoNombre:   c.contactoNombre,
          contactoTelefono: c.contactoTelefono,
          contactoEmail:    c.contactoEmail,
          direccion:        c.direccion,
          notas:            c.notas,
          maquinas:         c.maquinas.map((m) => ({
            id:             m.id,
            nombre:         m.nombre,
            modelo:         m.modelo,
            serie:          m.serie,
            contadorActual: m.contadorActual,
            notas:          m.notas,
          })),
        })),
        insumos: datos.insumos.map((i) => ({
          id:          i.id,
          nombre:      i.nombre,
          unidad:      i.unidad,
          stockActual: i.stockActual,
          stockMinimo: i.stockMinimo,
        })),
      }
      exportarJSON(backup)
    } finally {
      setExportando(false)
    }
  }

  const totalMaquinas = datos.clientes.reduce((acc, c) => acc + c.maquinas.length, 0)

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <h5 className="mb-1" style={{ color: 'var(--text-primary)' }}>Balance</h5>
          <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
            {datos.clientes.length} clientes · {totalMaquinas} máquinas
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-sm d-flex align-items-center gap-1"
            onClick={handleExportarCSV}
            style={{ color: 'var(--primary-color)', background: 'transparent', border: '1px solid var(--primary-color)', borderRadius: '0.5rem' }}
          >
            <BsFiletypeCsv size={15} /> Exportar CSV
          </button>
          <button
            className="btn btn-sm d-flex align-items-center gap-1"
            onClick={handleBackupJSON}
            disabled={exportando}
            style={{ color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
          >
            <BsFiletypeJson size={15} /> {exportando ? 'Generando...' : 'Backup JSON'}
          </button>
        </div>
      </div>

      {/* Tabla de balance */}
      {datos.clientes.length === 0 ? (
        <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
          <BsGraphUp size={32} className="mb-2 opacity-50" />
          <p className="mb-0 small">No hay clientes aún.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {datos.clientes.map((c) => (
            <div
              key={c.id}
              className="rounded-3"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', overflow: 'hidden' }}
            >
              {/* Cabecera cliente */}
              <div
                className="px-3 py-2 d-flex align-items-center justify-content-between"
                style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <BsBuilding size={13} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                  <span className="fw-semibold small" style={{ color: 'var(--text-primary)' }}>{c.razonSocial}</span>
                </div>
                <span className="small" style={{ color: 'var(--text-secondary)' }}>Día cobro: {c.diaCobro}</span>
              </div>

              {/* Máquinas */}
              {c.maquinas.length === 0 ? (
                <div className="px-3 py-2">
                  <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Sin máquinas registradas.</p>
                </div>
              ) : (
                <div>
                  {c.maquinas.map((m, idx) => {
                    const ultima = m.ultimaVisita
                    return (
                      <div
                        key={m.id}
                        className="px-3 py-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
                        style={{ borderTop: idx > 0 ? '1px solid var(--border-color)' : 'none' }}
                      >
                        <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                          <BsCpu size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <p className="mb-0 small fw-semibold text-truncate" style={{ color: 'var(--text-primary)' }}>{m.nombre}</p>
                            {m.modelo && <p className="mb-0 small text-truncate" style={{ color: 'var(--text-secondary)' }}>{m.modelo}</p>}
                          </div>
                        </div>

                        <div className="d-flex gap-3 flex-shrink-0">
                          {/* Contador */}
                          <div className="text-end">
                            <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Contador</p>
                            <p className="mb-0 small fw-semibold" style={{ color: 'var(--primary-color)' }}>
                              {m.contadorActual != null ? m.contadorActual.toLocaleString('es-AR') : '—'}
                            </p>
                          </div>

                          {/* Servicios período */}
                          <div className="text-end">
                            <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Serv. período</p>
                            <p className="mb-0 small fw-semibold" style={{ color: ultima?.serviciosPeriodo != null ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                              {ultima?.serviciosPeriodo != null ? ultima.serviciosPeriodo : '—'}
                            </p>
                          </div>

                          {/* Última visita */}
                          <div className="text-end d-none d-sm-block">
                            <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>Última visita</p>
                            <p className="mb-0 small" style={{ color: 'var(--text-primary)' }}>
                              {ultima ? formatFecha(ultima.fecha) : 'Sin visitas'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info backup */}
      <div
        className="mt-4 p-3 rounded-3 d-flex align-items-start gap-2"
        style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}
      >
        <BsExclamationTriangle size={14} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: 2 }} />
        <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Backup JSON</strong> descarga clientes, máquinas, insumos y compras en un archivo local.
          Guardalo en Google Drive o envialo por WhatsApp para tener respaldo.
        </p>
      </div>
    </div>
  )
}
