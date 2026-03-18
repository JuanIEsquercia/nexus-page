import { collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore'
import { db } from '../firebase/firebase'

const BEBIDAS_INICIALES = [
  { nombre: 'Café corto',       orden: 1, activa: true },
  { nombre: 'Café largo',       orden: 2, activa: true },
  { nombre: 'Cortado',          orden: 3, activa: true },
  { nombre: 'Lágrima',          orden: 4, activa: true },
  { nombre: 'Café con leche',   orden: 5, activa: true },
  { nombre: 'Capuchino',        orden: 6, activa: true },
  { nombre: 'Mocaccino',        orden: 7, activa: true },
  { nombre: 'Chocolate',        orden: 8, activa: true },
  { nombre: 'Chocolate suave',  orden: 9, activa: true },
  { nombre: 'Leche sola',       orden: 10, activa: true },
]

/**
 * Inicializa la colección `bebidas` en Firestore.
 * Solo inserta si la colección está vacía para no sobreescribir cambios manuales.
 */
export async function seedBebidas() {
  const ref = collection(db, 'bebidas')
  const snapshot = await getDocs(ref)

  if (!snapshot.empty) {
    return { ok: false, msg: 'La colección bebidas ya tiene datos. No se sobreescribió.' }
  }

  const batch = writeBatch(db)
  BEBIDAS_INICIALES.forEach((bebida) => {
    const docRef = doc(ref)
    batch.set(docRef, bebida)
  })
  await batch.commit()

  return { ok: true, msg: `${BEBIDAS_INICIALES.length} bebidas creadas correctamente.` }
}
