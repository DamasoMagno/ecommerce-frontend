import { getMockCatalog } from '@/modules/catalog/repositories/mock-catalog'
import { requireMockBackend } from '@/modules/shared/services/mock-access'
import { companySchema } from '../schemas/company'

export function getCompany() { requireMockBackend(); return getMockCatalog().company() }
export function saveCompany(input: unknown) { requireMockBackend(); return getMockCatalog().saveCompany(companySchema.parse(input)) }
