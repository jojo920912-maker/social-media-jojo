import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { tweets, users, replies, likes } from '../db/schema.js'
import { authenticated } from '../middleware/auth.js'
import type { DbContext } from '../db/connection.js'

function formatTweetRow(row: any) {
  return {
    id: row.id,
    description: row.description,
    UserId: row.UserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    likesCount: row.likesCount,
    repliesCount: row.repliesCount,
    isLiked: row.isLiked > 0,
    user: {
      id: row['user.id'],
      name: row['user.name'],
      account: row['user.account'],
      avatar: row['user.avatar'],
    },
  }
}

export function tweetRoutes({ db, sqlite }: DbContext) {
  const app = new Hono()

  app.use('*', authenticated)

  // GET /api/tweets
  app.get('/', async (c) => {
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
      ORDER BY t.createdAt DESC
    `).all(currentUser.id)

    return c.json(rows.map(formatTweetRow))
  })

  // GET /api/tweets/:tweet_id
  app.get('/:tweet_id', async (c) => {
    const tweetId = Number(c.req.param('tweet_id'))
    const currentUser = c.get('currentUser')

    const row = sqlite.prepare(`
      SELECT
        t.id, t.description, t.UserId, t.createdAt, t.updatedAt,
        u.id as "user.id", u.name as "user.name", u.account as "user.account",
        u.avatar as "user.avatar",
        (SELECT COUNT(*) FROM likes WHERE likes.TweetId = t.id) as likesCount,
        (SELECT COUNT(*) FROM replies WHERE replies.TweetId = t.id) as repliesCount,
        (SELECT COUNT(*) FROM likes WHERE likes.TweetId = t.id AND likes.UserId = ?) as isLiked
      FROM tweets t
      JOIN users u ON t.UserId = u.id
      WHERE t.id = ?
    `).get(currentUser.id, tweetId)

    if (!row) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Tweet not found' } }, 404)
    }

    return c.json(formatTweetRow(row))
  })

  // POST /api/tweets
  app.post('/', async (c) => {
    const currentUser = c.get('currentUser')
    const body = await c.req.json<{ description: string }>()

    if (!body.description?.trim()) {
      return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Description is required' } }, 400)
    }

    if (body.description.length > 140) {
      return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Description must be 140 characters or less' } }, 400)
    }

    const result = db.insert(tweets).values({
      description: body.description.trim(),
      UserId: currentUser.id,
    }).run()

    const newTweet = db.select().from(tweets).where(eq(tweets.id, Number(result.lastInsertRowid))).get()!
    const user = db.select().from(users).where(eq(users.id, currentUser.id)).get()!

    return c.json({
      ...newTweet,
      likesCount: 0,
      repliesCount: 0,
      isLiked: false,
      user: { id: user.id, name: user.name, account: user.account, avatar: user.avatar },
    }, 201)
  })

  // GET /api/tweets/:tweet_id/replies
  app.get('/:tweet_id/replies', async (c) => {
    const tweetId = Number(c.req.param('tweet_id'))

    const rows = sqlite.prepare(`
      SELECT
        r.id, r.comment, r.UserId, r.TweetId, r.createdAt, r.updatedAt,
        u.id as "user.id", u.name as "user.name", u.account as "user.account",
        u.avatar as "user.avatar"
      FROM replies r
      JOIN users u ON r.UserId = u.id
      WHERE r.TweetId = ?
      ORDER BY r.createdAt DESC
    `).all(tweetId)

    return c.json(rows.map((row: any) => ({
      id: row.id,
      comment: row.comment,
      UserId: row.UserId,
      TweetId: row.TweetId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: {
        id: row['user.id'],
        name: row['user.name'],
        account: row['user.account'],
        avatar: row['user.avatar'],
      },
    })))
  })

  // POST /api/tweets/:tweet_id/replies
  app.post('/:tweet_id/replies', async (c) => {
    const tweetId = Number(c.req.param('tweet_id'))
    const currentUser = c.get('currentUser')
    const body = await c.req.json<{ comment: string }>()

    if (!body.comment?.trim()) {
      return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Comment is required' } }, 400)
    }

    const tweet = db.select().from(tweets).where(eq(tweets.id, tweetId)).get()
    if (!tweet) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Tweet not found' } }, 404)
    }

    const result = db.insert(replies).values({
      comment: body.comment.trim(),
      UserId: currentUser.id,
      TweetId: tweetId,
    }).run()

    const newReply = db.select().from(replies).where(eq(replies.id, Number(result.lastInsertRowid))).get()!
    const user = db.select().from(users).where(eq(users.id, currentUser.id)).get()!

    return c.json({
      ...newReply,
      user: { id: user.id, name: user.name, account: user.account, avatar: user.avatar },
    }, 201)
  })

  // POST /api/tweets/:tweet_id/like
  app.post('/:tweet_id/like', async (c) => {
    const tweetId = Number(c.req.param('tweet_id'))
    const currentUser = c.get('currentUser')

    const tweet = db.select().from(tweets).where(eq(tweets.id, tweetId)).get()
    if (!tweet) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Tweet not found' } }, 404)
    }

    try {
      db.insert(likes).values({ UserId: currentUser.id, TweetId: tweetId }).run()
    } catch (e: any) {
      if (e.message?.includes('UNIQUE constraint')) {
        return c.json({ error: { code: 'CONFLICT', message: 'Already liked this tweet' } }, 409)
      }
      throw e
    }

    return c.json({ message: 'Tweet liked' })
  })

  // POST /api/tweets/:tweet_id/unlike
  app.post('/:tweet_id/unlike', async (c) => {
    const tweetId = Number(c.req.param('tweet_id'))
    const currentUser = c.get('currentUser')

    db.delete(likes).where(
      and(eq(likes.UserId, currentUser.id), eq(likes.TweetId, tweetId))
    ).run()

    return c.json({ message: 'Tweet unliked' })
  })

  return app
}
