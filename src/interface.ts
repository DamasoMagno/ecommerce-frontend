export interface ICategory {
  id: string
  name: string
  slug: string
  photo: {
    url: string
  }
}

interface ICoupon {
  discount: number
}

export interface IProduct {
  id: string
  slug: string
  name: string
  description: string
  available: boolean
  price: number
  coupon?: ICoupon
  image: {
    id: string
    url: string
  }
}

export interface IAddress {
  id: string
  street: string
  number: number
  zipCode: number
  neighborhood: string
  complement?: string
}

export interface IOrder {
  id: string
  total: number
  payment: 'Pix' | 'Card' | 'Money'
  delivery: 'Retirada' | 'Entrega'
  address: IAddress
  orderItems: {
    id: string
    quantity: number
    product: IProduct
  }[]
}

export interface IOrderItem {
  id: string
  total: number
  quantity: number
  product: IProduct
}

export interface IBanner {
  id: string
  image: {
    id: string
    url: string
  }
}
