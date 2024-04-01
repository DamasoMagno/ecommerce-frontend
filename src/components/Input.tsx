'use client'
import { ComponentProps, forwardRef } from 'react'

type InputProps = ComponentProps<'input'>

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <input
      className="bg-input border-[#1A1A1A] border-2 rounded-md text-white p-2 h-12"
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = 'Input'
