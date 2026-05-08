import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Job } from '../types/job.types'
import { Badge } from '../components/UI/Badge'
import { Button } from '../components/UI/Button'
import { Spinner } from '../components/UI/Spinner'
import { Modal } from '../components/UI/Modal'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Banknote,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Copy
} from 'lucide-react'
import {
  MODALIDAD_COLORS,
  MODALIDAD_LABELS,
  PORTAL_COLORS,
  PORTAL_LABELS,
  formatRelativeDate,
  computeMatchScore
} from '../utils/format.utils'
import { useJobsStore } from '../store/useJobsStore'
import { useApplicationsStore } from '../store/useApplicationsStore'
import { useAuthStore } from '../store/useAuthStore'
import * as aiService from '../services/ai.service'
import * as jobsService from '../services/jobs.service'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { selectedJob } = useJobsStore()
  const { applications, addApplication } = useApplicationsStore()
  const { user, isAuthenticated } = useAuthStore()

  const [job, setJob] = useState<Job | null>(selectedJob)
  const [isLoadingJob, setIsLoadingJob] = useState(!selectedJob)
  const [aiResult, setAiResult] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiModal, setAiModal] = useState<'summary' | 'match' | 'hr' | null>(
    null
  )

  const isApplied = applications.some((a) => a.jobId === id)
  const matchScore =
    job && user?.skills?.length && job.skills.length
      ? computeMatchScore(job.skills, user.skills)
      : null

  useEffect(() => {
    if (!job && id) {
      setIsLoadingJob(true)
      jobsService
        .getJobById(id)
        .then(setJob)
        .catch(() => toast.error('Oferta no encontrada'))
        .finally(() => setIsLoadingJob(false))
    }
  }, [id])

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!job) return
    if (isApplied) {
      toast('Ya registraste esta oferta', { icon: 'ℹ️' })
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
      toast.error('Error al registrar')
    }
  }

  const runAI = async (type: 'summary' | 'match' | 'hr') => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!job) return
    setAiModal(type)
    setAiResult('')
    setIsAiLoading(true)

    try {
      let result = ''
      if (type === 'summary') {
        result = await aiService.summarizeJob({
          jobTitle: job.title,
          company: job.company,
          description: job.description
        })
      } else if (type === 'match') {
        if (!user?.cvText) {
          toast.error('Añade tu CV en el perfil primero')
          setAiModal(null)
          setIsAiLoading(false)
          return
        }
        result = await aiService.matchProfile({
          jobTitle: job.title,
          description: job.description,
          cvText: user.cvText,
          skills: user.skills
        })
      } else {
        if (!user?.cvText) {
          toast.error('Añade tu CV en el perfil primero')
          setAiModal(null)
          setIsAiLoading(false)
          return
        }
        result = await aiService.generateHrMessage({
          jobTitle: job.title,
          company: job.company,
          description: job.description,
          candidateName: user.name,
          cvText: user.cvText
        })
      }
      setAiResult(result)
    } catch {
      toast.error('Error en el servicio de IA')
    } finally {
      setIsAiLoading(false)
    }
  }

  if (isLoadingJob) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Spinner size='lg' />
      </div>
    )
  }

  if (!job) {
    return (
      <div className='text-center py-16'>
        <p className='text-slate-400'>Oferta no encontrada</p>
        <Button
          variant='secondary'
          onClick={() => navigate('/')}
          className='mt-4'
        >
          Volver a ofertas
        </Button>
      </div>
    )
  }

  return (
    <div className='max-w-3xl mx-auto space-y-6'>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className='flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors'
      >
        <ArrowLeft size={15} />
        Volver
      </button>

      {/* Header card */}
      <div className='bg-[#161b27] border border-[#2d3448] rounded-2xl p-6 space-y-4'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-xl font-bold text-white mb-2'>{job.title}</h1>
            <div className='flex items-center gap-1.5 text-slate-400 text-sm mb-3'>
              <Building2 size={14} />
              <span>{job.company}</span>
            </div>
            <div className='flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500'>
              <span className='flex items-center gap-1'>
                <MapPin size={11} /> {job.location}
              </span>
              {job.salary && (
                <span className='flex items-center gap-1 text-emerald-500'>
                  <Banknote size={11} /> {job.salary}
                </span>
              )}
              {job.publishedAt && (
                <span className='flex items-center gap-1'>
                  <Clock size={11} /> {formatRelativeDate(job.publishedAt)}
                </span>
              )}
            </div>
          </div>
          <div className='flex flex-col items-end gap-2 flex-shrink-0'>
            {matchScore !== null && (
              <span
                className={clsx(
                  'text-xs font-bold px-2 py-1 rounded-lg border',
                  matchScore >= 70
                    ? 'text-green-400 bg-green-500/10 border-green-500/20'
                    : matchScore >= 40
                      ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                      : 'text-slate-500 bg-slate-800/60 border-slate-700/30'
                )}
              >
                {matchScore}% match
              </span>
            )}
            {isApplied && (
              <CheckCircle2 size={22} className='text-indigo-400' />
            )}
          </div>
        </div>

        {/* Badges */}
        <div className='flex flex-wrap gap-1.5'>
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
          {job.skills.map((skill) => (
            <Badge
              key={skill}
              className='bg-slate-800/80 text-slate-400 border-slate-700/50'
            >
              {skill}
            </Badge>
          ))}
        </div>

        {/* Action buttons */}
        <div className='flex flex-wrap gap-2 pt-2'>
          <Button
            onClick={handleApply}
            variant={isApplied ? 'secondary' : 'primary'}
          >
            {isApplied ? '✓ Aplicado' : 'Registrar aplicación'}
          </Button>
          <Button
            variant='secondary'
            onClick={() =>
              window.open(job.urlOriginal, '_blank', 'noopener,noreferrer')
            }
          >
            <ExternalLink size={14} />
            Ver en {PORTAL_LABELS[job.portal] ?? 'portal'}
          </Button>
        </div>
      </div>

      {/* AI Section */}
      <div className='bg-[#161b27] border border-[#2d3448] rounded-2xl p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <Sparkles size={16} className='text-indigo-400' />
          <h2 className='font-semibold text-white'>Análisis con IA</h2>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' size='sm' onClick={() => runAI('summary')}>
            Resumen de oferta
          </Button>
          <Button variant='outline' size='sm' onClick={() => runAI('match')}>
            Análisis de encaje
          </Button>
          <Button variant='outline' size='sm' onClick={() => runAI('hr')}>
            Mensaje para RRHH
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className='bg-[#161b27] border border-[#2d3448] rounded-2xl p-6'>
        <h2 className='font-semibold text-white mb-4'>
          Descripción del puesto
        </h2>
        <div className='prose prose-invert prose-sm max-w-none'>
          <p className='text-slate-300 text-sm leading-relaxed whitespace-pre-wrap'>
            {job.description}
          </p>
        </div>
      </div>

      {/* AI Modal */}
      <Modal
        isOpen={aiModal !== null}
        onClose={() => {
          setAiModal(null)
          setAiResult('')
        }}
        title={
          aiModal === 'summary'
            ? 'Resumen de la oferta'
            : aiModal === 'match'
              ? 'Análisis de encaje con tu perfil'
              : 'Mensaje personalizado para RRHH'
        }
        size='lg'
      >
        {isAiLoading ? (
          <div className='flex flex-col items-center gap-3 py-8'>
            <Spinner />
            <p className='text-sm text-slate-400 animate-pulse'>
              Analizando con IA...
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='bg-[#1e2535] rounded-xl p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto'>
              {aiResult || 'Sin resultado'}
            </div>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => {
                navigator.clipboard.writeText(aiResult)
                toast.success('Copiado al portapapeles')
              }}
            >
              <Copy size={13} />
              Copiar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
