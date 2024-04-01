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
        'bg-[#5033C3] h-12 font-bold flex justify-center items-center gap-2 rounded-md text-white transition',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : children}
    </button>
  )
}
