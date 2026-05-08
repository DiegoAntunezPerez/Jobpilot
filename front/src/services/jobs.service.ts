import api from './api'
import type { Job, JobSearchFilters, JobSearchResult } from '../types/job.types'

export async function searchJobs(
  filters: JobSearchFilters
): Promise<JobSearchResult> {
  const params: Record<string, string | number> = {}
  if (filters.query) params.query = filters.query
  if (filters.location) params.location = filters.location
  if (filters.modalidad) params.modalidad = filters.modalidad
  if (filters.salaryMin) params.salaryMin = filters.salaryMin
  if (filters.salaryMax) params.salaryMax = filters.salaryMax
  if (filters.portal) params.portal = filters.portal
  if (filters.dateFrom) params.dateFrom = filters.dateFrom
  if (filters.skills) params.skills = filters.skills
  if (filters.page) params.page = filters.page
  if (filters.limit) params.limit = filters.limit

  const { data } = await api.get<JobSearchResult>('/jobs/search', { params })
  return data
}

export async function getJobById(id: string): Promise<Job> {
  const { data } = await api.get<Job>(`/jobs/${id}`)
  return data
}

export async function getPortals(): Promise<{ portals: string[] }> {
  const { data } = await api.get<{ portals: string[] }>('/jobs/portals')
  return data
}
