import { JobModalidad } from '../types/job.types'

/**
 * Infiere la modalidad de trabajo a partir del texto de la descripción y el título.
 */
export function normalizeModalidad(
  description: string,
  title: string = ''
): JobModalidad {
  const text = `${title} ${description}`.toLowerCase()

  const remotoPhrases = [
    'teletrabajo',
    'trabajo remoto',
    'remote',
    '100% remoto',
    'full remote',
    'trabajo desde casa',
    'en remoto',
    'completamente remoto'
  ]
  const hibridoPhrases = [
    'híbrido',
    'hibrido',
    'hybrid',
    'modelo híbrido',
    'mixto',
    'semipresencial',
    'parte en remoto',
    'parcialmente remoto'
  ]
  const presencialPhrases = [
    'presencial',
    'en oficina',
    'incorporación inmediata en',
    'trabajo en oficina'
  ]

  if (remotoPhrases.some((p) => text.includes(p))) return 'remoto'
  if (hibridoPhrases.some((p) => text.includes(p))) return 'hibrido'
  if (presencialPhrases.some((p) => text.includes(p))) return 'presencial'

  return 'no_especificado'
}
