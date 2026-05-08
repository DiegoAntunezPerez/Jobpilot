export type JobModalidad =
  | 'remoto'
  | 'hibrido'
  | 'presencial'
  | 'no_especificado'
export type JobPortal =
  | 'adzuna'
  | 'infojobs'
  | 'tecnoempleo'
  | 'jobatus'
  | 'indeed'

export interface Job {
  id: string
  portal: JobPortal
  title: string
  company: string
  location: string
  salary?: string
  salaryMin?: number
  salaryMax?: number
  modalidad: JobModalidad
  skills: string[]
  description: string
  urlOriginal: string
  publishedAt?: string
}

export interface JobSearchFilters {
  query?: string
  location?: string
  modalidad?: JobModalidad | ''
  salaryMin?: number
  salaryMax?: number
  portal?: JobPortal | ''
  dateFrom?: string
  skills?: string
  page?: number
  limit?: number
}

export interface JobSearchResult {
  jobs: Job[]
  total: number
  page: number
  totalPages: number
  portals: JobPortal[]
}
