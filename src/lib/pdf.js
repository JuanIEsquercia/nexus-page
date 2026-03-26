import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// ── Constantes ────────────────────────────────────────
const C = {
  primary: [14, 165, 233],
  success: [16, 185, 129],
  warning: [245, 158, 11],
  dark:    [17,  24,  39],
  gray:    [107, 114, 128],
  border:  [209, 213, 219],
  bgLight: [249, 250, 251],
  white:   [255, 255, 255],
}

const W      = 210   // A4 width mm
const M      = 20    // margin
const CW     = W - M * 2  // content width = 170

const pesos = (v) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v ?? 0)

const fmtFecha = (val) => {
  if (!val) return '—'
  let d
  if (val?.toDate) d = val.toDate()
  else if (val instanceof Date) d = val
  else d = new Date(String(val) + 'T12:00:00')
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function genNumero(prefix) {
  const n   = new Date()
  const pad = (x, l = 2) => String(x).padStart(l, '0')
  const date = `${n.getFullYear()}${pad(n.getMonth() + 1)}${pad(n.getDate())}`
  const time = `${pad(n.getHours())}${pad(n.getMinutes())}${pad(n.getSeconds())}`
  return `${prefix}-${date}-${time}`
}

// ── Helper: sección de 2 columnas en una caja ─────────
function infoBox(doc, y, leftItems, rightItems, boxH = 36) {
  // borde exterior
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.3)
  doc.roundedRect(M, y, CW, boxH, 2, 2, 'S')

  // divisor vertical
  doc.setLineWidth(0.2)
  doc.line(M + CW / 2, y + 3, M + CW / 2, y + boxH - 3)

  const lx = M + 5
  const rx = M + CW / 2 + 5
  const colW = CW / 2 - 10

  ;[
    { x: lx, items: leftItems },
    { x: rx, items: rightItems },
  ].forEach(({ x, items }) => {
    let cy = y + 7
    items.forEach(({ label, value, bold }, i) => {
      if (i === 0 && bold) {
        // cabecera de sección
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(...C.gray)
        doc.text(label.toUpperCase(), x, cy)
        doc.setDrawColor(...C.border)
        doc.setLineWidth(0.2)
        doc.line(x, cy + 1.5, x + colW, cy + 1.5)
        cy += 7
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...C.gray)
        const labelW = doc.getTextWidth(label + ' ')
        doc.text(label, x, cy)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...C.dark)
        const val = String(value ?? '')
        doc.text(val, x + labelW + 1, cy)
        cy += 5.5
      }
    })
  })

  return y + boxH + 6
}

// ── Generador Presupuesto ─────────────────────────────
export function generarPresupuestoPDF({
  numero, titulo, descripcion,
  clienteNombre, clienteContacto,
  fechaEmision, vigenciaDias, items,
}) {
  const doc = new jsPDF()
  let y = 16

  const fechaEm  = new Date(fechaEmision + 'T12:00:00')
  const fechaVal = new Date(fechaEm)
  fechaVal.setDate(fechaVal.getDate() + parseInt(vigenciaDias))

  // ── Header ──────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...C.primary)
  doc.text('PRESUPUESTO', W / 2, y, { align: 'center' })
  y += 9

  doc.setFontSize(13)
  doc.setTextColor(...C.dark)
  doc.text(titulo || '', W / 2, y, { align: 'center' })
  y += 6

  if (descripcion) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(...C.gray)
    const lines = doc.splitTextToSize(descripcion, CW)
    doc.text(lines, W / 2, y, { align: 'center' })
    y += lines.length * 5
  }

  // línea separadora
  doc.setDrawColor(...C.primary)
  doc.setLineWidth(0.8)
  doc.line(M, y + 2, W - M, y + 2)
  y += 10

  // ── Info boxes ──────────────────────────────────────
  y = infoBox(doc, y, [
    { label: 'Información del Cliente', bold: true },
    { label: 'Cliente:',   value: clienteNombre  || '' },
    { label: 'Contacto:', value: clienteContacto || 'No especificado' },
  ], [
    { label: 'Información del Presupuesto', bold: true },
    { label: 'Fecha de Emisión:', value: fmtFecha(fechaEmision) },
    { label: 'Válido hasta:',     value: fechaVal.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
    { label: 'Vigencia:',         value: `${vigenciaDias} días` },
  ], 42)

  // ── Tabla conceptos ──────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...C.dark)
  doc.text('Conceptos del Presupuesto', M, y)
  y += 3

  const total = items.reduce((s, i) => s + (Number(i.subtotal) || 0), 0)

  autoTable(doc, {
    startY: y,
    head: [['DESCRIPCIÓN', 'CANTIDAD', 'PRECIO UNIT.', 'SUBTOTAL']],
    body: items.map((i) => [
      i.descripcion,
      String(i.cantidad),
      pesos(i.precioUnitario),
      pesos(i.subtotal),
    ]),
    headStyles:           { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 9 },
    bodyStyles:           { fontSize: 9, textColor: C.dark },
    alternateRowStyles:   { fillColor: C.bgLight },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: M, right: M },
    theme: 'grid',
  })

  y = doc.lastAutoTable.finalY + 5

  // caja total
  const totalH = 14
  doc.setDrawColor(...C.success)
  doc.setLineWidth(0.6)
  doc.roundedRect(M, y, CW, totalH, 2, 2, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...C.success)
  doc.text(`Total: ${pesos(total)}`, W - M - 5, y + totalH / 2 + 2.5, { align: 'right' })
  y += totalH + 10

  // ── Footer ──────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...C.dark)
  doc.text(`Oferta válida por ${vigenciaDias} días desde la fecha de emisión.`, W / 2, y, { align: 'center' })
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.gray)
  doc.text('Este presupuesto fue generado automáticamente por el sistema ', W / 2, y, { align: 'center' })
  y += 4
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.primary)
  doc.text('Nexus Vending Management', W / 2, y, { align: 'center' })

  doc.save(`Presupuesto - ${titulo || numero}.pdf`)
  return numero
}

