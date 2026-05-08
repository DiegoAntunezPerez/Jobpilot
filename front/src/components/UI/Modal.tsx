import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      role='dialog'
      aria-modal='true'
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Panel */}
      <div
        className={clsx(
          'relative w-full bg-[#161b27] border border-[#2d3448] rounded-2xl shadow-2xl animate-fade-in',
          sizes[size]
        )}
      >
        {title && (
          <div className='flex items-center justify-between px-6 py-4 border-b border-[#2d3448]'>
            <h2 className='text-base font-semibold text-white'>{title}</h2>
            <button
              onClick={onClose}
              className='p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2535] transition-colors'
              aria-label='Cerrar'
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className='p-6'>{children}</div>
      </div>
    </div>
  )
}
