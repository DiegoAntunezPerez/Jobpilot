import api from './api'

export interface SummarizeJobPayload {
  jobTitle: string
  company?: string
  description: string
}

export interface MatchProfilePayload {
  jobTitle: string
  description: string
  cvText: string
  skills?: string[]
}

export interface HrMessagePayload {
  jobTitle: string
  company?: string
  description: string
  candidateName: string
  cvText: string
}

export async function summarizeJob(
  payload: SummarizeJobPayload
): Promise<string> {
  const { data } = await api.post<{ result: string }>(
    '/ai/summarize-job',
    payload
  )
  return data.result
}

export async function matchProfile(
  payload: MatchProfilePayload
): Promise<string> {
  const { data } = await api.post<{ result: string }>(
    '/ai/match-profile',
    payload
  )
  return data.result
}

export async function generateHrMessage(
  payload: HrMessagePayload
): Promise<string> {
  const { data } = await api.post<{ result: string }>(
    '/ai/message-for-hr',
    payload
  )
  return data.result
}

export interface ExtractProfilePayload {
  cvText?: string
  portfolioUrl?: string
}

export interface ExtractedProfile {
  skills: string[]
  name: string | null
  location: string | null
  summary: string
}

export async function extractProfile(
  payload: ExtractProfilePayload
): Promise<ExtractedProfile> {
  const { data } = await api.post<ExtractedProfile>(
    '/ai/extract-profile',
    payload
  )
  return data
}
