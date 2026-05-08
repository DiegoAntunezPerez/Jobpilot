import { z } from 'zod'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { chatComplete } from '../lib/ai/openai.client'
import { createError } from '../middlewares/error.middleware'

export const summarizeJobSchema = z.object({
  jobTitle: z.string().min(1),
  company: z.string().optional(),
  description: z.string().min(10, 'La descripción es demasiado corta').max(8000)
})

export const matchProfileSchema = z.object({
  jobTitle: z.string().min(1),
  description: z.string().min(10).max(8000),
  cvText: z.string().min(10, 'El CV es demasiado corto').max(15000),
  skills: z.array(z.string()).optional()
})

export const hrMessageSchema = z.object({
  jobTitle: z.string().min(1),
  company: z.string().optional(),
  description: z.string().min(10).max(8000),
  candidateName: z.string().min(1),
  cvText: z.string().min(10).max(15000)
})

// ── Resumen de oferta ─────────────────────────────────────

export async function summarizeJob(
  data: z.infer<typeof summarizeJobSchema>
): Promise<string> {
  ensureAiAvailable()

  const system = `Eres un experto en recursos humanos español. 
Analiza ofertas de trabajo y proporciona resúmenes claros y concisos en español.
Responde siempre en español de España.`

  const user = `Analiza la siguiente oferta de trabajo y proporciona un resumen en exactamente 5 puntos clave.
Formato: lista numerada, cada punto en una línea.
Incluye: responsabilidades principales, requisitos clave, tecnologías/skills, tipo de empresa, y por qué puede ser interesante.

Oferta: ${data.jobTitle} en ${data.company ?? 'empresa'}
Descripción:
${data.description.slice(0, 4000)}`

  return withRetry(() => chatComplete(system, user, 600))
}

// ── Análisis de encaje con perfil ─────────────────────────

export async function matchProfile(
  data: z.infer<typeof matchProfileSchema>
): Promise<string> {
  ensureAiAvailable()

  const system = `Eres un experto en selección de personal y desarrollo de carrera.
Analiza si un candidato encaja con una oferta de trabajo.
Responde siempre en español de España con un análisis profesional y honesto.`

  const userSkills = data.skills?.join(', ') ?? 'no especificadas'

  const user = `Analiza el encaje entre el candidato y la siguiente oferta.

=== OFERTA ===
Título: ${data.jobTitle}
Descripción: ${data.description.slice(0, 2000)}

=== PERFIL DEL CANDIDATO ===
Skills: ${userSkills}
CV: ${data.cvText.slice(0, 2000)}

Proporciona:
1. PUNTUACIÓN DE ENCAJE (0-100%)
2. FORTALEZAS del candidato para este puesto
3. GAPS o áreas de mejora
4. RECOMENDACIÓN final (Aplicar / Aplicar con adaptación / No recomendado)`

  return withRetry(() => chatComplete(system, user, 800))
}

// ── Mensaje para RRHH ─────────────────────────────────────

export async function generateHrMessage(
  data: z.infer<typeof hrMessageSchema>
): Promise<string> {
  ensureAiAvailable()

  const system = `Eres un experto en comunicación profesional y búsqueda de empleo.
Redactas mensajes de candidatura personalizados, profesionales y efectivos en español de España.`

  const user = `Escribe un mensaje profesional de candidatura (tipo LinkedIn InMail o email) para:

Candidato: ${data.candidateName}
Puesto: ${data.jobTitle}
Empresa: ${data.company ?? 'la empresa'}

Descripción del puesto:
${data.description.slice(0, 1500)}

CV del candidato:
${data.cvText.slice(0, 1500)}

El mensaje debe:
- Tener tono profesional pero cercano
- Destacar 2-3 puntos de valor del candidato
- Ser conciso (máximo 200 palabras)
- Terminar con llamada a la acción
- Estar en español de España`

  return withRetry(() => chatComplete(system, user, 500))
}

// ── Extracción de perfil desde CV o portfolio ─────────────

export const extractProfileSchema = z.object({
  cvText: z.string().min(10).max(20000).optional(),
  portfolioUrl: z.string().url('URL inválida').max(500).optional()
}).refine((d) => d.cvText || d.portfolioUrl, {
  message: 'Debes proporcionar el texto del CV o una URL de portfolio'
})

export interface ExtractedProfile {
  skills: string[]
  name: string | null
  location: string | null
  summary: string
}

async function fetchPortfolioText(url: string): Promise<string> {
  const { data: html } = await axios.get<string>(url, {
    timeout: 10_000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobPilot/1.0)' }
  })
  const $ = cheerio.load(html)
  $('script, style, nav, footer, header, aside, noscript').remove()
  return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 8000)
}

export async function extractProfile(
  data: z.infer<typeof extractProfileSchema>
): Promise<ExtractedProfile> {
  ensureAiAvailable()

  let sourceText = data.cvText ?? ''

  if (data.portfolioUrl) {
    try {
      const webText = await fetchPortfolioText(data.portfolioUrl)
      sourceText = sourceText
        ? `${sourceText}\n\n--- Portfolio ---\n${webText}`
        : webText
    } catch {
      if (!sourceText) {
        throw createError(
          'No se pudo acceder a la URL del portfolio. Comprueba que es pública y vuelve a intentarlo.',
          422
        )
      }
      // Si hay cvText, continúa con él aunque el portfolio falle
    }
  }

  const system = `Eres un extractor de información de perfiles profesionales.
Analiza el texto y extrae datos estructurados.
Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin bloques de código, sin explicaciones.`

  const user = `Extrae la información profesional del siguiente texto y devuelve exactamente este JSON:
{
  "skills": ["tecnología1", "tecnología2"],
  "name": "Nombre Apellidos o null",
  "location": "Ciudad, País o null",
  "summary": "Resumen profesional en 2-3 líneas destacando experiencia y especialidad"
}

Instrucciones:
- skills: solo tecnologías, lenguajes, frameworks y herramientas técnicas (no soft skills). En minúsculas. Máximo 20.
- name: nombre completo si aparece claramente, si no null
- location: ciudad o región si aparece, si no null
- summary: 2-3 frases concisas sobre el perfil profesional

Texto a analizar:
${sourceText.slice(0, 6000)}`

  const raw = await withRetry(() => chatComplete(system, user, 800))

  try {
    const parsed = JSON.parse(raw.trim()) as ExtractedProfile
    return {
      skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 20) : [],
      name: parsed.name ?? null,
      location: parsed.location ?? null,
      summary: parsed.summary ?? ''
    }
  } catch {
    throw createError('La IA devolvió una respuesta inesperada. Inténtalo de nuevo.', 500)
  }
}

// ── Helpers ───────────────────────────────────────────────

function ensureAiAvailable(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw createError(
      'La integración con IA no está configurada en este servidor',
      503
    )
  }
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout IA')), 30_000)
        )
      ])
    } catch (err: unknown) {
      if (i === attempts - 1) throw err
      const delay = (i + 1) * 1000
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw createError('Error en el servicio de IA', 500)
}
