import { z } from 'zod'

export const loginSchema = {
  body: z.object({
    email: z.string().min(1, 'Email or Creator ID is required').optional(),
    identifier: z.string().min(1, 'Email or Creator ID is required').optional(),
    creatorId: z.string().min(1, 'Creator ID is required').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters')
  }).refine(data => Boolean(data.email || data.identifier || data.creatorId), {
    message: 'Email or Creator ID is required'
  })
}

export const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.string().optional()
  })
}

