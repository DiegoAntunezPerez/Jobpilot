import { z } from 'zod'
import { aggregateJobs, getSupportedPortals } from '../lib/aggregator'
import { NormalizedJob, JobSearchResult, JobPortal } from '../types/job.types'
import { createError } from '../middlewares/error.middleware'

// Cache en memoria (5 min por query)
const cache = new Map<string, { data: JobSearchResult; expiresAt: number }>()
const CACHE_TTL = 300_000

export const jobSearchQuerySchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  modalidad: z
    .enum(['remoto', 'hibrido', 'presencial', 'no_especificado'])
    .optional(),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  portal: z
    .enum(['adzuna', 'infojobs', 'tecnoempleo', 'jobatus', 'indeed'])
    .optional(),
  dateFrom: z.string().optional(),
  skills: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20)
})

export type JobSearchQuery = z.infer<typeof jobSearchQuerySchema>

export async function searchJobs(
  params: JobSearchQuery
): Promise<JobSearchResult> {
  const cacheKey = JSON.stringify(params)
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }

  const { jobs, total, portals } = await aggregateJobs(params)

  const page = params.page ?? 1
  const limit = params.limit ?? 20

  const result: JobSearchResult = {
    jobs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    portals: portals as JobPortal[]
  }

  cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL })
  return result
}

export async function getJobById(id: string): Promise<NormalizedJob> {
  // Buscar en cache activa
  for (const entry of cache.values()) {
    const job = entry.data.jobs.find((j) => j.id === id)
    if (job) return job
  }
  throw createError('Oferta no encontrada', 404)
}

export function getPortals() {
  return getSupportedPortals()
}
