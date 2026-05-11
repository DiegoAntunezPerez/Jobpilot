import { create } from 'zustand'
import type {
  Job,
  JobSearchFilters,
  JobSearchResult,
  JobPortal
} from '../types/job.types'
import * as jobsService from '../services/jobs.service'

// Contador para cancelar búsquedas en curso obsoletas
let currentSearchId = 0

interface JobsState {
  jobs: Job[]
  total: number
  page: number
  totalPages: number
  portals: JobPortal[]
  supportedPortals: string[]
  filters: JobSearchFilters
  isLoading: boolean
  isWakingUp: boolean
  error: string | null
  selectedJob: Job | null

  search: (filters?: Partial<JobSearchFilters>) => Promise<void>
  setFilters: (filters: Partial<JobSearchFilters>) => void
  resetFilters: () => void
  setSelectedJob: (job: Job | null) => void
  loadPortals: () => Promise<void>
  loadNextPage: () => Promise<void>
}

const DEFAULT_FILTERS: JobSearchFilters = {
  query: '',
  location: '',
  modalidad: '',
  salaryMin: undefined,
  salaryMax: undefined,
  portal: '',
  dateFrom: '',
  skills: '',
  page: 1,
  limit: 20
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  total: 0,
  page: 1,
  totalPages: 1,
  portals: [],
  supportedPortals: [],
  filters: DEFAULT_FILTERS,
  isLoading: false,
  isWakingUp: false,
  error: null,
  selectedJob: null,

  search: async (overrides) => {
    const searchId = ++currentSearchId
    const filters = { ...get().filters, ...overrides }
    set({ isLoading: true, isWakingUp: false, error: null, filters })
    const wakingTimer = setTimeout(() => {
      if (searchId === currentSearchId) set({ isWakingUp: true })
    }, 5000)
    try {
      const result: JobSearchResult = await jobsService.searchJobs(filters)
      if (searchId !== currentSearchId) return
      set({
        jobs: result.jobs,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        portals: result.portals
      })
    } catch (err: unknown) {
      if (searchId !== currentSearchId) return
      const message =
        err instanceof Error ? err.message : 'Error al buscar ofertas'
      set({ error: message, jobs: [] })
    } finally {
      clearTimeout(wakingTimer)
      if (searchId === currentSearchId) set({ isLoading: false, isWakingUp: false })
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters, page: 1 } }))
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS, jobs: [], total: 0 })
  },

  setSelectedJob: (job) => set({ selectedJob: job }),

  loadPortals: async () => {
    try {
      const { portals } = await jobsService.getPortals()
      set({ supportedPortals: portals })
    } catch {
      // ignorar
    }
  },

  loadNextPage: async () => {
    const { page, totalPages, filters, jobs } = get()
    if (page >= totalPages) return
    const nextFilters = { ...filters, page: page + 1 }
    set({ isLoading: true, error: null, filters: nextFilters })
    try {
      const result: JobSearchResult = await jobsService.searchJobs(nextFilters)
      set({
        jobs: [...jobs, ...result.jobs],
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        portals: result.portals
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar más ofertas'
      set({ error: message })
    } finally {
      set({ isLoading: false })
    }
  }
}))
