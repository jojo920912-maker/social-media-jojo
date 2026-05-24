import { describe, it, expect, beforeAll } from 'vitest'
import { setupTest, req, type TestContext } from './setup.js'

describe('Auth', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await setupTest()
  })

  describe('POST /api/users/signin', () => {
    it('should login with valid credentials', async () => {
      const { status, json } = await req(ctx.app, 'POST', '/api/users/signin', {
        body: { account: 'user1', password: '12345678' },
      })
      expect(status).toBe(200)
      expect(json.token).toBeDefined()
      expect(json.user.account).toBe('user1')
      expect(json.user.password).toBeUndefined()
    })

    it('should login with email', async () => {
      const { status, json } = await req(ctx.app, 'POST', '/api/users/signin', {
        body: { account: 'user1@example.com', password: '12345678' },
      })
      expect(status).toBe(200)
      expect(json.token).toBeDefined()
    })

    it('should reject wrong password', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/users/signin', {
        body: { account: 'user1', password: 'wrongpassword' },
      })
      expect(status).toBe(401)
    })

    it('should reject non-existent account', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/users/signin', {
        body: { account: 'nobody', password: '12345678' },
      })
      expect(status).toBe(401)
    })
  })

  describe('POST /api/users (register)', () => {
    it('should register a new user', async () => {
      const { status, json } = await req(ctx.app, 'POST', '/api/users', {
        body: {
          name: 'NewUser', account: 'newuser', email: 'new@example.com',
          password: '12345678', checkPassword: '12345678',
        },
      })
      expect(status).toBe(201)
      expect(json.user.account).toBe('newuser')
      expect(json.user.password).toBeUndefined()
    })

    it('should reject duplicate account', async () => {
      const { status, json } = await req(ctx.app, 'POST', '/api/users', {
        body: {
          name: 'Dup', account: 'user1', email: 'dup@example.com',
          password: '12345678', checkPassword: '12345678',
        },
      })
      expect(status).toBe(409)
      expect(json.error.code).toBe('CONFLICT')
    })

    it('should reject duplicate email', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/users', {
        body: {
          name: 'Dup', account: 'dupaccount', email: 'user1@example.com',
          password: '12345678', checkPassword: '12345678',
        },
      })
      expect(status).toBe(409)
    })

    it('should reject mismatched passwords', async () => {
      const { status, json } = await req(ctx.app, 'POST', '/api/users', {
        body: {
          name: 'Mismatch', account: 'mismatch', email: 'mis@example.com',
          password: '12345678', checkPassword: '87654321',
        },
      })
      expect(status).toBe(400)
      expect(json.error.message).toContain('match')
    })
  })

  describe('GET /api/auth/test-token', () => {
    it('should verify valid user token', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/auth/test-token', {
        token: ctx.userToken,
      })
      expect(status).toBe(200)
      expect(json.account).toBe('user1')
    })

    it('should reject missing token', async () => {
      const { status } = await req(ctx.app, 'GET', '/api/auth/test-token')
      expect(status).toBe(401)
    })

    it('should reject invalid token', async () => {
      const { status } = await req(ctx.app, 'GET', '/api/auth/test-token', {
        token: 'invalid-token',
      })
      expect(status).toBe(401)
    })
  })

  describe('GET /api/auth/test-token-admin', () => {
    it('should verify admin token', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/auth/test-token-admin', {
        token: ctx.adminToken,
      })
      expect(status).toBe(200)
      expect(json.role).toBe('admin')
    })

    it('should reject non-admin token', async () => {
      const { status } = await req(ctx.app, 'GET', '/api/auth/test-token-admin', {
        token: ctx.userToken,
      })
      expect(status).toBe(403)
    })
  })
})
