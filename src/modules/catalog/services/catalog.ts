import { getMockCatalog } from '../repositories/mock-catalog'
import { requireMockBackend } from '@/modules/shared/services/mock-access'
import { identifier } from '@/modules/shared/schemas/identifiers'
import { categorySchema } from '../schemas/category'

export function getCategories() { requireMockBackend(); return getMockCatalog().categories() }
export function saveCategory(input: unknown, id?: string) {
  requireMockBackend()
  if (id) identifier.parse(id)
  return getMockCatalog().saveCategory(categorySchema.parse(input), id)
}
export function deleteCategory(id: string) { requireMockBackend(); getMockCatalog().deleteCategory(identifier.parse(id)) }
