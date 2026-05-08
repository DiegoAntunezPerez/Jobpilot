import { useEffect } from 'react'
import { SearchFilters } from '../components/Filters/SearchFilters'
import { JobCard } from '../components/JobCard/JobCard'
import { JobCardSkeleton } from '../components/JobCard/JobCardSkeleton'
import { Button } from '../components/UI/Button'
import { useJobsStore } from '../store/useJobsStore'
import { Frown } from 'lucide-react'

export function HomePage() {
  const {
    jobs,
    isLoading,
    error,
    total,
    page,
    totalPages,
    search,
    loadNextPage
  } = useJobsStore()

  useEffect(() => {
    if (jobs.length === 0) {
      search({ query: 'desarrollador' })
    }
  }, [])

  return (
    <div className='space-y-6'>
      {/* Hero */}
      <div className='text-center py-8'>
        <h1 className='text-3xl sm:text-4xl font-bold mb-3'>
          <span className='gradient-text'>Encuentra tu próximo trabajo</span>
        </h1>
        <p className='text-slate-400 max-w-xl mx-auto text-sm sm:text-base'>
          Agrega ofertas de Adzuna, Tecnoempleo, Jobatus y más. Todo en un solo
          lugar, con análisis de IA y seguimiento inteligente.
        </p>
      </div>

      {/* Filters */}
      <SearchFilters />

      {/* Results */}
      {error && (
        <div className='text-center py-12 text-red-400'>
          <p>{error}</p>
          <Button variant='secondary' onClick={() => search()} className='mt-4'>
            Reintentar
          </Button>
        </div>
      )}

      {isLoading && jobs.length === 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 && !isLoading ? (
        <div className='text-center py-16'>
          <Frown className='mx-auto text-slate-600 mb-3' size={40} />
          <p className='text-slate-400 font-medium'>
            No se encontraron ofertas
          </p>
          <p className='text-slate-600 text-sm mt-1'>
            Prueba con otros términos o ajusta los filtros
          </p>
        </div>
      ) : (
        <>
          {/* Contador de resultados */}
          <p className='text-sm text-slate-500'>
            Mostrando{' '}
            <span className='text-slate-400 font-medium'>
              {jobs.length.toLocaleString('es-ES')}
            </span>{' '}
            de{' '}
            <span className='text-slate-400 font-medium'>
              {total.toLocaleString('es-ES')}
            </span>{' '}
            ofertas
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <JobCardSkeleton key={`sk-${i}`} />
              ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center gap-3 pt-4'>
              <p className='text-sm text-slate-500 self-center'>
                Página {page} de {totalPages}
              </p>
              {page < totalPages && (
                <Button
                  variant='secondary'
                  onClick={loadNextPage}
                  isLoading={isLoading}
                >
                  Cargar más
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
