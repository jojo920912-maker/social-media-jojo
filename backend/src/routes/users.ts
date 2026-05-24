import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { users } from '../db/schema.js'
import { authenticated } from '../middleware/auth.js'
import { hashPassword } from '../helpers/password.js'
import { saveUploadedFile } from '../helpers/upload.js'
import type { DbContext } from '../db/connection.js'

export function userRoutes({ db, sqlite }: DbContext) {
  const app = new Hono()

  app.use('*', authenticated)

  // GET /api/users/top — must be before /:userId
  app.get('/top', async (c) => {
    const currentUser = c.get('currentUser')

    const rows = sqlite.prepare(`
      SELECT
        u.id, u.name, u.account, u.avatar, u.introduction,
        (SELECT COUNT(*) FROM followships WHERE followships.followingId = u.id) as followersCount,
        (SELECT COUNT(*) FROM followships WHERE followships.followerId = ? AND followships.followingId = u.id) as isFollowed
      FROM users u
      WHERE u.id != ? AND u.role = 'user'
      ORDER BY followersCount DESC
      LIMIT 10
    `).all(currentUser.id, currentUser.id)

    return c.json(rows.map((row: any) => ({
      ...row,
      isFollowed: row.isFollowed > 0,
    })))
  })

  // GET /api/users/:userId
  app.get('/:userId', async (c) => {
    const userId = Number(c.req.param('userId'))
    const currentUser = c.get('currentUser')

    const row: any = sqlite.prepare(`
      SELECT
        u.id, u.name, u.account, u.email, u.introduction, u.avatar, u.banner, u.role, u.createdAt, u.updatedAt,
        (SELECT COUNT(*) FROM followships WHERE followships.followingId = u.id) as followersCount,
        (SELECT COUNT(*) FROM followships WHERE followships.followerId = u.id) as followingsCount,
        (SELECT COUNT(*) FROM tweets WHERE tweets.UserId = u.id) as tweetsCount,
        (SELECT COUNT(*) FROM likes WHERE likes.UserId = u.id) as getLikesCount,
        (SELECT COUNT(*) FROM followships WHERE followships.followerId = ? AND followships.followingId = u.id) as isFollowed
      FROM users u
      WHERE u.id = ?
    `).get(currentUser.id, userId)

    if (!row) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
    }

    return c.json({ ...row, isFollowed: row.isFollowed > 0 })
  })

  // PUT /api/users/:userId
  app.put('/:userId', async (c) => {
    const userId = Number(c.req.param('userId'))
    const currentUser = c.get('currentUser')

    if (currentUser.id !== userId) {
      return c.json({ error: { code: 'FORBIDDEN', message: 'You can only edit your own profile' } }, 403)
    }

    const formData = await c.req.parseBody({ all: true })
    const updates: Record<string, any> = {}

    if (typeof formData.name === 'string' && formData.name.trim()) updates.name = formData.name.trim()
    if (typeof formData.introduction === 'string') updates.introduction = formData.introduction.trim()
    if (typeof formData.account === 'string' && formData.account.trim()) {
      const existing = db.select().from(users).where(eq(users.account, formData.account.trim())).get()
      if (existing && existing.id !== userId) {
        return c.json({ error: { code: 'CONFLICT', message: 'Account already taken' } }, 409)
      }
      updates.account = formData.account.trim()
    }
    if (typeof formData.email === 'string' && formData.email.trim()) {
      const existing = db.select().from(users).where(eq(users.email, formData.email.trim())).get()
      if (existing && existing.id !== userId) {
        return c.json({ error: { code: 'CONFLICT', message: 'Email already taken' } }, 409)
      }
      updates.email = formData.email.trim()
    }
    if (typeof formData.password === 'string' && formData.password) {
      if (formData.password !== formData.checkPassword) {
        return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Passwords do not match' } }, 400)
      }
      updates.password = await hashPassword(formData.password as string)
    }

    if (formData.avatar instanceof File) {
      updates.avatar = await saveUploadedFile(formData.avatar)
    }
    if (formData.banner instanceof File) {
      updates.banner = await saveUploadedFile(formData.banner)
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19)
      db.update(users).set(updates).where(eq(users.id, userId)).run()
    }

    const user = db.select().from(users).where(eq(users.id, userId)).get()!
    const { password: _, ...userWithoutPassword } = user
    return c.json(userWithoutPassword)
  })

  // GET /api/users/:userId/tweets
  app.get('/:userId/tweets', async (c) => {
    const userId = Number(c.req.param('userId'))
    const currentUser = c.get('currentUser')

    const rows = sqlite.prepare(`
      SELECT
        t.id, t.description, t.UserId, t.createdAt, t.updatedAt,
        u.id as "user.id", u.name as "user.name", u.account as "user.account",
        u.avatar as "user.avatar",
        (SELECT COUNT(*) FROM likes WHERE likes.TweetId = t.id) as likesCount,
        (SELECT COUNT(*) FROM replies WHERE replies.TweetId = t.id) as repliesCount,
        (SELECT COUNT(*) FROM likes WHERE likes.TweetId = t.id AND likes.UserId = ?) as isLiked
      FROM tweets t
      JOIN users u ON t.UserId = u.id
      WHERE t.UserId = ?
      ORDER BY t.createdAt DESC
    `).all(currentUser.id, userId)

    return c.json(rows.map((row: any) => ({
      id: row.id,
      description: row.description,
      UserId: row.UserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      likesCount: row.likesCount,
      repliesCount: row.repliesCount,
      isLiked: row.isLiked > 0,
      user: { id: row['user.id'], name: row['user.name'], account: row['user.account'], avatar: row['user.avatar'] },
    })))
  })

  // GET /api/users/:userId/replied_tweets
  app.get('/:userId/replied_tweets', async (c) => {
    const userId = Number(c.req.param('userId'))

    const rows = sqlite.prepare(`
      SELECT
        r.id as replyId, r.comment, r.createdAt as replyCreatedAt,
        t.id as tweetId, t.description,
        tu.id as "tweetUser.id", tu.name as "tweetUser.name", tu.account as "tweetUser.account",
        tu.avatar as "tweetUser.avatar"
      FROM replies r
      JOIN tweets t ON r.TweetId = t.id
      JOIN users tu ON t.UserId = tu.id
      WHERE r.UserId = ?
      ORDER BY r.createdAt DESC
    `).all(userId)

    return c.json(rows.map((row: any) => ({
      replyId: row.replyId,
      comment: row.comment,
      replyCreatedAt: row.replyCreatedAt,
      Tweet: {
        id: row.tweetId,
        description: row.description,
        user: {
          id: row['tweetUser.id'],
          name: row['tweetUser.name'],
          account: row['tweetUser.account'],
          avatar: row['tweetUser.avatar'],
        },
      },
    })))
  })

  // GET /api/users/:userId/likes
  app.get('/:userId/likes', async (c) => {
    const userId = Number(c.req.param('userId'))
    const currentUser = c.get('currentUser')

    const rows = sqlite.prepare(`
      SELECT
        t.id, t.description, t.UserId, t.createdAt, t.updatedAt,
        u.id as "user.id", u.name as "user.name", u.account as "user.account",
        u.avatar as "user.avatar",
        (SELECT COUNT(*) FROM likes WHERE likes.TweetId = t.id) as likesCount,
        (SELECT COUNT(*) FROM replies WHERE replies.TweetId = t.id) as repliesCount,
        (SELECT COUNT(*) FROM likes WHERE likes.TweetId = t.id AND likes.UserId = ?) as isLiked
      FROM likes l
      JOIN tweets t ON l.TweetId = t.id
      JOIN users u ON t.UserId = u.id
      WHERE l.UserId = ?
      ORDER BY l.createdAt DESC
    `).all(currentUser.id, userId)

    return c.json(rows.map((row: any) => ({
      id: row.id,
      description: row.description,
      UserId: row.UserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      likesCount: row.likesCount,
      repliesCount: row.repliesCount,
      isLiked: row.isLiked > 0,
      user: { id: row['user.id'], name: row['user.name'], account: row['user.account'], avatar: row['user.avatar'] },
    })))
  })

  // GET /api/users/:userId/followings
  app.get('/:userId/followings', async (c) => {
    const userId = Number(c.req.param('userId'))
    const currentUser = c.get('currentUser')

    const rows = sqlite.prepare(`
      SELECT
        u.id, u.name, u.account, u.avatar, u.introduction,
        (SELECT COUNT(*) FROM followships WHERE followships.followerId = ? AND followships.followingId = u.id) as isFollowed
      FROM followships f
      JOIN users u ON f.followingId = u.id
      WHERE f.followerId = ?
    `).all(currentUser.id, userId)

    return c.json(rows.map((row: any) => ({ ...row, isFollowed: row.isFollowed > 0 })))
  })

  // GET /api/users/:userId/followers
  app.get('/:userId/followers', async (c) => {
    const userId = Number(c.req.param('userId'))
    const currentUser = c.get('currentUser')

    const rows = sqlite.prepare(`
      SELECT
        u.id, u.name, u.account, u.avatar, u.introduction,
        (SELECT COUNT(*) FROM followships WHERE followships.followerId = ? AND followships.followingId = u.id) as isFollowed
      FROM followships f
      JOIN users u ON f.followerId = u.id
      WHERE f.followingId = ?
    `).all(currentUser.id, userId)

    return c.json(rows.map((row: any) => ({ ...row, isFollowed: row.isFollowed > 0 })))
  })

  return app
}
