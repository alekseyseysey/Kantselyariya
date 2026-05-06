import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'outline' | 'ghost' | 'accent' | 'mint'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-[#2B4DD6] text-white hover:bg-[#1e3ab8] shadow-lg shadow-[#2B4DD6]/20 hover:shadow-[#2B4DD6]/40',
  accent:  'bg-[#FF8A3D] text-white hover:bg-[#e67722] shadow-lg shadow-[#FF8A3D]/25 hover:shadow-[#FF8A3D]/45',
  mint:    'bg-[#7DD3C0] text-white hover:bg-[#5bbba6]',
  outline: 'border-2 border-[#2B4DD6] text-[#2B4DD6] hover:bg-[#2B4DD6] hover:text-white',
  ghost:   'text-[#2B4DD6] hover:bg-[#EEF2FF]',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-4 py-2 rounded-lg gap-1.5',
  md: 'text-base px-6 py-3 rounded-xl gap-2',
  lg: 'text-base px-8 py-4 rounded-xl gap-2 font-semibold',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        '-translate-y-0 hover:-translate-y-px active:translate-y-0',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B4DD6]',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span aria-hidden="true">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span aria-hidden="true">{icon}</span>}
        </>
      )}
    </button>
  )
}