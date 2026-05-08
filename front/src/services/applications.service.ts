import api from './api'
import type { Application, ApplicationStatus } from '../types/application.types'

export interface CreateApplicationPayload {
  jobId: string
  jobTitle: string
  company: string
  location?: string
  portal: string
  urlOriginal?: string
  salary?: string
  dateApplied?: string
  status?: ApplicationStatus
  notes?: string
}

export interface UpdateApplicationPayload {
  status?: ApplicationStatus
  notes?: string
  dateApplied?: string
}

export async function createApplication(
  payload: CreateApplicationPayload
): Promise<Application> {
  const { data } = await api.post<Application>('/applications', payload)
  return data
}

export async function getApplications(
  status?: ApplicationStatus
): Promise<Application[]> {
  const params = status ? { status } : {}
  const { data } = await api.get<Application[]>('/applications', { params })
  return data
}

export async function getCalendarApplications(
  year: number,
  month: number
): Promise<Application[]> {
  const { data } = await api.get<Application[]>('/applications/calendar', {
    params: { year, month }
  })
  return data
}

export async function updateApplication(
  id: string,
  payload: UpdateApplicationPayload
): Promise<Application> {
  const { data } = await api.put<Application>(`/applications/${id}`, payload)
  return data
}

export async function deleteApplication(id: string): Promise<void> {
  await api.delete(`/applications/${id}`)
}
