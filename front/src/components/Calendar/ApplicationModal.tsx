import { useState } from 'react'
import { Modal } from '../UI/Modal'
import { Button } from '../UI/Button'
import { Select } from '../UI/Select'
import type { Application, ApplicationStatus } from '../../types/application.types'
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '../../types/application.types'
import { useApplicationsStore } from '../../store/useApplicationsStore'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ExternalLink, Trash2 } from 'lucide-react'
import { Badge } from '../UI/Badge'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface ApplicationModalProps {
  application: Application
  onClose: () => void
}

const STATUS_OPTIONS = Object.entries(APPLICATION_STATUS_LABELS).map(
  ([value, label]) => ({
    value,
    label
  })
)

export function ApplicationModal({
  application,
  onClose
}: ApplicationModalProps) {
  const [status, setStatus] = useState<ApplicationStatus>(application.status)
  const [notes, setNotes] = useState(application.notes ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { updateApplication, removeApplication } = useApplicationsStore()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateApplication(application._id, { status, notes })
      toast.success('Actualizado correctamente')
      onClose()
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta aplicación?')) return
    setIsDeleting(true)
    try {
      await removeApplication(application._id)
      toast.success('Aplicación eliminada')
      onClose()
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal isOpen title='Detalle de aplicación' onClose={onClose} size='md'>
      <div className='space-y-4'>
        {/* Job info */}
        <div>
          <h3 className='font-semibold text-white text-base'>
            {application.jobTitle}
          </h3>
          <p className='text-sm text-slate-400'>{application.company}</p>
          {application.location && (
            <p className='text-xs text-slate-500 mt-0.5'>
              {application.location}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className='flex items-center gap-3 text-xs text-slate-500'>
          <span>
            Aplicado:{' '}
            {format(parseISO(application.dateApplied), "d 'de' MMMM yyyy", {
              locale: es
            })}
          </span>
          <Badge
            className={clsx(
              'text-[10px]',
              APPLICATION_STATUS_COLORS[application.status]
            )}
          >
            {APPLICATION_STATUS_LABELS[application.status]}
          </Badge>
        </div>

        {/* Status */}
        <Select
          label='Estado actual'
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
        />

        {/* Notes */}
        <div className='flex flex-col gap-1'>
          <label className='text-xs font-medium text-slate-400 uppercase tracking-wide'>
            Notas personales
          </label>
          <textarea
            className='w-full bg-[#1e2535] border border-[#2d3448] rounded-lg text-sm text-slate-200 placeholder-slate-500 px-3 py-2 focus:outline-none focus:border-indigo-500 resize-none'
            rows={3}
            placeholder='Añade notas sobre el proceso...'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={2000}
          />
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2 pt-2'>
          <Button onClick={handleSave} isLoading={isSaving} className='flex-1'>
            Guardar
          </Button>
          {application.urlOriginal && (
            <Button
              variant='secondary'
              onClick={() =>
                window.open(
                  application.urlOriginal,
                  '_blank',
                  'noopener,noreferrer'
                )
              }
            >
              <ExternalLink size={14} />
            </Button>
          )}
          <Button
            variant='danger'
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </Modal>
  )
}
