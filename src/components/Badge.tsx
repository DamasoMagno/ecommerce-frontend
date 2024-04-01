import { ComponentProps, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface BadgeProps extends ComponentProps<'div'> {
  children: ReactNode
}

export function Badge({ children, className, ...props }: BadgeProps) {
  return (
    <div
      className={twMerge(
        'flex items-center justify-center gap-2 rounded-3xl my-4 w-48 text-base font-bold text-white border-[#8162FF] border-2 px-1 py-2 uppercase',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
