'use server'
import * as company from '../services/company'
import { mutate } from '@/modules/shared/services/mutation'
export async function loadCompany() { return company.getCompany() }
export async function saveCompany(input: unknown) { return mutate(() => company.saveCompany(input)) }
