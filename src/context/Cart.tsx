'use client'
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { useUserInfo } from './User'
import { IOrderItem, IProduct } from '@/interface'
import { formatDiscountPrice } from '@/utils/format-discount'

import { getOrderItems } from '@/graphql/queries/listOrderItemsOnCart'
import { createOrderItem } from '@/graphql/mutations/createOrderItem'
import { deleteOrderItem } from '@/graphql/mutations/deleteOrderItem'
import { updateOrderItem } from '@/graphql/mutations/updateOrderItem'
import { createOrder } from '@/graphql/mutations/createOrder'

export interface CheckoutProps {
  payment: 'Pix' | 'Card' | 'Money'
  delivery: 'Entrega' | 'Retirada'
}

interface CartContextProps {
  orderItems: IOrderItem[]
  payment: CheckoutProps
  setPayment: Dispatch<SetStateAction<CheckoutProps>>
  addProductToCart: (product: IProduct) => Promise<void>
  deleteProductFromCart: (orderId: string) => Promise<void>
  incrementProductQuantity: (orderId: string) => Promise<void>
  decrementProductQuantity: (orderId: string) => Promise<void>
  checkout: () => Promise<void>
}

export const CartContext = createContext({} as CartContextProps)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const { user } = useUser()
  const { push } = useRouter()

  const { address } = useUserInfo()
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? ''

  const [orderItems, setOrderItems] = useState<IOrderItem[]>([])
  const [payment, setPayment] = useState<CheckoutProps>({
    delivery: 'Entrega',
    payment: 'Pix',
  })

  async function addProductToCart(product: IProduct) {
    if (!user) {
      return push('/sign')
    }

    const productInCart = orderItems.some(
      (item) => item.product.id === product.id,
    )

    if (productInCart) {
      toast.warning('Produto já inserido')
      return
    }

    if (product.coupon) {
      product.price = formatDiscountPrice(
        product.coupon.discount,
        product.price,
      )
    }

    const newOrderItem = await createOrderItem({
      email: userEmail,
      slug: product.slug,
      total: product.price,
    })

    setOrderItems((state) => [...state, newOrderItem])
    toast.success('Produto adicionado')
  }

  async function deleteProductFromCart(orderId: string) {
    await deleteOrderItem({ orderItemId: orderId })

    setOrderItems((state) => {
      return state.filter(({ id }) => id !== orderId)
    })
  }

  async function incrementProductQuantity(orderId: string) {
    const incrementOrderItem = orderItems.map((item) => {
      const productPriceFormatted = formatDiscountPrice(
        item.product.coupon?.discount,
        item.product.price,
      )

      return item.id === orderId
        ? {
          ...item,
          total: Number(item.total) + productPriceFormatted,
          quantity: item.quantity + 1,
        }
        : item
    })

    setOrderItems(incrementOrderItem)
  }

  async function decrementProductQuantity(orderId: string) {
    const decrementOrderItem = orderItems.map((item) => {
      const productPriceFormatted = formatDiscountPrice(
        item.product.coupon?.discount,
        item.product.price,
      )

      return item.id === orderId
        ? {
          ...item,
          total: Number(item.total) - productPriceFormatted,
          quantity: item.quantity - 1,
        }
        : item
    })

    const itemUpdated = decrementOrderItem.find((item) => item.id === orderId)
    if (itemUpdated && itemUpdated.quantity < 1) {
      return
    }

    setOrderItems(decrementOrderItem)
  }

  async function checkout() {
    if (!address) {
      toast.error('Endereço não cadastrado')
      return
    }

    const getOrderItemIds = orderItems.map((item) => ({ id: item.id }))

    if (getOrderItemIds.length < 1) return

    const formattTotalItemsPrice = orderItems.reduce(
      (acc: number, current: IOrderItem) => Number(current.total) + acc,
      0,
    )

    for (const orderItem of orderItems) {
      await updateOrderItem({
        orderItemId: orderItem.id,
        quantity: orderItem.quantity,
        total: orderItem.total,
      })
    }

    const totalPrice =
      payment.delivery === 'Entrega'
        ? formattTotalItemsPrice + 5
        : formattTotalItemsPrice

    const response = await createOrder({
      addressId: address.id,
      email: userEmail,
      payment: payment.payment,
      delivery: payment.delivery,
      userId: String(user?.id),
      orderItemId: getOrderItemIds,
      total: totalPrice,
    })

    setOrderItems([])
    push(`/payment/${response.id}`)
  }

  useEffect(() => {
    const loadOrderItems = async () => {
      {
        try {
          const response = await getOrderItems({ email: userEmail })
          setOrderItems(response.orderItems)
        } catch (error) {
          console.log(error)
        }
      }
    }

    loadOrderItems()
  }, [userEmail])

  return (
    <CartContext.Provider
      value={{
        orderItems,
        payment,
        setPayment,
        addProductToCart,
        checkout,
        deleteProductFromCart,
        incrementProductQuantity,
        decrementProductQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
