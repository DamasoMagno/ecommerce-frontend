'use client'

import { ReactNode, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserContext } from './User'
import { IAddress } from '@/interface'
import { mockAddress, mockCustomer } from '@/mocks/customer'
import { AddressInput } from '@/modules/checkout/components/address-form'
import { registerAddress } from '@/graphql/mutations/registerAddress'
import { updateAddress } from '@/graphql/mutations/updateAddress'

export function MockUserProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [user, setUser] = useState<typeof mockCustomer | null>(null)
  const [userLoaded, setUserLoaded] = useState(false)
  const [address, setAddress] = useState<IAddress | null>(null)

  useEffect(() => {
    const signedIn = window.localStorage.getItem('newbyte-demo-login') === 'true'
    if (signedIn) { setUser(mockCustomer); setAddress(mockAddress) }
    setUserLoaded(true)
  }, [])

  function signIn() {
    window.localStorage.setItem('newbyte-demo-login', 'true')
    setUser(mockCustomer)
    setAddress(mockAddress)
  }

  function signOut() {
    window.localStorage.removeItem('newbyte-demo-login')
    setUser(null)
    setAddress(null)
    queryClient.clear()
  }

  async function saveAddress(input: AddressInput, existing: boolean) {
    if (!user) return
    const email = user.primaryEmailAddress.emailAddress
    const result = existing ? await updateAddress({ email, updatedAddress: input }) : await registerAddress({ email, address: input })
    setAddress('updateAddress' in result ? result.updateAddress : result.createAddress)
    toast.success('Endereço de teste salvo.')
  }

  return <QueryClientProvider client={queryClient}><UserContext.Provider value={{
    user, userLoaded, address,
    mockSession: { signIn, signOut },
    registerUserAddress: (input) => saveAddress(input, false),
    updateExistingAddress: (input) => saveAddress(input, true),
  }}>{children}</UserContext.Provider></QueryClientProvider>
}
