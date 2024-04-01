'use client'
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useUser } from '@clerk/nextjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getUserAddress } from '@/graphql/queries/getUserAddress'
import { updateAddress } from '@/graphql/mutations/updateAddress'
import { registerAddress } from '@/graphql/mutations/registerAddress'

import { IAddress } from '@/interface'

import { AddressInput } from '../app/cart/components/FormAddress'

interface UserContextProps {
  address: IAddress | null
  user: any
  userLoaded: boolean
  registerUserAddress: (address: AddressInput) => Promise<void>
  updateExistingAddress: (address: AddressInput) => Promise<void>
}

export const UserContext = createContext({} as UserContextProps)

interface UserProviderProps {
  children: ReactNode
}

const queryClient = new QueryClient()

export function UserProvider({ children }: UserProviderProps) {
  const { user, isLoaded } = useUser()
  const [address, setAddress] = useState<IAddress | null>(null)

  const userEmail = user?.primaryEmailAddress?.emailAddress ?? ''

  async function registerUserAddress(addressInput: AddressInput) {
    try {
      const response = await registerAddress({
        address: addressInput,
        email: userEmail,
      })

      setAddress(response.createAddress)

      toast.success('Endereço cadastrado')
    } catch (error) {
      console.log(error)
    }
  }

  async function updateExistingAddress(address: AddressInput) {
    try {
      const response = await updateAddress({
        updatedAddress: address,
        email: userEmail,
      })

      setAddress(response.updateAddress)

      toast.success('Endereço atualizado')
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!userEmail) return

    async function loadAddress() {
      try {
        const response = await getUserAddress({ email: userEmail })
        setAddress(response.address)
      } catch (error) {
        console.log(error)
      }
    }

    loadAddress()
  }, [userEmail])

  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider
        value={{
          address,
          registerUserAddress,
          updateExistingAddress,
          userLoaded: isLoaded,
          user,
        }}
      >
        {children}
      </UserContext.Provider>
    </QueryClientProvider>
  )
}

export const useUserInfo = () => useContext(UserContext)
