import { IProduct, IAddress } from '@/interface'
import { OrderStatus } from './schema'

export interface BackendCategory { id: string; name: string; slug: string; imageId?: string | null; photo: { url: string }; productCount: number }
export interface BackendAsset { id: string; url: string; fileName: string | null }
export interface BackendCompany { name: string; logoId: string | null; logoUrl: string | null }
export interface BackendOrder {
  id: string; email: string; userId: string; customerName: string; total: number; payment: string; delivery: string;
  status: OrderStatus; createdAt: string; paidAt: string | null; address: IAddress;
  items: { id: string; productName: string; quantity: number; total: number }[]
}
export type BackendProduct = IProduct & { categoryId?: string | null }
