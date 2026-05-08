import type { JobModalidad } from '../types/job.types'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatRelativeDate(dateStr?: string): string {
  if (!dateStr) return 'Fecha desconocida'
  try {
    return formatDistanceToNow(parseISO(dateStr), {
      addSuffix: true,
      locale: es
    })
  } catch {
    return 'Fecha desconocida'
  }
}

export function formatSalary(salary?: string): string {
  return salary ?? 'Salario no especificado'
}

export const MODALIDAD_LABELS: Record<JobModalidad, string> = {
  remoto: 'Remoto',
  hibrido: 'Híbrido',
  presencial: 'Presencial',
  no_especificado: 'No especificado'
}

export const MODALIDAD_COLORS: Record<JobModalidad, string> = {
  remoto: 'bg-green-500/20 text-green-400 border-green-500/30',
  hibrido: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  presencial: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  no_especificado: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

export const PORTAL_LABELS: Record<string, string> = {
  adzuna: 'Adzuna',
  infojobs: 'InfoJobs',
  tecnoempleo: 'Tecnoempleo',
  jobatus: 'Jobatus',
  indeed: 'Indeed'
}

export const PORTAL_COLORS: Record<string, string> = {
  adzuna: 'bg-cyan-500/20 text-cyan-400',
  infojobs: 'bg-violet-500/20 text-violet-400',
  tecnoempleo: 'bg-amber-500/20 text-amber-400',
  jobatus: 'bg-pink-500/20 text-pink-400',
  indeed: 'bg-sky-500/20 text-sky-400'
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Calcula un % de encaje entre las skills de la oferta y las del perfil del usuario.
 * Devuelve null si alguna de las listas está vacía.
 */
export function computeMatchScore(
  jobSkills: string[],
  userSkills: string[]
): number | null {
  if (!jobSkills.length || !userSkills.length) return null
  const normalizedUser = userSkills.map((s) => s.toLowerCase().trim())
  const matched = jobSkills.filter((s) =>
    normalizedUser.includes(s.toLowerCase().trim())
  ).length
  return Math.round((matched / jobSkills.length) * 100)
}
