import { describe, it, expect, beforeAll } from 'vitest'
import { setupTest, req, type TestContext } from './setup.js'

describe('Admin', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await setupTest()
  })

  describe('POST /api/admin/signin', () => {
    it('should login as admin', async () => {
      const { status, json } = await req(ctx.app, 'POST', '/api/admin/signin', {
        body: { account: 'root', password: '12345678' },
      })
      expect(status).toBe(200)
      expect(json.token).toBeDefined()
      expect(json.user.role).toBe('admin')
    })

    it('should reject non-admin user', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/admin/signin', {
        body: { account: 'user1', password: '12345678' },
      })
      expect(status).toBe(403)
    })

    it('should reject wrong password', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/admin/signin', {
        body: { account: 'root', password: 'wrong' },
      })
      expect(status).toBe(401)
    })
  })

  describe('GET /api/admin/tweets', () => {
    it('should return all tweets for admin', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/admin/tweets', {
        token: ctx.adminToken,
      })
      expect(status).toBe(200)
      expect(Array.isArray(json)).toBe(true)
      expect(json.length).toBeGreaterThan(0)
      expect(json[0].user).toBeDefined()
    })

    it('should reject non-admin access', async () => {
      const { status } = await req(ctx.app, 'GET', '/api/admin/tweets', {
        token: ctx.userToken,
      })
      expect(status).toBe(403)
    })
  })

  describe('GET /api/admin/users', () => {
    it('should return all users for admin', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/admin/users', {
        token: ctx.adminToken,
      })
      expect(status).toBe(200)
      expect(Array.isArray(json)).toBe(true)
      expect(json.length).toBeGreaterThanOrEqual(3)
      expect(json[0]).toHaveProperty('tweetsCount')
      expect(json[0]).toHaveProperty('followersCount')
    })
  })

  describe('DELETE /api/admin/tweets/:id', () => {
    it('should delete a tweet', async () => {
      const { status } = await req(ctx.app, 'DELETE', '/api/admin/tweets/1', {
        token: ctx.adminToken,
      })
      expect(status).toBe(200)

      // Verify tweet is gone
      const { status: getStatus } = await req(ctx.app, 'GET', '/api/tweets/1', {
        token: ctx.userToken,
      })
      expect(getStatus).toBe(404)
    })

    it('should return 404 for non-existent tweet', async () => {
      const { status } = await req(ctx.app, 'DELETE', '/api/admin/tweets/999', {
        token: ctx.adminToken,
      })
      expect(status).toBe(404)
    })

    it('should reject non-admin access', async () => {
      const { status } = await req(ctx.app, 'DELETE', '/api/admin/tweets/1', {
        token: ctx.userToken,
      })
      expect(status).toBe(403)
    })
  })
})
