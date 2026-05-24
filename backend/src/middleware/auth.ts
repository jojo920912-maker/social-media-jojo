import type { Context, Next } from 'hono'
import { verifyToken, type TokenPayload } from '../helpers/token.js'

declare module 'hono' {
  interface ContextVariableMap {
    currentUser: TokenPayload
  }
}

export async function authenticated(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'No token provided' } }, 401)
  }

  try {
    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    c.set('currentUser', payload)
    await next()
  } catch {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401)
  }
}

export async function authenticatedAdmin(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'No token provided' } }, 401)
  }

  try {
    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (payload.role !== 'admin') {
      return c.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, 403)
    }
    c.set('currentUser', payload)
    await next()
  } catch {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401)
  }
}
