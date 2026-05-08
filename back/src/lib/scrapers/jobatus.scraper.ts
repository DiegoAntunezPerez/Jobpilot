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

export async function searchJobatus(
  filters: JobSearchFilters
): Promise<NormalizedJob[]> {
  try {
    const query = (filters.query ?? 'desarrollador')
      .toLowerCase()
      .replace(/\s+/g, '-')
    const PAGES_TO_FETCH = 5

    const pageResults = await Promise.allSettled(
      Array.from({ length: PAGES_TO_FETCH }, (_, i) => i + 1).map((page) => {
        const url =
          page === 1
            ? `https://www.jobatus.es/trabajo-${encodeURIComponent(query)}/`
            : `https://www.jobatus.es/trabajo-${encodeURIComponent(query)}/${page}/`
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

      $('div.result').each((_i, el) => {
        const $el = $(el)
        const titleEl = $el
          .find('p.jobtitle a[href*="/oferta-trabajo/"]')
          .first()
        const title = titleEl.text().trim()
        const relUrl = titleEl.attr('href') ?? ''
        if (!title || !relUrl) return

        const company = $el
          .find('span.company')
          .text()
          .replace(/\s+/g, ' ')
          .trim()
        const location = $el
          .find('span.location')
          .text()
          .replace(/\s+/g, ' ')
          .trim()
        const description = $el.find('div.snippet p').text().trim()

        jobs.push({
          id: `jobatus-${relUrl.replace(/[^a-z0-9]/gi, '').slice(-12)}`,
          portal: 'jobatus',
          title,
          company: company || 'Empresa desconocida',
          location: location || 'España',
          salary: undefined,
          modalidad: normalizeModalidad(description + ' ' + location, title),
          skills: [],
          description,
          urlOriginal: `https://www.jobatus.es${relUrl}`
        })
      })
    }

    return jobs
  } catch (err) {
    console.error('[Jobatus] Error en scraping:', err)
    return []
  }
}
