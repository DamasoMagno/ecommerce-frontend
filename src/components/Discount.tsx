import { MoveDown } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { ComponentProps } from 'react'

interface DiscountProps extends ComponentProps<'div'> {
  discount: number
}

export function Discount({ discount, className, ...props }: DiscountProps) {
  return (
    <div
      {...props}
      className={twMerge(
        'z-10 flex items-center gap-1 bg-[#E4DEEE] text-[#5F4C82] text-xs font-bold rounded-2xl px-2 py-1',
        className,
      )}
    >
      <MoveDown size={12} />
      <span>{discount}%</span>
    </div>
  )
}
