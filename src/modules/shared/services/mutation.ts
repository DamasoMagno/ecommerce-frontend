import { revalidatePath } from 'next/cache'

export async function mutate<T>(operation: () => T | Promise<T>) {
  try {
    const value = await operation()
    revalidatePath('/', 'layout')
    return { success: true as const, value }
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Não foi possível salvar.' }
  }
}
