'use server'
import * as orders from '../services/orders'
import { mutate } from '@/modules/shared/services/mutation'
export async function loadOrders(input: unknown = {}) { return orders.getOrders(input) }
export async function loadDashboard(days = 30) { return orders.getDashboard(days) }
export async function changeOrderStatus(input: unknown) { return mutate(() => orders.updateOrderStatus(input)) }
