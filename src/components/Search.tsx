'use client'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

export function SearchInput() {
  const navigate = useRouter()

  const [searchOpen, setSerachOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  function insertInputOnSearch(e: FormEvent) {
    e.preventDefault()

    if (!searchRef.current) return

    if (!searchRef.current.value) {
      return navigate.push('/')
    }

    navigate.push(`/products/${searchRef.current.value}`)
    searchRef.current.value = ''
  }

  const closeSearchBar = (event: any) => {
    if (event.code === 'Escape') {
      setSerachOpen(false)
    }
  }

  useEffect(() => {
    window.addEventListener('keyup', closeSearchBar)

    return () => {
      window.removeEventListener('keyup', close)
    }
  }, [])

  return (
    <>
      {searchOpen && (
        <div className="md:hidden backdrop-blur w-full left-0 top-0 h-full fixed z-40" />
      )}

      <form
        onSubmit={insertInputOnSearch}
        className={`
            flex items-center gap-2 
            md:max-w-[540px] md:w-[50%] 
            border-[#1A1A1A]/50  border-2  bg-[#1A1A1A]/25
            md:relative md:top-auto md:left-auto
            rounded-md px-4 h-9
            ${searchOpen && 'absolute top-12 left-6 w-[90%] !bg-[#1A1A1A]/100 z-40'}
          `}
      >
        <input
          ref={searchRef}
          className={`
            md:block bg-transparent border-0 outline-none text-white text-sm mr-1 flex-1 z-50
            ${searchOpen ? 'block' : 'hidden'}
          `}
          placeholder="Buscar"
        />

        <button
          type="button"
          className={`${searchOpen ? 'block' : 'hidden'} md:hidden`}
          onClick={() => setSerachOpen(false)}
        >
          <X color="#FFF" size={14} />
        </button>

        <button
          type="button"
          className={`${searchOpen ? 'hidden' : 'block'} md:hidden`}
          onClick={() => setSerachOpen(true)}
        >
          <Search color="#FFF" size={14} />
        </button>
      </form>
    </>
  )
}
