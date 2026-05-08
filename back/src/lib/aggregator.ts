import { NormalizedJob, JobSearchFilters, JobPortal } from '../types/job.types'
import { searchAdzuna } from './scrapers/adzuna.scraper'
import { searchTecnoempleo } from './scrapers/tecnoempleo.scraper'
import { searchJobatus } from './scrapers/jobatus.scraper'
import { getLocationTerms } from './provinces'

const SUPPORTED_PORTALS: JobPortal[] = ['adzuna', 'tecnoempleo', 'jobatus']

/**
 * Agrega resultados desde todos los portales configurados, los normaliza y unifica.
 */
export async function aggregateJobs(filters: JobSearchFilters): Promise<{
  jobs: NormalizedJob[]
  total: number
  portals: JobPortal[]
}> {
  const targetPortals = filters.portal ? [filters.portal] : SUPPORTED_PORTALS

  const settledResults = await Promise.allSettled(
    targetPortals.map((portal) => fetchFromPortal(portal, filters))
  )

  const jobs: NormalizedJob[] = []
  const activePortals: JobPortal[] = []
  let adzunaTotal = 0

  settledResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { jobs: portalJobs, total } = result.value
      if (portalJobs.length > 0) {
        jobs.push(...portalJobs)
        activePortals.push(targetPortals[index])
        if (targetPortals[index] === 'adzuna') adzunaTotal = total
      }
    }
  })

  const deduplicated = deduplicateJobs(jobs)
  const filtered = applyPostFilters(deduplicated, filters)

  // Usar el total real de Adzuna para paginación correcta
  const total = adzunaTotal > 0 ? adzunaTotal : filtered.length

  return { jobs: filtered, total, portals: activePortals }
}

async function fetchFromPortal(
  portal: JobPortal,
  filters: JobSearchFilters
): Promise<{ jobs: NormalizedJob[]; total: number }> {
  switch (portal) {
    case 'adzuna':
      return searchAdzuna(filters)
    case 'tecnoempleo': {
      const jobs = await searchTecnoempleo(filters)
      return { jobs, total: jobs.length }
    }
    case 'jobatus': {
      const jobs = await searchJobatus(filters)
      return { jobs, total: jobs.length }
    }
    default:
      return { jobs: [], total: 0 }
  }
}

function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const seen = new Set<string>()
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function applyPostFilters(
  jobs: NormalizedJob[],
  filters: JobSearchFilters
): NormalizedJob[] {
  let result = jobs

  if (filters.modalidad && filters.modalidad !== 'no_especificado') {
    result = result.filter((j) => j.modalidad === filters.modalidad)
  }

  // Filtro por provincia: comprueba si el location de la oferta contiene
  // alguno de los términos asociados a la provincia/ciudad seleccionada.
  if (filters.location) {
    const terms = getLocationTerms(filters.location)
    result = result.filter((j) => {
      const loc = j.location.toLowerCase()
      return terms.some((term) => loc.includes(term))
    })
  }

  if (filters.salaryMin) {
    result = result.filter(
      (j) => j.salaryMin === undefined || j.salaryMin >= filters.salaryMin!
    )
  }

  if (filters.salaryMax) {
    result = result.filter(
      (j) => j.salaryMax === undefined || j.salaryMax <= filters.salaryMax!
    )
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom)
    result = result.filter(
      (j) => j.publishedAt !== undefined && j.publishedAt >= from
    )
  }

  if (filters.skills) {
    const skillList = filters.skills
      .toLowerCase()
      .split(',')
      .map((s) => s.trim())
    result = result.filter((j) =>
      skillList.some(
        (skill) =>
          j.skills.includes(skill) ||
          j.description.toLowerCase().includes(skill) ||
          j.title.toLowerCase().includes(skill)
      )
    )
  }

  // Ordenar por fecha descendente.
  // Ofertas sin fecha (Jobatus) se posicionan como si tuvieran ~1 semana de antigüedad:
  // nunca arriba con las de hoy, pero tampoco hundidas al final.
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  result.sort(
    (a, b) =>
      (b.publishedAt?.getTime() ?? oneWeekAgo) -
      (a.publishedAt?.getTime() ?? oneWeekAgo)
  )

  return result
}

export function getSupportedPortals(): JobPortal[] {
  return SUPPORTED_PORTALS
}
