import { describe, it, expect, beforeAll } from 'vitest'
import { setupTest, req, type TestContext } from './setup.js'

describe('Users', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await setupTest()
  })

  describe('GET /api/users/top', () => {
    it('should return top users', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/users/top', { token: ctx.userToken })
      expect(status).toBe(200)
      expect(Array.isArray(json)).toBe(true)
      // user2 (Bob, id=3) has 1 follower, should appear
      const bob = json.find((u: any) => u.account === 'user2')
      expect(bob).toBeDefined()
      expect(bob.followersCount).toBe(1)
      expect(typeof bob.isFollowed).toBe('boolean')
    })

    it('should not include current user', async () => {
      const { json } = await req(ctx.app, 'GET', '/api/users/top', { token: ctx.userToken })
      const self = json.find((u: any) => u.account === 'user1')
      expect(self).toBeUndefined()
    })
  })

  describe('GET /api/users/:userId', () => {
    it('should return user profile with counts', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/users/2', { token: ctx.userToken })
      expect(status).toBe(200)
      expect(json.account).toBe('user1')
      expect(json.tweetsCount).toBeGreaterThanOrEqual(1)
      expect(typeof json.followersCount).toBe('number')
      expect(typeof json.followingsCount).toBe('number')
      expect(typeof json.isFollowed).toBe('boolean')
      expect(json.password).toBeUndefined()
    })

    it('should return 404 for non-existent user', async () => {
      const { status } = await req(ctx.app, 'GET', '/api/users/999', { token: ctx.userToken })
      expect(status).toBe(404)
    })
  })

  describe('PUT /api/users/:userId', () => {
    it('should reject editing another user', async () => {
      const { status } = await req(ctx.app, 'PUT', '/api/users/3', {
        token: ctx.userToken,
        body: { name: 'Hacked' },
      })
      expect(status).toBe(403)
    })
  })

  describe('GET /api/users/:userId/tweets', () => {
    it('should return user tweets', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/users/2/tweets', { token: ctx.userToken })
      expect(status).toBe(200)
      expect(Array.isArray(json)).toBe(true)
      expect(json.length).toBeGreaterThan(0)
      expect(json[0].user.account).toBe('user1')
    })
  })

  describe('GET /api/users/:userId/replied_tweets', () => {
    it('should return user replied tweets', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/users/3/replied_tweets', { token: ctx.userToken })
      expect(status).toBe(200)
      expect(Array.isArray(json)).toBe(true)
      expect(json.length).toBe(1)
      expect(json[0].comment).toBe('Nice tweet!')
      expect(json[0].Tweet).toBeDefined()
    })
  })

  describe('GET /api/users/:userId/likes', () => {
    it('should return user liked tweets', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/users/3/likes', { token: ctx.userToken })
      expect(status).toBe(200)
      expect(Array.isArray(json)).toBe(true)
      expect(json.length).toBe(1)
    })
  })

  describe('GET /api/users/:userId/followings', () => {
    it('should return followings', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/users/2/followings', { token: ctx.userToken })
      expect(status).toBe(200)
      expect(json.length).toBe(1)
      expect(json[0].account).toBe('user2')
    })
  })

  describe('GET /api/users/:userId/followers', () => {
    it('should return followers', async () => {
      const { status, json } = await req(ctx.app, 'GET', '/api/users/3/followers', { token: ctx.userToken })
      expect(status).toBe(200)
      expect(json.length).toBe(1)
      expect(json[0].account).toBe('user1')
    })
  })
})
