import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN || '7d'
    }
  )
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET)
}

export function setAuthCookie(res, token) {
  const isProduction = env.NODE_ENV === 'production'
  res.cookie('apex_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
}

export function clearAuthCookie(res) {
  const isProduction = env.NODE_ENV === 'production'
  res.clearCookie('apex_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax'
  })
}
