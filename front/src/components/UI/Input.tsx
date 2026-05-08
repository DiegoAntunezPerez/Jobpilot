import clsx from 'clsx'
import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: LucideIcon
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, className, ...props }, ref) => {
    return (
      <div className='flex flex-col gap-1'>
        {label && (
          <label className='text-xs font-medium text-slate-400 uppercase tracking-wide'>
            {label}
          </label>
        )}
        <div className='relative'>
          {Icon && (
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'>
              <Icon size={16} />
            </span>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full bg-[#161b27] border border-[#2d3448] rounded-lg text-sm text-slate-200 placeholder-slate-500',
              'focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors',
              'px-3 py-2',
              Icon && 'pl-9',
              error && 'border-red-500/70 focus:border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className='text-xs text-red-400'>{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
