import { Kind, parse } from 'graphql'

const publicOperations = new Set(['MainCategories', 'Categories', 'Resume', 'Logo', 'WhatsappContact', 'Product', 'ProductsByName', 'ProductsByCategory'])

export class MockAccessError extends Error {
  constructor(public status: number) { super('Acesso não autorizado a estes dados de teste.') }
}

export function authorizeMockRequest(query: string, variables: Record<string, unknown>, user: { id: string; email: string } | null, itemOwner: (id: string) => string | undefined) {
  const operation = parse(query).definitions.find((definition) => definition.kind === Kind.OPERATION_DEFINITION)
  if (!operation || operation.kind !== Kind.OPERATION_DEFINITION) throw new MockAccessError(400)
  const name = operation.name?.value ?? ''
  if (publicOperations.has(name)) return
  if (!user) throw new MockAccessError(401)
  if ('email' in variables && variables.email !== user.email) throw new MockAccessError(403)
  if ('userId' in variables && variables.userId !== user.id) throw new MockAccessError(403)
  if (['DeleteOrderItem', 'UpdateOrderItem'].includes(name) && itemOwner(String(variables.orderItemId)) !== user.email) throw new MockAccessError(403)
}
