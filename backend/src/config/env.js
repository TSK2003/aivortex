import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16).default('apexlearn_super_secure_jwt_secret_key_2026_dev'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16).default('apexlearn_cookie_secret_key_2026_dev'),
  DATABASE_URL: z.string().optional()
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('[ERROR] Invalid environment configuration:', parsed.error.format())
  process.exit(1)
}

// Production safety verification: ensure default dev secrets are not used in production
if (parsed.data.NODE_ENV === 'production') {
  if (parsed.data.JWT_SECRET === 'apexlearn_super_secure_jwt_secret_key_2026_dev') {
    console.error('[FATAL] Production cannot use the default development JWT_SECRET!')
    process.exit(1)
  }
  if (parsed.data.COOKIE_SECRET === 'apexlearn_cookie_secret_key_2026_dev') {
    console.error('[FATAL] Production cannot use the default development COOKIE_SECRET!')
    process.exit(1)
  }
  if (!parsed.data.DATABASE_URL) {
    console.error('[FATAL] DATABASE_URL is required in production environment!')
    process.exit(1)
  }
}

export const env = parsed.data
