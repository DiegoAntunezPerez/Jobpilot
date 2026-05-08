import { create } from 'zustand'
import type { Application, ApplicationStatus } from '../types/application.types'
import * as appsService from '../services/applications.service'
import type { CreateApplicationPayload } from '../services/applications.service'

interface ApplicationsState {
  applications: Application[]
  calendarApps: Application[]
  isLoading: boolean
  error: string | null

  fetchApplications: (status?: ApplicationStatus) => Promise<void>
  fetchCalendar: (year: number, month: number) => Promise<void>
  addApplication: (payload: CreateApplicationPayload) => Promise<Application>
  updateApplication: (
    id: string,
    payload: { status?: ApplicationStatus; notes?: string }
  ) => Promise<void>
  removeApplication: (id: string) => Promise<void>
}

export const useApplicationsStore = create<ApplicationsState>((set, _get) => ({
  applications: [],
  calendarApps: [],
  isLoading: false,
  error: null,

  fetchApplications: async (status) => {
    set({ isLoading: true, error: null })
    try {
      const apps = await appsService.getApplications(status)
      set({ applications: apps })
    } catch (err: unknown) {
      set({
        error:
          err instanceof Error ? err.message : 'Error al cargar aplicaciones'
      })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchCalendar: async (year, month) => {
    set({ isLoading: true })
    try {
      const apps = await appsService.getCalendarApplications(year, month)
      set({ calendarApps: apps })
    } catch {
      set({ calendarApps: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  addApplication: async (payload) => {
    const app = await appsService.createApplication(payload)
    set((state) => ({ applications: [app, ...state.applications] }))
    return app
  },

  updateApplication: async (id, payload) => {
    const updated = await appsService.updateApplication(id, payload)
    set((state) => ({
      applications: state.applications.map((a) => (a._id === id ? updated : a)),
      calendarApps: state.calendarApps.map((a) => (a._id === id ? updated : a))
    }))
  },

  removeApplication: async (id) => {
    await appsService.deleteApplication(id)
    set((state) => ({
      applications: state.applications.filter((a) => a._id !== id),
      calendarApps: state.calendarApps.filter((a) => a._id !== id)
    }))
  }
}))

// Selector helper
export function getApplicationByJobId(jobId: string) {
  return useApplicationsStore
    .getState()
    .applications.find((a) => a.jobId === jobId)
}
