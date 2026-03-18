import { Timestamp } from 'firebase/firestore'

/**
 * Calcula serviciosPeriodo restando contador anterior al actual.
 * Devuelve null si es la primera visita.
 */
export function calcularServiciosPeriodo(contadorActual, contadorAnterior) {
  if (contadorAnterior == null) return null
  return Math.max(0, contadorActual - contadorAnterior)
}

/**
 * Formatea una fecha Firestore Timestamp o Date a string legible (Argentina).
 */
export function formatFecha(valor) {
  if (!valor) return '-'
  const date = valor instanceof Timestamp ? valor.toDate() : new Date(valor)
  return date.toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

