import clsx from 'clsx'
import type { SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className='flex flex-col gap-1'>
        {label && (
          <label className='text-xs font-medium text-slate-400 uppercase tracking-wide'>
            {label}
          </label>
        )}
        <div className='relative'>
          <select
            ref={ref}
            className={clsx(
              'w-full appearance-none bg-[#161b27] border border-[#2d3448] rounded-lg text-sm text-slate-200',
              'focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors',
              'px-3 py-2 pr-8',
              error && 'border-red-500/70',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className='bg-[#161b27]'
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'
          />
        </div>
        {error && <p className='text-xs text-red-400'>{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