// ── Generador Remito ──────────────────────────────────
export function generarRemitoPDF({
  numero, clienteNombre, clienteCuit,
  fechaEmision, fechaEntrega, items, observaciones,
}) {
  const doc = new jsPDF()
  let y = 16

  // ── Header ──────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...C.primary)
  doc.text('REMITO', W / 2, y, { align: 'center' })
  y += 9

  doc.setFontSize(13)
  doc.setTextColor(...C.dark)
  doc.text('NEXUS VENDING', W / 2, y, { align: 'center' })
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...C.gray)
  doc.text(`N° ${numero}`, W / 2, y, { align: 'center' })
  y += 5

  // línea separadora
  doc.setDrawColor(...C.primary)
  doc.setLineWidth(0.8)
  doc.line(M, y + 2, W - M, y + 2)
  y += 10

  // ── Info box 1: Remitente / Destinatario ──────────
  y = infoBox(doc, y, [
    { label: 'Remitente', bold: true },
    { label: 'Empresa:', value: 'NEXUS VENDING' },
  ], [
    { label: 'Destinatario', bold: true },
    { label: 'Nombre:', value: clienteNombre || '' },
    { label: 'CUIT:',   value: clienteCuit   || '' },
  ], 34)

  // ── Info box 2: Fechas / Detalles ──────────────────
  y = infoBox(doc, y, [
    { label: 'Fechas', bold: true },
    { label: 'Emisión:', value: fmtFecha(fechaEmision) },
    { label: 'Entrega:', value: fmtFecha(fechaEntrega) },
  ], [
    { label: 'Detalles', bold: true },
    { label: 'Items:', value: String(items.length) },
  ], 34)

  // ── Tabla productos ──────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...C.dark)
  doc.text('Productos Entregados', M, y)
  y += 3

  autoTable(doc, {
    startY: y,
    head: [['DESCRIPCIÓN DEL PRODUCTO', 'CANTIDAD']],
    body: items.map((i) => [i.descripcion, String(i.cantidad)]),
    headStyles:         { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 9 },
    bodyStyles:         { fontSize: 9, textColor: C.dark },
    alternateRowStyles: { fillColor: C.bgLight },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: M, right: M },
    theme: 'grid',
  })

  y = doc.lastAutoTable.finalY + 8

  // ── Expendios (bebidas del período) ──────────────────
  if (expendios.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...C.dark)
    doc.text('Consumos del período', M, y)
    y += 3

    autoTable(doc, {
      startY: y,
      head: [['BEBIDA / PRODUCTO', 'CANTIDAD EN PERÍODO']],
      body: expendios.map((e) => [e.bebidaNombre, String(e.cantidadPeriodo ?? '—')]),
      headStyles:         { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 9 },
      bodyStyles:         { fontSize: 9, textColor: C.dark },
      alternateRowStyles: { fillColor: C.bgLight },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
      },
      margin: { left: M, right: M },
      theme: 'grid',
    })

    y = doc.lastAutoTable.finalY + 8
  }

  // ── Observaciones ────────────────────────────────────
  if (observaciones) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...C.warning)
    doc.text('Observaciones:', M, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.warning)
    const lines = doc.splitTextToSize(observaciones, CW)
    doc.text(lines, M, y)
    y += lines.length * 5 + 5
  }

  // ── Footer ──────────────────────────────────────────
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.gray)
  doc.text('Documento generado automáticamente por el sistema Nexus Vending Management.', W / 2, y, { align: 'center' })
  y += 4
  doc.text('Documento generado automáticamente por el sistema Nexus Vending Management.', W / 2, y, { align: 'center' })

  // ── Firmas ──────────────────────────────────────────
  const sigY = Math.max(y + 20, 252)
  const sigW = 55

  // Remitente
  doc.setDrawColor(...C.gray)
  doc.setLineWidth(0.3)
  doc.line(M + 5, sigY, M + 5 + sigW, sigY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.gray)
  doc.text('Remitente', M + 5 + sigW / 2, sigY - 2, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.dark)
  doc.text('NEXUS VENDING', M + 5 + sigW / 2, sigY + 5, { align: 'center' })

  // Destinatario
  const rxSig = W - M - 5 - sigW
  doc.setDrawColor(...C.gray)
  doc.setLineWidth(0.3)
  doc.line(rxSig, sigY, rxSig + sigW, sigY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.gray)
  doc.text('Destinatario', rxSig + sigW / 2, sigY - 2, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.dark)
  doc.text(clienteNombre || '', rxSig + sigW / 2, sigY + 5, { align: 'center' })

  doc.save(`Remito - ${numero}.pdf`)
  return numero
}

