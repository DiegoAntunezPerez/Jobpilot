import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react'
import { Input } from '../UI/Input'
import { Select } from '../UI/Select'
import { Button } from '../UI/Button'
import { useJobsStore } from '../../store/useJobsStore'
import { useDebounce } from '../../hooks/useDebounce'

const LOCATION_OPTIONS = [
  { value: '', label: 'Toda España' },
  { value: 'Madrid', label: 'Madrid' },
  { value: 'Barcelona', label: 'Barcelona' },
  { value: 'Valencia', label: 'Valencia' },
  { value: 'Sevilla', label: 'Sevilla' },
  { value: 'Málaga', label: 'Málaga' },
  { value: 'Alicante', label: 'Alicante' },
  { value: 'Murcia', label: 'Murcia' },
  { value: 'Zaragoza', label: 'Zaragoza' },
  { value: 'Bilbao', label: 'Bilbao / Vizcaya' },
  { value: 'San Sebastián', label: 'San Sebastián / Guipúzcoa' },
  { value: 'Vitoria', label: 'Vitoria / Álava' },
  { value: 'Pamplona', label: 'Pamplona / Navarra' },
  { value: 'Santander', label: 'Santander / Cantabria' },
  { value: 'Asturias', label: 'Asturias' },
  { value: 'A Coruña', label: 'A Coruña' },
  { value: 'Vigo', label: 'Vigo / Pontevedra' },
  { value: 'León', label: 'León' },
  { value: 'Valladolid', label: 'Valladolid' },
  { value: 'Burgos', label: 'Burgos' },
  { value: 'Salamanca', label: 'Salamanca' },
  { value: 'Toledo', label: 'Toledo' },
  { value: 'Granada', label: 'Granada' },
  { value: 'Córdoba', label: 'Córdoba' },
  { value: 'Cádiz', label: 'Cádiz' },
  { value: 'Palma', label: 'Palma / Baleares' },
  { value: 'Las Palmas', label: 'Las Palmas' },
  { value: 'Tenerife', label: 'Tenerife' }
]

const MODALIDAD_OPTIONS = [
  { value: '', label: 'Cualquier modalidad' },
  { value: 'remoto', label: 'Remoto' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'presencial', label: 'Presencial' }
]

const PORTAL_OPTIONS = [
  { value: '', label: 'Todos los portales' },
  { value: 'adzuna', label: 'Adzuna' },
  { value: 'tecnoempleo', label: 'Tecnoempleo' },
  { value: 'jobatus', label: 'Jobatus' }
]

const DATE_OPTIONS = [
  { value: '', label: 'Cualquier fecha' },
  { value: new Date(Date.now() - 86400000).toISOString(), label: 'Último día' },
  {
    value: new Date(Date.now() - 7 * 86400000).toISOString(),
    label: 'Última semana'
  },
  {
    value: new Date(Date.now() - 30 * 86400000).toISOString(),
    label: 'Último mes'
  }
]

export function SearchFilters() {
  const { filters, search, setFilters, resetFilters, isLoading, total } =
    useJobsStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localQuery, setLocalQuery] = useState(filters.query ?? '')
  const debouncedQuery = useDebounce(localQuery, 500)

  useEffect(() => {
    if (debouncedQuery !== filters.query) {
      setFilters({ query: debouncedQuery })
      search({ query: debouncedQuery })
    }
  }, [debouncedQuery])

  const handleFilterChange = (key: string, value: string | number) => {
    const update = { [key]: value }
    setFilters(update)
    search(update)
  }

  const handleReset = () => {
    setLocalQuery('')
    resetFilters()
    search({
      query: '',
      location: '',
      modalidad: '',
      portal: '',
      dateFrom: '',
      skills: '',
      page: 1
    })
  }

  const hasActiveFilters =
    filters.location ||
    filters.modalidad ||
    filters.portal ||
    filters.dateFrom ||
    filters.skills

  return (
    <div className='space-y-3'>
      {/* Search bar */}
      <div className='flex gap-2'>
        <div className='flex-1'>
          <Input
            icon={Search}
            placeholder='Buscar por puesto, empresa o tecnología...'
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
        </div>
        <Button
          variant='secondary'
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={showAdvanced ? 'border-indigo-500/50 text-indigo-400' : ''}
        >
          <SlidersHorizontal size={15} />
          <span className='hidden sm:block'>Filtros</span>
          {hasActiveFilters && (
            <span className='size-2 bg-indigo-500 rounded-full' />
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant='ghost' onClick={handleReset} title='Limpiar filtros'>
            <X size={15} />
          </Button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className='bg-[#161b27] border border-[#2d3448] rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-fade-in'>
          <Select
            label='Ubicación'
            options={LOCATION_OPTIONS}
            value={filters.location ?? ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
          <Select
            label='Modalidad'
            options={MODALIDAD_OPTIONS}
            value={filters.modalidad ?? ''}
            onChange={(e) => handleFilterChange('modalidad', e.target.value)}
          />
          <Select
            label='Portal'
            options={PORTAL_OPTIONS}
            value={filters.portal ?? ''}
            onChange={(e) => handleFilterChange('portal', e.target.value)}
          />
          <Select
            label='Publicado'
            options={DATE_OPTIONS}
            value={filters.dateFrom ?? ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
          <Input
            label='Skills'
            placeholder='react, node, python...'
            value={filters.skills ?? ''}
            onChange={(e) => handleFilterChange('skills', e.target.value)}
          />
        </div>
      )}

      {/* Results summary */}
      {!isLoading && total > 0 && (
        <p className='text-xs text-slate-500'>
          {total} {total === 1 ? 'oferta encontrada' : 'ofertas encontradas'}
          {filters.location && (
            <span className='ml-1 inline-flex items-center gap-0.5'>
              <MapPin size={10} /> {filters.location}
            </span>
          )}
        </p>
      )}
    </div>
  )
}
