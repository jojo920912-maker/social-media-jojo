import { describe, it, expect, beforeAll } from 'vitest'
import { setupTest, req, type TestContext } from './setup.js'

describe('Followships', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await setupTest()
  })

  describe('POST /api/followships', () => {
    it('should follow a user', async () => {
      // user2 (id=3) follows user1 (id=2)
      const { status } = await req(ctx.app, 'POST', '/api/followships', {
        token: ctx.user2Token,
        body: { id: 2 },
      })
      expect(status).toBe(201)
    })

    it('should reject double follow', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/followships', {
        token: ctx.user2Token,
        body: { id: 2 },
      })
      expect(status).toBe(409)
    })

    it('should reject following yourself', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/followships', {
        token: ctx.userToken,
        body: { id: 2 },
      })
      expect(status).toBe(400)
    })

    it('should reject following non-existent user', async () => {
      const { status } = await req(ctx.app, 'POST', '/api/followships', {
        token: ctx.userToken,
        body: { id: 999 },
      })
      expect(status).toBe(404)
    })
  })

  describe('DELETE /api/followships/:followingId', () => {
    it('should unfollow a user', async () => {
      // user1 (id=2) already follows user2 (id=3) from seed
      const { status } = await req(ctx.app, 'DELETE', '/api/followships/3', {
        token: ctx.userToken,
      })
      expect(status).toBe(200)
    })

    it('should return 404 for non-existent followship', async () => {
      const { status } = await req(ctx.app, 'DELETE', '/api/followships/3', {
        token: ctx.userToken,
      })
      expect(status).toBe(404)
    })
  })
})
