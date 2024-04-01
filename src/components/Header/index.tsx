import { Logo } from './logo'
import { CartModal } from '../Cart'
import { ProfileOptions } from '../ProfileOptions'
import { SearchInput } from '../../components/Search'

export function Header() {
  return (
    <header className="border-[#2A2A2A] border-b-2">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between  p-4">
        <Logo />

        <SearchInput />

        <div className="flex items-center gap-4">
          <CartModal />
          <ProfileOptions />
        </div>
      </div>
    </header>
  )
}
