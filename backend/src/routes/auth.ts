import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { users } from '../db/schema.js'
import { hashPassword, verifyPassword } from '../helpers/password.js'
import { signToken } from '../helpers/token.js'
import { authenticated, authenticatedAdmin } from '../middleware/auth.js'
import type { DbContext } from '../db/connection.js'

export function authRoutes({ db }: DbContext) {
  const app = new Hono()

  // POST /api/users/signin
  app.post('/users/signin', async (c) => {
    const body = await c.req.json<{ account: string; password: string }>()

    if (!body.account || !body.password) {
      return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Account and password are required' } }, 400)
    }

    const user = db.select().from(users).where(eq(users.account, body.account)).get()
      ?? db.select().from(users).where(eq(users.email, body.account)).get()

    if (!user) {
      return c.json({ error: { code: 'AUTH_ERROR', message: 'Account or password is incorrect' } }, 401)
    }

    const valid = await verifyPassword(user.password, body.password)
    if (!valid) {
      return c.json({ error: { code: 'AUTH_ERROR', message: 'Account or password is incorrect' } }, 401)
    }

    const token = signToken({ id: user.id, role: user.role })
    const { password: _, ...userWithoutPassword } = user

    return c.json({ user: userWithoutPassword, token })
  })

  // POST /api/users (register)
  app.post('/users', async (c) => {
    const body = await c.req.json<{
      name: string; account: string; email: string
      password: string; checkPassword: string
    }>()

    if (!body.name || !body.account || !body.email || !body.password || !body.checkPassword) {
      return c.json({ error: { code: 'VALIDATION_ERROR', message: 'All fields are required' } }, 400)
    }

    if (body.password !== body.checkPassword) {
      return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Passwords do not match' } }, 400)
    }

    const existingAccount = db.select().from(users).where(eq(users.account, body.account)).get()
    if (existingAccount) {
      return c.json({ error: { code: 'CONFLICT', message: 'Account already exists' } }, 409)
    }

    const existingEmail = db.select().from(users).where(eq(users.email, body.email)).get()
    if (existingEmail) {
      return c.json({ error: { code: 'CONFLICT', message: 'Email already exists' } }, 409)
    }

    const hashedPassword = await hashPassword(body.password)
    const result = db.insert(users).values({
      name: body.name,
      account: body.account,
      email: body.email,
      password: hashedPassword,
    }).run()

    const newUser = db.select().from(users).where(eq(users.id, Number(result.lastInsertRowid))).get()!
    const { password: _, ...userWithoutPassword } = newUser

    return c.json({ user: userWithoutPassword }, 201)
  })

  // GET /api/auth/test-token
  app.get('/auth/test-token', authenticated, async (c) => {
    const currentUser = c.get('currentUser')
    const user = db.select().from(users).where(eq(users.id, currentUser.id)).get()
    if (!user) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
    }
    const { password: _, ...userWithoutPassword } = user
    return c.json(userWithoutPassword)
  })

  // GET /api/auth/test-token-admin
  app.get('/auth/test-token-admin', authenticatedAdmin, async (c) => {
    const currentUser = c.get('currentUser')
    const user = db.select().from(users).where(eq(users.id, currentUser.id)).get()
    if (!user) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
    }
    const { password: _, ...userWithoutPassword } = user
    return c.json(userWithoutPassword)
  })

  return app
}
