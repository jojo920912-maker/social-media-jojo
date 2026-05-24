import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { users, tweets } from '../db/schema.js'
import { verifyPassword } from '../helpers/password.js'
import { signToken } from '../helpers/token.js'
import { authenticatedAdmin } from '../middleware/auth.js'
import type { DbContext } from '../db/connection.js'

export function adminRoutes({ db, sqlite }: DbContext) {
  const app = new Hono()

  // POST /api/admin/signin
  app.post('/signin', async (c) => {
    const body = await c.req.json<{ account: string; password: string }>()

    if (!body.account || !body.password) {
      return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Account and password are required' } }, 400)
    }

    const user = db.select().from(users).where(eq(users.account, body.account)).get()
      ?? db.select().from(users).where(eq(users.email, body.account)).get()

    if (!user) {
      return c.json({ error: { code: 'AUTH_ERROR', message: 'Account or password is incorrect' } }, 401)
    }

    if (user.role !== 'admin') {
      return c.json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }, 403)
    }

    const valid = await verifyPassword(user.password, body.password)
    if (!valid) {
      return c.json({ error: { code: 'AUTH_ERROR', message: 'Account or password is incorrect' } }, 401)
    }

    const token = signToken({ id: user.id, role: user.role })
    const { password: _, ...userWithoutPassword } = user

    return c.json({ user: userWithoutPassword, token })
  })

  // GET /api/admin/tweets
  app.get('/tweets', authenticatedAdmin, async (c) => {
    const rows = sqlite.prepare(`
      SELECT
        t.id, t.description, t.UserId, t.createdAt, t.updatedAt,
        u.id as "user.id", u.name as "user.name", u.account as "user.account",
        u.avatar as "user.avatar"
      FROM tweets t
      JOIN users u ON t.UserId = u.id
      ORDER BY t.createdAt DESC
    `).all()

    return c.json(rows.map((row: any) => ({
      id: row.id,
      description: row.description,
      UserId: row.UserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: { id: row['user.id'], name: row['user.name'], account: row['user.account'], avatar: row['user.avatar'] },
    })))
  })

  // GET /api/admin/users
  app.get('/users', authenticatedAdmin, async (c) => {
    const rows = sqlite.prepare(`
      SELECT
        u.id, u.name, u.account, u.email, u.avatar, u.banner, u.introduction, u.role, u.createdAt,
        (SELECT COUNT(*) FROM tweets WHERE tweets.UserId = u.id) as tweetsCount,
        (SELECT COUNT(*) FROM followships WHERE followships.followingId = u.id) as followersCount,
        (SELECT COUNT(*) FROM followships WHERE followships.followerId = u.id) as followingsCount,
        (SELECT COUNT(*) FROM likes WHERE likes.UserId = u.id) as getLikesCount
      FROM users u
      ORDER BY tweetsCount DESC
    `).all()

    return c.json(rows)
  })

  // DELETE /api/admin/tweets/:id
  app.delete('/tweets/:id', authenticatedAdmin, async (c) => {
    const tweetId = Number(c.req.param('id'))

    const tweet = db.select().from(tweets).where(eq(tweets.id, tweetId)).get()
    if (!tweet) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Tweet not found' } }, 404)
    }

    db.delete(tweets).where(eq(tweets.id, tweetId)).run()

    return c.json({ message: 'Tweet deleted' })
  })

  return app
}
