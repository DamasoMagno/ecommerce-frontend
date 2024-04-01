'use client'
import Link from 'next/link'
import { useClerk } from '@clerk/clerk-react'
import * as Popover from '@radix-ui/react-popover'
import {
  Box,
  BadgeDollarSign,
  User,
  LogOut,
  LogIn,
  Loader2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUserInfo } from '@/context/User'

export function ProfileOptions() {
  const { signOut } = useClerk()
  const { user, userLoaded } = useUserInfo()
  const router = useRouter()

  async function handleLogout() {
    await signOut(() => router.push('/'))
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="bg-transparent flex justify-center items-center text-white border-[#2A2A2A] border-2 rounded-lg w-9 h-9">
          <User className="text-white" size={14} />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className="rounded-lg w-[260px] bg-[#1A1A1A] z-[9999999]">
          {!userLoaded ? (
            <div className="flex justify-center items-center min-h-[5rem]">
              <Loader2 className="animate-spin" size={20} color="#FFF" />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-6 p-6">
                <Link
                  href="/orders"
                  className="flex items-center gap-2 text-white bold"
                >
                  <Box size={20} /> Pedidos
                </Link>
                <Link
                  href="/dealer"
                  className="flex items-center gap-2 text-white bold"
                >
                  <BadgeDollarSign size={20} /> Solicitar revenda
                </Link>
              </div>

              <footer className="px-6 py-4 border-t-[1px] border-[#2A2A2A]">
                {user ? (
                  <button
                    className="flex items-center gap-2 bold text-[#FF4646]"
                    onClick={handleLogout}
                  >
                    <LogOut size={20} /> Sair da conta
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 bold text-[#5033C3]"
                    onClick={() => router.push('/sign')}
                  >
                    <LogIn size={20} /> Fazer login
                  </button>
                )}
              </footer>
            </>
          )}
          <Popover.Arrow className="fill-[#1A1A1A]" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
