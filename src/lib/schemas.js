import { z } from 'zod'

export const insumoSchema = z.object({
  nombre:      z.string().min(2, 'Requerido'),
  unidad:      z.string().min(1, 'Requerido'),
  stockMinimo: z.coerce.number().min(0, 'Debe ser ≥ 0'),
})

export const compraSchema = z.object({
  insumoId:  z.string().min(1, 'Seleccioná un insumo'),
  cantidad:  z.coerce.number().positive('Debe ser mayor a 0'),
  fecha:     z.string().min(1, 'Requerido'),
  notas:     z.string().optional(),
})

export const visitaSchema = z.object({
  fecha:         z.string().min(1, 'Requerido'),
  contadorTotal: z.coerce.number().int().min(0, 'Debe ser ≥ 0'),
  observaciones: z.string().optional(),
})

export const maquinaSchema = z.object({
  nombre:   z.string().min(2, 'Requerido'),
  modeloId: z.string().optional(),
  serie:    z.string().optional(),
  notas:    z.string().optional(),
})

export const modeloSchema = z.object({
  nombre: z.string().min(2, 'Requerido'),
})

export const presupuestoSchema = z.object({
  titulo:          z.string().min(1, 'Requerido'),
  descripcion:     z.string().optional(),
  clienteNombre:   z.string().min(1, 'Requerido'),
  clienteContacto: z.string().optional(),
  fechaEmision:    z.string().min(1, 'Requerido'),
  vigenciaDias:    z.coerce.number().int().min(1).max(365),
})

export const remitoSchema = z.object({
  clienteNombre: z.string().min(1, 'Requerido'),
  clienteCuit:   z.string().optional(),
  fechaEmision:  z.string().min(1, 'Requerido'),
  fechaEntrega:  z.string().min(1, 'Requerido'),
  observaciones: z.string().optional(),
})

export const clienteSchema = z.object({
  razonSocial:      z.string().min(2, 'Requerido'),
  cuit:             z.string().min(1, 'Requerido'),
  contactoNombre:   z.string().min(2, 'Requerido'),
  contactoTelefono: z.string().min(6, 'Requerido'),
  contactoEmail:    z.union([z.string().email('Email inválido'), z.literal('')]),
  direccion:        z.string().optional(),
  diaCobro:         z.coerce.number({ invalid_type_error: 'Requerido' }).int().min(1, 'Mín. 1').max(31, 'Máx. 31'),
  notas:            z.string().optional(),
})
