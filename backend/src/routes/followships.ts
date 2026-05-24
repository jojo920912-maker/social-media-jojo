import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { followships, users } from '../db/schema.js'
import { authenticated } from '../middleware/auth.js'
import type { DbContext } from '../db/connection.js'

export function followshipRoutes({ db }: DbContext) {
  const app = new Hono()

  app.use('*', authenticated)

  // POST /api/followships
  app.post('/', async (c) => {
    const currentUser = c.get('currentUser')
    const body = await c.req.json<{ id: number }>()

    if (!body.id) {
      return c.json({ error: { code: 'VALIDATION_ERROR', message: 'User id is required' } }, 400)
    }

    if (currentUser.id === body.id) {
      return c.json({ error: { code: 'VALIDATION_ERROR', message: 'You cannot follow yourself' } }, 400)
    }

    const targetUser = db.select().from(users).where(eq(users.id, body.id)).get()
    if (!targetUser) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
    }

    try {
      db.insert(followships).values({
        followerId: currentUser.id,
        followingId: body.id,
      }).run()
    } catch (e: any) {
      if (e.message?.includes('UNIQUE constraint')) {
        return c.json({ error: { code: 'CONFLICT', message: 'Already following this user' } }, 409)
      }
      throw e
    }

    return c.json({ message: 'Followed successfully' }, 201)
  })

  // DELETE /api/followships/:followingId
  app.delete('/:followingId', async (c) => {
    const followingId = Number(c.req.param('followingId'))
    const currentUser = c.get('currentUser')

    const existing = db.select().from(followships).where(
      and(eq(followships.followerId, currentUser.id), eq(followships.followingId, followingId))
    ).get()

    if (!existing) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Followship not found' } }, 404)
    }

    db.delete(followships).where(
      and(eq(followships.followerId, currentUser.id), eq(followships.followingId, followingId))
    ).run()

    return c.json({ message: 'Unfollowed successfully' })
  })

  return app
}
