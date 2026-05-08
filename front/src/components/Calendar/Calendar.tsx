import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApplicationsStore } from '../../store/useApplicationsStore'
import type { Application } from '../../types/application.types'
import { APPLICATION_STATUS_COLORS } from '../../types/application.types'
import { ApplicationModal } from './ApplicationModal'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  parseISO,
  isToday
} from 'date-fns'
import { es } from 'date-fns/locale'
import clsx from 'clsx'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const { calendarApps, fetchCalendar, isLoading } = useApplicationsStore()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  useEffect(() => {
    fetchCalendar(year, month)
  }, [year, month])

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  })

  // Offset for Monday-first calendar
  const firstDayOffset = (getDay(startOfMonth(currentDate)) + 6) % 7

  const getAppsForDay = (day: Date): Application[] =>
    calendarApps.filter((app) => isSameDay(parseISO(app.dateApplied), day))

  const prev = () => setCurrentDate(new Date(year, month - 2, 1))
  const next = () => setCurrentDate(new Date(year, month, 1))

  return (
    <div className='space-y-4'>
      {/* Calendar header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-white capitalize'>
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className='flex items-center gap-1'>
          <button
            onClick={prev}
            className='p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2535] transition-colors'
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className='px-3 py-1.5 text-xs rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2535] transition-colors'
          >
            Hoy
          </button>
          <button
            onClick={next}
            className='p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2535] transition-colors'
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className='grid grid-cols-7 gap-1'>
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className='text-center text-xs font-medium text-slate-500 py-2'
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className='grid grid-cols-7 gap-1'>
        {/* Offset cells */}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`offset-${i}`} />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const apps = getAppsForDay(day)
          const today = isToday(day)

          return (
            <div
              key={day.toISOString()}
              className={clsx(
                'min-h-[80px] p-1.5 rounded-lg border transition-colors',
                today
                  ? 'border-indigo-500/50 bg-indigo-500/5'
                  : 'border-[#2d3448]/60 bg-[#161b27]/60',
                apps.length > 0 && 'cursor-pointer hover:border-indigo-500/40'
              )}
            >
              <span
                className={clsx(
                  'text-xs font-medium block text-center mb-1 w-6 h-6 flex items-center justify-center rounded-full mx-auto',
                  today ? 'bg-indigo-600 text-white' : 'text-slate-400'
                )}
              >
                {format(day, 'd')}
              </span>
              <div className='space-y-0.5'>
                {apps.slice(0, 2).map((app) => (
                  <button
                    key={app._id}
                    onClick={() => setSelectedApp(app)}
                    className={clsx(
                      'w-full text-left text-[10px] px-1.5 py-0.5 rounded border truncate',
                      APPLICATION_STATUS_COLORS[app.status]
                    )}
                  >
                    {app.company}
                  </button>
                ))}
                {apps.length > 2 && (
                  <p className='text-[10px] text-slate-500 text-center'>
                    +{apps.length - 2} más
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {isLoading && (
        <p className='text-center text-xs text-slate-500 animate-pulse'>
          Cargando...
        </p>
      )}

      {/* Modal */}
      {selectedApp && (
        <ApplicationModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  )
}