// ── Generador Rendición de Visita ─────────────────────
export function generarRendicionPDF({
  clienteNombre, clienteCuit, clienteContacto,
  maquinaNombre,
  fecha, contadorTotal, contadorAnterior, serviciosPeriodo, observaciones,
  expendios = [],
}) {
  const doc = new jsPDF()
  let y = 16

  // ── Header ──────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...C.primary)
  doc.text('RENDICIÓN DE VISITA', W / 2, y, { align: 'center' })
  y += 9

  doc.setFontSize(11)
  doc.setTextColor(...C.dark)
  doc.text('NEXUS VENDING', W / 2, y, { align: 'center' })
  y += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...C.gray)
  doc.text(`Fecha de visita: ${fmtFecha(fecha)}`, W / 2, y, { align: 'center' })
  y += 3

  doc.setDrawColor(...C.primary)
  doc.setLineWidth(0.8)
  doc.line(M, y + 2, W - M, y + 2)
  y += 10

  // ── Info: Cliente / Máquina ──────────────────────────
  y = infoBox(doc, y, [
    { label: 'Cliente', bold: true },
    { label: 'Empresa:',  value: clienteNombre   || '' },
    { label: 'CUIT:',     value: clienteCuit     || '' },
    { label: 'Contacto:', value: clienteContacto || '' },
  ], [
    { label: 'Servicio', bold: true },
    { label: 'Ubicación:', value: maquinaNombre || '' },
  ], 44)

  // ── Bloque servicios ─────────────────────────────────
  const blockH = 32
  doc.setFillColor(...C.primary)
  doc.roundedRect(M, y, CW, blockH, 3, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...C.white)
  doc.text('Servicios en el período', W / 2, y + 10, { align: 'center' })

  doc.setFontSize(28)
  doc.text(
    serviciosPeriodo != null ? String(serviciosPeriodo) : '—',
    W / 2, y + 25, { align: 'center' }
  )
  y += blockH + 8

  // ── Contadores ───────────────────────────────────────
  y = infoBox(doc, y, [
    { label: 'Contadores', bold: true },
    { label: 'Contador anterior:', value: contadorAnterior != null ? contadorAnterior.toLocaleString('es-AR') : '—' },
    { label: 'Contador actual:',   value: contadorTotal    != null ? contadorTotal.toLocaleString('es-AR')    : '—' },
  ], [
    { label: 'Resumen', bold: true },
    { label: 'Fecha:',      value: fmtFecha(fecha) },
    { label: 'Diferencia:', value: serviciosPeriodo != null ? `+${serviciosPeriodo} servicios` : '—' },
  ], 40)

  // ── Observaciones ────────────────────────────────────
  if (observaciones) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...C.warning)
    doc.text('Observaciones:', M, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.warning)
    const lines = doc.splitTextToSize(observaciones, CW)
    doc.text(lines, M, y)
    y += lines.length * 5 + 5
  }

  // ── Firmas ──────────────────────────────────────────
  const sigY = Math.max(y + 20, 240)
  const sigW = 55

  doc.setDrawColor(...C.gray)
  doc.setLineWidth(0.3)
  doc.line(M + 5, sigY, M + 5 + sigW, sigY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.gray)
  doc.text('Técnico / Responsable', M + 5 + sigW / 2, sigY - 2, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.dark)
  doc.text('NEXUS VENDING', M + 5 + sigW / 2, sigY + 5, { align: 'center' })

  const rxSig = W - M - 5 - sigW
  doc.setDrawColor(...C.gray)
  doc.setLineWidth(0.3)
  doc.line(rxSig, sigY, rxSig + sigW, sigY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.gray)
  doc.text('Representante del cliente', rxSig + sigW / 2, sigY - 2, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.dark)
  doc.text(clienteNombre || '', rxSig + sigW / 2, sigY + 5, { align: 'center' })

  // ── Footer ──────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.gray)
  doc.text('Documento generado automáticamente por el sistema Nexus Vending Management.', W / 2, 285, { align: 'center' })

  const nombre = `Rendicion - ${clienteNombre} - ${fmtFecha(fecha)}.pdf`
  doc.save(nombre)
}
