'use client'
import { ComponentProps, forwardRef } from 'react'

type InputProps = ComponentProps<'input'>

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <input
      className="bg-input border-[#F0F1EE] border-2 rounded-md text-slate-800 p-2 h-12"
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = 'Input'
