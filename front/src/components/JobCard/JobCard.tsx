import type { Job } from '../../types/job.types'
import { Badge } from '../UI/Badge'
import { Button } from '../UI/Button'
import {
  Building2,
  MapPin,
  Clock,
  Banknote,
  ExternalLink,
  CheckCircle2
} from 'lucide-react'
import {
  formatRelativeDate,
  MODALIDAD_COLORS,
  MODALIDAD_LABELS,
  PORTAL_COLORS,
  PORTAL_LABELS,
  truncate,
  computeMatchScore
} from '../../utils/format.utils'
import { useNavigate } from 'react-router-dom'
import { useApplicationsStore } from '../../store/useApplicationsStore'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate()
  const { applications, addApplication } = useApplicationsStore()
  const { user } = useAuthStore()
  const isApplied = applications.some((a) => a.jobId === job.id)
  const matchScore =
    user?.skills?.length && job.skills.length
      ? computeMatchScore(job.skills, user.skills)
      : null

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isApplied) {
      toast('Ya has registrado esta oferta', { icon: 'ℹ️' })
      return
    }
    try {
      await addApplication({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        portal: job.portal,
        urlOriginal: job.urlOriginal,
        salary: job.salary
      })
      toast.success('Añadido al calendario')
    } catch {
      toast.error('No se pudo registrar. Inicia sesión primero.')
    }
  }

  return (
    <article
      className={clsx(
        'group bg-[#161b27] border border-[#2d3448] rounded-xl p-5 cursor-pointer card-hover animate-fade-in',
        isApplied && 'border-indigo-500/30'
      )}
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      {/* Top row */}
      <div className='flex items-start justify-between gap-3 mb-3'>
        <div className='flex-1 min-w-0'>
          <h3 className='font-semibold text-white text-base leading-snug mb-1 group-hover:text-indigo-300 transition-colors'>
            {job.title}
          </h3>
          <div className='flex items-center gap-1.5 text-slate-400 text-sm'>
            <Building2 size={13} />
            <span className='truncate'>{job.company}</span>
          </div>
        </div>

        <div className='flex flex-col items-end gap-1.5 flex-shrink-0'>
          {matchScore !== null && (
            <span
              className={clsx(
                'text-[11px] font-bold px-1.5 py-0.5 rounded border',
                matchScore >= 70
                  ? 'text-green-400 bg-green-500/10 border-green-500/20'
                  : matchScore >= 40
                    ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                    : 'text-slate-500 bg-slate-800/60 border-slate-700/30'
              )}
            >
              {matchScore}%
            </span>
          )}
          {isApplied && (
            <CheckCircle2 size={18} className='text-indigo-400 mt-0.5' />
          )}
        </div>
      </div>

      {/* Meta */}
      <div className='flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 mb-3'>
        <span className='flex items-center gap-1'>
          <MapPin size={11} />
          {job.location}
        </span>
        {job.salary && (
          <span className='flex items-center gap-1 text-emerald-500'>
            <Banknote size={11} />
            {job.salary}
          </span>
        )}
        {job.publishedAt && (
          <span className='flex items-center gap-1'>
            <Clock size={11} />
            {formatRelativeDate(job.publishedAt)}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className='flex flex-wrap gap-1.5 mb-4'>
        {job.modalidad !== 'no_especificado' && (
          <Badge className={MODALIDAD_COLORS[job.modalidad]}>
            {MODALIDAD_LABELS[job.modalidad]}
          </Badge>
        )}
        <Badge
          className={clsx(PORTAL_COLORS[job.portal], 'border-transparent')}
        >
          {PORTAL_LABELS[job.portal] ?? job.portal}
        </Badge>
        {job.skills.slice(0, 4).map((skill) => (
          <Badge
            key={skill}
            className='bg-slate-800/80 text-slate-400 border-slate-700/50'
          >
            {skill}
          </Badge>
        ))}
        {job.skills.length > 4 && (
          <Badge className='bg-slate-800/60 text-slate-500 border-slate-700/30'>
            +{job.skills.length - 4}
          </Badge>
        )}
      </div>

      {/* Description */}
      <p className='text-xs text-slate-500 line-clamp-2 mb-4'>
        {truncate(job.description, 180)}
      </p>

      {/* Actions */}
      <div
        className='flex items-center gap-2'
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          size='sm'
          onClick={handleApply}
          variant={isApplied ? 'secondary' : 'primary'}
        >
          {isApplied ? '✓ Aplicado' : 'Registrar aplicación'}
        </Button>
        <Button
          size='sm'
          variant='ghost'
          onClick={() =>
            window.open(job.urlOriginal, '_blank', 'noopener,noreferrer')
          }
        >
          <ExternalLink size={13} />
          Ver oferta
        </Button>
      </div>
    </article>
  )
}
