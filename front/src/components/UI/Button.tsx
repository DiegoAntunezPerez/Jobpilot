import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f1117] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

    const variants = {
      primary:
        'bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500 shadow-lg shadow-indigo-500/20',
      secondary:
        'bg-[#1e2535] hover:bg-[#252d42] text-slate-200 border border-[#2d3448] focus:ring-slate-500',
      ghost:
        'hover:bg-[#1e2535] text-slate-300 hover:text-white focus:ring-slate-500',
      danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
      outline:
        'border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 focus:ring-indigo-500'
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-6 py-3'
    }

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className='size-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
