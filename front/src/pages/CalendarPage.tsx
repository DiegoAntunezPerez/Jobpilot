import { useState } from 'react'
import { Calendar } from '../components/Calendar/Calendar'
import { ApplicationModal } from '../components/Calendar/ApplicationModal'
import { useApplicationsStore } from '../store/useApplicationsStore'
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  type Application
} from '../types/application.types'
import { Badge } from '../components/UI/Badge'
import clsx from 'clsx'

const STATUS_ORDER = [
  'aplicado',
  'en_proceso',
  'primera_entrevista',
  'segunda_entrevista',
  'oferta',
  'rechazado'
] as const

export function CalendarPage() {
  const { applications } = useApplicationsStore()
  const [editingApp, setEditingApp] = useState<Application | null>(null)

  const stats = STATUS_ORDER.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length
  }))

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-white'>
          Calendario de aplicaciones
        </h1>
      </div>

      {/* Stats */}
      <div className='flex flex-wrap gap-2'>
        {stats
          .filter((s) => s.count > 0)
          .map(({ status, count }) => (
            <div
              key={status}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium',
                APPLICATION_STATUS_COLORS[status]
              )}
            >
              <span>{APPLICATION_STATUS_LABELS[status]}</span>
              <span className='font-bold'>{count}</span>
            </div>
          ))}
        {applications.length === 0 && (
          <p className='text-slate-500 text-sm'>
            Aún no tienes aplicaciones registradas. Marca ofertas como
            "Aplicado" para verlas aquí.
          </p>
        )}
      </div>

      {/* Calendar */}
      <div className='bg-[#161b27] border border-[#2d3448] rounded-2xl p-4 sm:p-6'>
        <Calendar />
      </div>

      {/* Recent applications list */}
      {applications.length > 0 && (
        <div className='bg-[#161b27] border border-[#2d3448] rounded-2xl p-4 sm:p-6'>
          <h2 className='font-semibold text-white mb-4'>
            Aplicaciones recientes
          </h2>
          <div className='space-y-2'>
            {applications.slice(0, 10).map((app) => (
              <div
                key={app._id}
                onClick={() => setEditingApp(app)}
                className='flex items-start justify-between py-2.5 border-b border-[#2d3448]/50 last:border-0 cursor-pointer hover:bg-white/[0.02] rounded-lg px-2 -mx-2 transition-colors'
              >
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium text-slate-200 truncate'>
                    {app.jobTitle}
                  </p>
                  <p className='text-xs text-slate-500'>
                    {app.company} · {app.portal}
                  </p>
                  {app.notes && (
                    <p className='text-xs text-slate-400 mt-0.5 line-clamp-1'>
                      📝 {app.notes}
                    </p>
                  )}
                </div>
                <Badge
                  className={clsx(
                    'ml-3 flex-shrink-0 text-[10px] mt-0.5',
                    APPLICATION_STATUS_COLORS[app.status]
                  )}
                >
                  {APPLICATION_STATUS_LABELS[app.status]}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingApp && (
        <ApplicationModal
          application={editingApp}
          onClose={() => setEditingApp(null)}
        />
      )}
    </div>
  )
}
