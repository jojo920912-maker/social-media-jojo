import { describe, it, expect, beforeAll } from 'vitest'
import { setupTest, req, type TestContext } from './setup.js'

describe('Tweets', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await setupTest()
  })

  describe('GET /api/tweets', () => {
    it('should return all tweets', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/tweets', { token: ctx.userToken })
      expect(status).toBe(200)
      expect(Array.isArray(json)).toBe(true)
      expect(json.length).toBeGreaterThan(0)
      expect(json[0]).toHaveProperty('likesCount')
      expect(json[0]).toHaveProperty('repliesCount')
      expect(json[0]).toHaveProperty('isLiked')
      expect(json[0]).toHaveProperty('user')
    })

    it('should require auth', async () => {
      const { status } = await req(ctx.app, 'GET', '/api/tweets')
      expect(status).toBe(401)
    })
  })

  describe('GET /api/tweets/:tweet_id', () => {
    it('should return a single tweet', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/tweets/1', { token: ctx.userToken })
      expect(status).toBe(200)
      expect(json.id).toBe(1)
      expect(json.description).toBe('Hello world!')
      expect(json.likesCount).toBe(1)
      expect(json.repliesCount).toBe(1)
    })

    it('should return 404 for non-existent tweet', async () => {
      const { status } = await req(ctx.app, 'GET', '/api/tweets/999', { token: ctx.userToken })
      expect(status).toBe(404)
    })
  })

  describe('POST /api/tweets', () => {
    it('should create a tweet', async () => {
      const { status, json } = await req(ctx.app, 'POST', '/api/tweets', {
        token: ctx.userToken,
        body: { description: 'New tweet!' },
      })
      expect(status).toBe(201)
      expect(json.description).toBe('New tweet!')
      expect(json.likesCount).toBe(0)
      expect(json.user.account).toBe('user1')
    })

    it('should reject empty description', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/tweets', {
        token: ctx.userToken,
        body: { description: '' },
      })
      expect(status).toBe(400)
    })

    it('should reject description over 140 chars', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/tweets', {
        token: ctx.userToken,
        body: { description: 'a'.repeat(141) },
      })
      expect(status).toBe(400)
    })
  })

  describe('Replies', () => {
    it('should get replies for a tweet', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/tweets/1/replies', { token: ctx.userToken })
      expect(status).toBe(200)
      expect(Array.isArray(json)).toBe(true)
      expect(json.length).toBe(1)
      expect(json[0].comment).toBe('Nice tweet!')
      expect(json[0].user).toBeDefined()
    })

    it('should post a reply', async () => {
      const { status, json } = await req(ctx.app, 'POST', '/api/tweets/1/replies', {
        token: ctx.userToken,
        body: { comment: 'Great stuff!' },
      })
      expect(status).toBe(201)
      expect(json.comment).toBe('Great stuff!')
    })

    it('should reject empty comment', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/tweets/1/replies', {
        token: ctx.userToken,
        body: { comment: '' },
      })
      expect(status).toBe(400)
    })

    it('should reject reply to non-existent tweet', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/tweets/999/replies', {
        token: ctx.userToken,
        body: { comment: 'test' },
      })
      expect(status).toBe(404)
    })
  })

  describe('Like / Unlike', () => {
    it('should like a tweet', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/tweets/1/like', { token: ctx.userToken })
      expect(status).toBe(200)
    })

    it('should reject double like', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/tweets/1/like', { token: ctx.userToken })
      expect(status).toBe(409)
    })

    it('should unlike a tweet', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/tweets/1/unlike', { token: ctx.userToken })
      expect(status).toBe(200)
    })

    it('should reject like on non-existent tweet', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/tweets/999/like', { token: ctx.userToken })
      expect(status).toBe(404)
    })
  })
})
