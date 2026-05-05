import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  doc, getDoc, collection, writeBatch, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { calcularServiciosPeriodo } from '../lib/negocio'

const card = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '1rem',
  padding: '1.5rem',
}

const inputStyle = {
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.5rem',
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <p className="fw-bold mb-4" style={{ color: 'var(--primary-color)', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
          Nexus Vending
        </p>
        {children}
      </div>
    </div>
  )
}

function EstadoCard({ titulo, subtitulo, color = 'var(--text-secondary)' }) {
  return (
    <Shell>
      <div style={card}>
        <p className="fw-semibold mb-1" style={{ color }}>{titulo}</p>
        {subtitulo && <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>{subtitulo}</p>}
      </div>
    </Shell>
  )
}

function hoy() {
  return new Date().toISOString().split('T')[0]
}

export default function VisitaRemotaPage() {
  const { tokenId } = useParams()

  const [fase, setFase] = useState('loading') // loading | invalid | expired | used | cancelled | ready | saving | done
  const [token, setToken] = useState(null)
  const [expendios, setExpendios] = useState({})
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getDoc(doc(db, 'tokensVisita', tokenId))
      .then((snap) => {
        if (!snap.exists()) { setFase('invalid'); return }
        const data = { id: snap.id, ...snap.data() }

        if (data.estado === 'completado') { setToken(data); setFase('used'); return }
        if (data.estado === 'cancelado') { setFase('cancelled'); return }

        const expira = data.expiraEn instanceof Timestamp
          ? data.expiraEn.toDate()
          : new Date(data.expiraEn)
        if (new Date() > expira) { setFase('expired'); return }

        setToken(data)
        const init = {}
        ;(data.bebidas ?? []).forEach((b) => { init[b.id] = '' })
        setExpendios(init)
        setFase('ready')
      })
      .catch(() => setFase('invalid'))
  }, [tokenId])

  const totalExpendios = useMemo(() => {
    if (!token?.bebidas) return null
    let total = 0
    let hayAlguno = false
    token.bebidas.forEach((b) => {
      const val = parseInt(expendios[b.id], 10)
      if (!isNaN(val)) { hayAlguno = true; total += val }
    })
    return hayAlguno ? total : null
  }, [expendios, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (totalExpendios == null || totalExpendios <= 0) {
      setError('Ingresá al menos un contador de bebida.')
      return
    }
    const contadorAnterior = token.contadorAnterior ?? null
    if (contadorAnterior != null && totalExpendios < contadorAnterior) {
      setError(`El total (${totalExpendios.toLocaleString('es-AR')}) no puede ser menor al contador anterior (${contadorAnterior.toLocaleString('es-AR')}).`)
      return
    }

    setFase('saving')
    setError('')

    try {
      const fechaDate = new Date(hoy() + 'T12:00:00')
      const serviciosPeriodo = calcularServiciosPeriodo(totalExpendios, contadorAnterior)
      const batch = writeBatch(db)

      // 1 — Visita
      const visitaRef = doc(collection(db, 'clientes', token.clienteId, 'maquinas', token.maquinaId, 'visitas'))
      batch.set(visitaRef, {
        fecha:            Timestamp.fromDate(fechaDate),
        contadorTotal:    totalExpendios,
        serviciosPeriodo,
        tecnico:          'remoto',
        observaciones:    observaciones || '',
        tokenId,
        createdAt:        serverTimestamp(),
      })

      // 2 — Expendios
      token.bebidas.forEach((bebida) => {
        const valorStr = expendios[bebida.id]
        if (!valorStr) return
        const cantidad = parseInt(valorStr, 10)
        if (isNaN(cantidad) || cantidad <= 0) return
        const expRef = doc(
          collection(db, 'clientes', token.clienteId, 'maquinas', token.maquinaId, 'visitas', visitaRef.id, 'expendios')
        )
        batch.set(expRef, {
          bebidaId:        bebida.id,
          bebidaNombre:    bebida.nombre,
          cantidad,
          cantidadPeriodo: cantidad,
        })
      })

      // 3 — Actualizar máquina
      batch.update(doc(db, 'clientes', token.clienteId, 'maquinas', token.maquinaId), {
        contadorActual: totalExpendios,
        ultimaVisita:   Timestamp.fromDate(fechaDate),
      })

      // 4 — Marcar token completado
      batch.update(doc(db, 'tokensVisita', tokenId), {
        estado:   'completado',
        usadoEn:  serverTimestamp(),
        visitaId: visitaRef.id,
      })

      await batch.commit()
      setFase('done')
    } catch (err) {
      setError('Error al registrar: ' + err.message)
      setFase('ready')
    }
  }

  // ── Estados de pantalla ───────────────────────────────
  if (fase === 'loading') return (
    <Shell>
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm" style={{ color: 'var(--primary-color)' }} />
      </div>
    </Shell>
  )

  if (fase === 'invalid') return (
    <EstadoCard
      titulo="Link inválido"
      subtitulo="Este link no existe o fue eliminado. Solicitá uno nuevo."
      color="var(--danger-color)"
    />
  )
  if (fase === 'expired') return (
    <EstadoCard
      titulo="Link vencido"
      subtitulo="Este link expiró. Solicitá uno nuevo al equipo de Nexus."
      color="var(--danger-color)"
    />
  )
  if (fase === 'cancelled') return (
    <EstadoCard
      titulo="Link cancelado"
      subtitulo="Este link fue cancelado. Solicitá uno nuevo al equipo de Nexus."
      color="var(--danger-color)"
    />
  )
  if (fase === 'used') return (
    <EstadoCard
      titulo="Consumos ya registrados"
      subtitulo="Este link ya fue utilizado. Los datos fueron registrados correctamente."
      color="var(--success-color)"
    />
  )

  if (fase === 'done') return (
    <Shell>
      <div style={{ ...card, borderColor: 'var(--success-color)' }}>
        <p className="fw-semibold mb-2" style={{ color: 'var(--success-color)' }}>Consumos registrados</p>
        <p className="small mb-1" style={{ color: 'var(--text-secondary)' }}>
          Equipo: <strong style={{ color: 'var(--text-primary)' }}>{token.maquinaNombre}</strong>
        </p>
        <p className="small mb-3" style={{ color: 'var(--text-secondary)' }}>
          Total registrado:{' '}
          <strong style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>
            {totalExpendios?.toLocaleString('es-AR')}
          </strong>
        </p>
        <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
          Podés cerrar esta pestaña. Gracias!
        </p>
      </div>
    </Shell>
  )

  // ── Formulario ────────────────────────────────────────
  return (
    <Shell>
      {/* Info del equipo */}
      <div style={card} className="mb-3">
        <p className="small fw-bold mb-0" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em' }}>
          Equipo
        </p>
        <p className="fw-semibold mb-0 mt-1" style={{ color: 'var(--text-primary)' }}>{token.maquinaNombre}</p>
        <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>{token.clienteNombre}</p>
        {token.contadorAnterior != null && (
          <p className="small mb-0 mt-2" style={{ color: 'var(--text-secondary)' }}>
            Contador anterior:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {token.contadorAnterior.toLocaleString('es-AR')}
            </strong>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Contadores por bebida */}
        <div style={card} className="mb-3">
          <p className="small fw-bold mb-3" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em' }}>
            Contadores actuales por bebida
          </p>
          <div className="d-flex flex-column gap-3">
            {(token.bebidas ?? []).map((bebida) => (
              <div key={bebida.id} className="d-flex align-items-center gap-3">
                <label className="small mb-0 flex-grow-1" style={{ color: 'var(--text-primary)' }}>
                  {bebida.nombre}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  className="form-control"
                  style={{ ...inputStyle, width: 120, textAlign: 'right', fontSize: '1rem' }}
                  min={0}
                  value={expendios[bebida.id] ?? ''}
                  onChange={(e) => setExpendios((prev) => ({ ...prev, [bebida.id]: e.target.value }))}
                  placeholder="—"
                />
              </div>
            ))}
          </div>
          {totalExpendios != null && (
            <div
              className="d-flex justify-content-between align-items-center pt-3 mt-2"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <span className="small fw-semibold" style={{ color: 'var(--text-secondary)' }}>Total</span>
              <span className="fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>
                {totalExpendios.toLocaleString('es-AR')}
              </span>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div style={card} className="mb-3">
          <label
            className="small fw-bold mb-2 d-block"
            style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em' }}
          >
            Observaciones (opcional)
          </label>
          <textarea
            className="form-control"
            style={{ ...inputStyle, resize: 'vertical' }}
            rows={2}
            placeholder="Ej: máquina sin fallas, temperatura correcta..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

        <button
          type="submit"
          className="btn btn-theme-primary w-100"
          disabled={fase === 'saving'}
          style={{ fontSize: '1rem', padding: '0.75rem' }}
        >
          {fase === 'saving' ? 'Registrando...' : 'Registrar consumos'}
        </button>
      </form>
    </Shell>
  )
}
