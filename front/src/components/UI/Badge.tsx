import clsx from 'clsx'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'outline'
}

export function Badge({
  children,
  className,
  variant = 'outline'
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border',
        variant === 'outline' && 'border-current',
        variant === 'default' && 'border-transparent',
        className
      )}
    >
      {children}
    </span>
  )
}
