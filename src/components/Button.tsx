import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'

export type ButtonVariant = 'primary' | 'soft' | 'outline' | 'ghost' | 'crisis'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover shadow-soft',
  soft: 'bg-primary-soft text-primary-ink hover:brightness-[0.97]',
  outline: 'border border-line-strong text-ink hover:bg-surface-2',
  ghost: 'text-ink-soft hover:bg-surface-2 hover:text-ink',
  crisis: 'bg-crisis text-on-crisis hover:brightness-110 shadow-soft',
}

const SIZES: Record<ButtonSize, string> = {
  // Minst 44 px höga överallt — träffytan ska duga även med darrig hand.
  sm: 'min-h-[2.75rem] px-4 text-[0.9375rem] rounded-full',
  md: 'min-h-[3rem] px-6 text-base rounded-full',
  lg: 'min-h-[3.5rem] px-8 text-lg rounded-full',
}

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold transition-[background-color,color,transform,filter] duration-200 ease-[var(--ease-calm)] active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40 select-none'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
}: CommonProps & { to: string }) {
  return (
    <Link
      to={to}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
    >
      {children}
    </Link>
  )
}
