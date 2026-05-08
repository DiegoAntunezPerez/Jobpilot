export type ApplicationStatus =
  | 'aplicado'
  | 'en_proceso'
  | 'primera_entrevista'
  | 'segunda_entrevista'
  | 'oferta'
  | 'rechazado'
  | 'descartado'

export interface Application {
  _id: string
  userId: string
  jobId: string
  jobTitle: string
  company: string
  location?: string
  portal: string
  urlOriginal?: string
  salary?: string
  dateApplied: string
  status: ApplicationStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  aplicado: 'Aplicado',
  en_proceso: 'En proceso',
  primera_entrevista: 'Primera entrevista',
  segunda_entrevista: 'Segunda entrevista',
  oferta: 'Oferta recibida',
  rechazado: 'Rechazado',
  descartado: 'Descartado'
}

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  aplicado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  en_proceso: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  primera_entrevista: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  segunda_entrevista: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  oferta: 'bg-green-500/20 text-green-400 border-green-500/30',
  rechazado: 'bg-red-500/20 text-red-400 border-red-500/30',
  descartado: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}
