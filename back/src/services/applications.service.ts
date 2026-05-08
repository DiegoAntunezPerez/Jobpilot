import { z } from 'zod'
import { Application, ApplicationStatus } from '../models/application.model'
import { createError } from '../middlewares/error.middleware'

export const createApplicationSchema = z.object({
  jobId: z.string().min(1),
  jobTitle: z.string().min(1, 'El título de la oferta es obligatorio').max(200),
  company: z.string().min(1, 'La empresa es obligatoria').max(200),
  location: z.string().max(100).optional(),
  portal: z.string().min(1),
  urlOriginal: z.string().url().optional().or(z.literal('')),
  salary: z.string().max(100).optional(),
  dateApplied: z.string().datetime().optional(),
  status: z
    .enum([
      'aplicado',
      'en_proceso',
      'primera_entrevista',
      'segunda_entrevista',
      'oferta',
      'rechazado',
      'descartado'
    ])
    .default('aplicado'),
  notes: z.string().max(2000).optional()
})

export const updateApplicationSchema = z.object({
  status: z
    .enum([
      'aplicado',
      'en_proceso',
      'primera_entrevista',
      'segunda_entrevista',
      'oferta',
      'rechazado',
      'descartado'
    ])
    .optional(),
  notes: z.string().max(2000).optional(),
  dateApplied: z.string().datetime().optional()
})

// ── CRUD ──────────────────────────────────────────────────

export async function createApplication(
  userId: string,
  data: z.infer<typeof createApplicationSchema>
) {
  const existing = await Application.findOne({ userId, jobId: data.jobId })
  if (existing) throw createError('Ya has registrado esta oferta', 409)

  const app = await Application.create({
    ...data,
    userId,
    dateApplied: data.dateApplied ? new Date(data.dateApplied) : new Date()
  })
  return app
}

export async function getUserApplications(
  userId: string,
  status?: ApplicationStatus
) {
  const filter: Record<string, unknown> = { userId }
  if (status) filter.status = status
  return Application.find(filter).sort({ dateApplied: -1 })
}

export async function getCalendarApplications(
  userId: string,
  year: number,
  month: number
) {
  const from = new Date(year, month - 1, 1)
  const to = new Date(year, month, 1)
  return Application.find({
    userId,
    dateApplied: { $gte: from, $lt: to }
  }).sort({ dateApplied: 1 })
}

export async function updateApplication(
  userId: string,
  id: string,
  data: z.infer<typeof updateApplicationSchema>
) {
  const app = await Application.findOneAndUpdate(
    { _id: id, userId },
    {
      ...data,
      ...(data.dateApplied ? { dateApplied: new Date(data.dateApplied) } : {})
    },
    { new: true, runValidators: true }
  )
  if (!app) throw createError('Aplicación no encontrada', 404)
  return app
}

export async function deleteApplication(userId: string, id: string) {
  const app = await Application.findOneAndDelete({ _id: id, userId })
  if (!app) throw createError('Aplicación no encontrada', 404)
}
