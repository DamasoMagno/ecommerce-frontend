import { Logo } from './logo'
import { CartModal } from '../Cart'
import { ProfileOptions } from '../ProfileOptions'
import { SearchInput } from '../Search'

export function Header() {
  return <header className="border-b border-border bg-surface/90"><div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:gap-8 md:px-6"><Logo /><SearchInput /><div className="flex items-center gap-4"><ProfileOptions /><CartModal /></div></div></header>
}
