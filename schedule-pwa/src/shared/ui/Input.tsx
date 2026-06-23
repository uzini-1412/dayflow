import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@shared/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
      )}
      <input
        id={id}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none',
          'border-zinc-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
          'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
          className,
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  )
}
