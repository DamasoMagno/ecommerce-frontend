import { z } from 'zod'

export const identifier = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/)
export const slugSchema = z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens.')
