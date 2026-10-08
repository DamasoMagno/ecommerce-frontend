import { z } from 'zod'
import { identifier, slugSchema } from '@/modules/shared/schemas/identifiers'

export const categorySchema = z.object({ name: z.string().trim().min(2).max(100), slug: slugSchema, imageId: identifier.nullable().optional() })
