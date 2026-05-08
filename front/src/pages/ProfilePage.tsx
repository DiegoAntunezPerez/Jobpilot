import { useState, useRef, useCallback } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { User, MapPin, Code2, FileText, Save, Plus, X, Sparkles, Link as LinkIcon, Upload } from 'lucide-react'
import * as authService from '../services/auth.service'
import * as aiService from '../services/ai.service'
import { extractTextFromPdf } from '../hooks/usePdfExtract'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [name, setName] = useState(user?.name ?? '')
  const [location, setLocation] = useState(user?.location ?? '')
  const [cvText, setCvText] = useState(user?.cvText ?? '')
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl ?? '')
  const [skills, setSkills] = useState<string[]>(user?.skills ?? [])
  const [newSkill, setNewSkill] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePdfFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Solo se aceptan archivos PDF')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede superar 10 MB')
      return
    }
    setIsParsing(true)
    const loadingToast = toast.loading(`Leyendo "${file.name}"...`)
    try {
      const text = await extractTextFromPdf(file)
      if (!text.trim()) {
        toast.dismiss(loadingToast)
        toast.error('No se pudo extraer texto. El PDF puede ser una imagen escaneada.')
        return
      }
      setCvText(text.slice(0, 20000))
      toast.dismiss(loadingToast)
      toast.success(`PDF leído correctamente (${text.length.toLocaleString()} caracteres)`)
    } catch {
      toast.dismiss(loadingToast)
      toast.error('Error al leer el PDF. Inténtalo de nuevo.')
    } finally {
      setIsParsing(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handlePdfFile(file)
    },
    [handlePdfFile]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updated = await authService.updateMe({
        name,
        location,
        cvText,
        portfolioUrl,
        skills
      })
      updateUser(updated)
      toast.success('Perfil actualizado correctamente')
    } catch {
      toast.error('Error al guardar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExtract = async () => {
    if (!cvText.trim() && !portfolioUrl.trim()) {
      toast.error('Añade el texto del CV o la URL de tu portfolio primero')
      return
    }
    setIsExtracting(true)
    const loadingToast = toast.loading('Analizando con IA...')
    try {
      const result = await aiService.extractProfile({
        cvText: cvText.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined
      })

      // Autocompletar campos con lo extraído
      if (result.name && !name) setName(result.name)
      if (result.location && !location) setLocation(result.location)
      if (result.summary && !cvText.trim()) setCvText(result.summary)

      // Merge skills: añadir las nuevas sin duplicar
      if (result.skills.length > 0) {
        setSkills((prev) => {
          const merged = [...prev]
          result.skills.forEach((s) => {
            if (!merged.includes(s)) merged.push(s)
          })
          return merged
        })
      }

      toast.dismiss(loadingToast)
      toast.success(
        `¡Perfil analizado! ${result.skills.length} skills detectadas.`,
        { duration: 4000 }
      )
    } catch (err: unknown) {
      toast.dismiss(loadingToast)
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Error al analizar con IA'
      toast.error(msg)
    } finally {
      setIsExtracting(false)
    }
  }

  const addSkill = () => {
    const skill = newSkill.trim().toLowerCase()
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill])
    }
    setNewSkill('')
  }

  const removeSkill = (skill: string) =>
    setSkills(skills.filter((s) => s !== skill))

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <h1 className='text-2xl font-bold text-white'>Mi perfil</h1>

      {/* Info card */}
      <div className='bg-[#161b27] border border-[#2d3448] rounded-2xl p-6 space-y-4'>
        <h2 className='font-semibold text-white flex items-center gap-2'>
          <User size={16} className='text-indigo-400' />
          Información personal
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Input
            label='Nombre'
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={User}
            placeholder='Tu nombre'
          />
          <Input
            label='Ubicación'
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            icon={MapPin}
            placeholder='Madrid, Barcelona...'
          />
        </div>
        <div>
          <label className='block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1'>
            Email
          </label>
          <p className='text-sm text-slate-400 bg-[#1e2535] border border-[#2d3448] rounded-lg px-3 py-2'>
            {user?.email}
          </p>
        </div>
      </div>

      {/* Skills */}
      <div className='bg-[#161b27] border border-[#2d3448] rounded-2xl p-6 space-y-4'>
        <h2 className='font-semibold text-white flex items-center gap-2'>
          <Code2 size={16} className='text-indigo-400' />
          Skills técnicas
        </h2>
        <div className='flex gap-2'>
          <Input
            placeholder='Añadir skill (ej: react, python...)'
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            className='flex-1'
          />
          <Button variant='secondary' onClick={addSkill}>
            <Plus size={15} />
          </Button>
        </div>
        {skills.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {skills.map((skill) => (
              <span
                key={skill}
                className='flex items-center gap-1.5 text-xs bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-full px-2.5 py-1'
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className='text-indigo-400/60 hover:text-indigo-300'
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CV + Portfolio + Botón IA */}
      <div className='bg-[#161b27] border border-[#2d3448] rounded-2xl p-6 space-y-4'>
        <div className='flex items-center justify-between gap-2 flex-wrap'>
          <h2 className='font-semibold text-white flex items-center gap-2'>
            <FileText size={16} className='text-indigo-400' />
            CV / Portfolio
          </h2>
          <Button
            variant='secondary'
            onClick={handleExtract}
            isLoading={isExtracting}
            className='border-indigo-500/40 text-indigo-400 hover:border-indigo-400 text-xs'
          >
            <Sparkles size={13} />
            Analizar con IA y autocompletar
          </Button>
        </div>

        <p className='text-xs text-slate-500'>
          Pega tu CV o añade la URL de tu portfolio. La IA extraerá tus skills,
          ubicación y resumen, y los rellenará automáticamente. También mejora
          el % de encaje con las ofertas.
        </p>

        {/* Portfolio URL */}
        <Input
          label='URL de tu portfolio / LinkedIn / GitHub / web personal'
          icon={LinkIcon}
          type='url'
          placeholder='https://miportfolio.com  ó  https://linkedin.com/in/...'
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
        />

        {/* Drop zone PDF */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            'flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer transition-colors select-none',
            isDragOver
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
              : 'border-[#2d3448] hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-500 hover:text-slate-400'
          )}
        >
          <Upload size={20} className={isDragOver ? 'text-indigo-400' : ''} />
          <p className='text-sm text-center'>
            {isParsing
              ? 'Leyendo PDF...'
              : isDragOver
                ? 'Suelta el PDF aquí'
                : 'Arrastra tu CV en PDF o haz clic para seleccionarlo'}
          </p>
          <p className='text-xs text-slate-600'>PDF · máx. 10 MB</p>
        </div>
        <input
          ref={fileInputRef}
          type='file'
          accept='application/pdf'
          className='hidden'
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handlePdfFile(file)
            e.target.value = ''
          }}
        />

        {/* CV text */}
        <div>
          <label className='block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5'>
            Texto del CV
          </label>
          <textarea
            className='w-full bg-[#1e2535] border border-[#2d3448] rounded-xl text-sm text-slate-200 placeholder-slate-500 px-4 py-3 focus:outline-none focus:border-indigo-500 resize-y'
            rows={10}
            placeholder='Pega aquí el texto de tu CV o resumen profesional. No hace falta que esté perfectamente formateado, la IA lo interpretará...'
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            maxLength={20000}
          />
          <p className='text-xs text-slate-600 text-right mt-1'>
            {cvText.length} / 20.000 caracteres
          </p>
        </div>
      </div>

      {/* Save */}
      <Button
        onClick={handleSave}
        isLoading={isSaving}
        size='lg'
        className='w-full'
      >
        <Save size={16} />
        Guardar cambios
      </Button>
    </div>
  )
}
