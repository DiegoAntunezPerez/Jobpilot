import axios from 'axios'
import { NormalizedJob, JobSearchFilters } from '../../types/job.types'
import { normalizeModalidad } from '../normalizer'

const BASE_URL = 'https://api.adzuna.com/v1/api/jobs/es/search'

export async function searchAdzuna(
  filters: JobSearchFilters
): Promise<{ jobs: NormalizedJob[]; total: number }> {
  const appId = process.env.ADZUNA_APP_ID
  const apiKey = process.env.ADZUNA_API_KEY

  if (!appId || !apiKey) {
    console.warn('[Adzuna] Credenciales no configuradas, omitiendo portal.')
    return { jobs: [], total: 0 }
  }

  try {
    const page = filters.page ?? 1
    const params: Record<string, string | number> = {
      app_id: appId,
      app_key: apiKey,
      results_per_page: 50
    }

    if (filters.query) params.what = filters.query
    if (filters.location) params.where = filters.location
    if (filters.salaryMin) params.salary_min = filters.salaryMin
    if (filters.salaryMax) params.salary_max = filters.salaryMax

    const { data } = await axios.get(`${BASE_URL}/${page}`, {
      params,
      timeout: 10000
    })

    const jobs = (data.results ?? []).map((job: Record<string, unknown>) => {
      const raw = job as {
        id: string
        title: string
        company?: { display_name?: string }
        location?: { display_name?: string }
        salary_min?: number
        salary_max?: number
        description?: string
        redirect_url?: string
        created?: string
        category?: { label?: string }
        contract_type?: string
      }

      const salaryMin = raw.salary_min
      const salaryMax = raw.salary_max
      let salary: string | undefined
      if (salaryMin && salaryMax) salary = `${salaryMin}€ - ${salaryMax}€`
      else if (salaryMin) salary = `Desde ${salaryMin}€`

      return {
        id: `adzuna-${raw.id}`,
        portal: 'adzuna' as const,
        title: raw.title ?? 'Sin título',
        company: raw.company?.display_name ?? 'Empresa desconocida',
        location: raw.location?.display_name ?? 'España',
        salary,
        salaryMin,
        salaryMax,
        modalidad: normalizeModalidad(raw.description ?? '', raw.title ?? ''),
        skills: extractSkillsFromText(raw.description ?? ''),
        description: raw.description ?? '',
        urlOriginal: raw.redirect_url ?? '',
        publishedAt: raw.created ? new Date(raw.created) : new Date()
      }
    })

    return { jobs, total: data.count ?? jobs.length }
  } catch (err) {
    console.error('[Adzuna] Error en búsqueda:', err)
    return { jobs: [], total: 0 }
  }
}

function extractSkillsFromText(text: string): string[] {
  const knownSkills = [
    'javascript',
    'typescript',
    'react',
    'angular',
    'vue',
    'node',
    'python',
    'java',
    'spring',
    'php',
    'laravel',
    'sql',
    'mysql',
    'postgresql',
    'mongodb',
    'docker',
    'kubernetes',
    'aws',
    'azure',
    'git',
    'linux',
    'css',
    'html',
    'rest',
    'graphql',
    'kotlin',
    'swift',
    'flutter',
    'react native',
    'next.js',
    'nestjs',
    'express',
    'tailwind',
    'sass',
    'redux',
    'figma',
    'scrum',
    'agile',
    'ci/cd',
    'jenkins'
  ]
  const lower = text.toLowerCase()
  return knownSkills.filter((skill) => lower.includes(skill)).slice(0, 10)
}
