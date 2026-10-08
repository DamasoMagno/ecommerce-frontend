import { z } from 'zod'

export const productSchema = z.object({
  categoryId: z.string().trim().max(100).nullable().optional(),
  name: z.string().trim().min(2, 'Informe pelo menos 2 caracteres.').max(200),
  slug: z.string().trim().min(1, 'Informe o endereço do produto.').max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens.'),
  description: z.string().trim().min(1, 'Informe a descrição.').max(20000),
  price: z.number().finite().positive('O preço deve ser maior que zero.')
    .max(99999999).refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.00001, 'Use até duas casas decimais.'),
  available: z.boolean(),
  imageId: z.string().trim().min(1, 'Selecione uma imagem.'),
})

export type ProductInput = z.infer<typeof productSchema>

export function productSlug(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
