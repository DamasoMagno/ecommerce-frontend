'use client'
import { ComponentProps, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ComponentProps<'button'> {
  children: ReactNode
  loading?: boolean
}

export function Button({
  children,
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        'bg-accent h-12 font-bold flex justify-center items-center gap-2 rounded-full text-[white] transition hover:bg-[#3048C8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : children}
    </button>
  )
}
