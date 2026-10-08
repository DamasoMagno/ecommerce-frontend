import { z } from 'zod'
import { identifier } from '@/modules/shared/schemas/identifiers'

export const companySchema = z.object({ name: z.string().trim().min(2).max(100), logoId: identifier.nullable() })
