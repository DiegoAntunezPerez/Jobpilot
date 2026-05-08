import axios from 'axios'
import * as cheerio from 'cheerio'
import { NormalizedJob, JobSearchFilters } from '../../types/job.types'
import { normalizeModalidad } from '../normalizer'

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9'
}

export async function searchTecnoempleo(
  filters: JobSearchFilters
): Promise<NormalizedJob[]> {
  try {
    const query = encodeURIComponent(filters.query ?? 'desarrollador')
    const PAGES_TO_FETCH = 5

    const pageResults = await Promise.allSettled(
      Array.from({ length: PAGES_TO_FETCH }, (_, i) => i + 1).map((page) => {
        const url = `https://www.tecnoempleo.com/busqueda-empleo.php?te=${query}&pagina=${page}`
        return axios.get<string>(url, {
          timeout: 10000,
          headers: BROWSER_HEADERS
        })
      })
    )

    const jobs: NormalizedJob[] = []

    for (const result of pageResults) {
      if (result.status !== 'fulfilled') continue
      const $ = cheerio.load(result.value.data)

      $('div.row.fs--15').each((_i, el) => {
        const $el = $(el)
        const titleEl = $el.find('h3 a[href*="/rf-"]')
        const title = titleEl.text().trim()
        const urlOriginal = titleEl.attr('href') ?? ''
        if (!title || !urlOriginal) return

        const company = $el
          .find('a.text-primary.link-muted')
          .first()
          .text()
          .trim()
        const location = $el
          .find('span.d-block.d-lg-none b')
          .first()
          .text()
          .trim()
        const description = $el
          .find('span.hidden-md-down')
          .clone()
          .find('span')
          .remove()
          .end()
          .text()
          .trim()
        const skills = $el
          .find('span.badge.bg-gray-500')
          .map((_j, badge) => $(badge).text().trim())
          .get()

        const mobileSpan = $el.find('span.d-block.d-lg-none').html() ?? ''
        const salaryMatch = mobileSpan.match(/<br>([\d.,€ \-]+b\/a)/i)
        const salary = salaryMatch ? salaryMatch[1].trim() : undefined

        // La fecha aparece como "- DD/MM/YYYY" dentro del span de ubicación
        const dateMatch = mobileSpan.match(/- (\d{2})\/(\d{2})\/(\d{4})/)
        const publishedAt = dateMatch
          ? new Date(
              parseInt(dateMatch[3]),
              parseInt(dateMatch[2]) - 1,
              parseInt(dateMatch[1])
            )
          : undefined

        jobs.push({
          id: `tecnoempleo-${Buffer.from(urlOriginal).toString('base64').slice(-16)}`,
          portal: 'tecnoempleo',
          title,
          company: company || 'Empresa desconocida',
          location: location || 'España',
          salary,
          modalidad: normalizeModalidad(description + ' ' + location, title),
          skills,
          description,
          urlOriginal,
          publishedAt
        })
      })
    }

    return jobs
  } catch (err) {
    console.error('[Tecnoempleo] Error en scraping:', err)
    return []
  }
}
