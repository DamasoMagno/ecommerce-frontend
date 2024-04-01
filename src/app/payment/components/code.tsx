'use client'
import { Copy } from 'lucide-react'

interface CodeProps {
  code: string
}

export function Code({ code }: CodeProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch (error) {
      console.log('Error copying to clipboard:', error)
    }
  }

  return (
    <div className="focus-within:border-[#5033C3] border-2 border-transparent w-60 flex gap-3 bg-[#1A1A1A] p-2 rounded-md text-white transition h-12 items-center px-4">
      <p className="overflow-x-scroll [&::-webkit-scrollbar]:hidden text-sm">
        {code}
      </p>
      <button onClick={copyToClipboard}>
        <Copy size={16} />
      </button>
    </div>
  )
}
