import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../src/db/schema.js'
import { createApp } from '../src/app.js'
import { hashPassword } from '../src/helpers/password.js'
import { signToken } from '../src/helpers/token.js'
import type { DbContext } from '../src/db/connection.js'
import type { Hono } from 'hono'

export function createTestDb(): DbContext {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')

  sqlite.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      account TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      introduction TEXT DEFAULT '',
      avatar TEXT DEFAULT 'https://i.imgur.com/tQzgcPK.png',
      banner TEXT DEFAULT 'https://i.imgur.com/xwLLnZh.png',
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE tweets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      UserId INTEGER NOT NULL REFERENCES users(id),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      UserId INTEGER NOT NULL REFERENCES users(id),
      TweetId INTEGER NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      UserId INTEGER NOT NULL REFERENCES users(id),
      TweetId INTEGER NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE UNIQUE INDEX likes_user_tweet_idx ON likes(UserId, TweetId);
    CREATE TABLE followships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      followerId INTEGER NOT NULL REFERENCES users(id),
      followingId INTEGER NOT NULL REFERENCES users(id),
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE UNIQUE INDEX followships_pair_idx ON followships(followerId, followingId);
  `)

  const db = drizzle(sqlite, { schema })
  return { db, sqlite }
}

export async function seedTestDb({ db }: DbContext) {
  const hashedPw = await hashPassword('12345678')

  // Admin user (id=1)
  db.insert(schema.users).values({
    name: 'Admin', account: 'root', email: 'root@example.com',
    password: hashedPw, role: 'admin',
  }).run()

  // Regular users (id=2, id=3)
  db.insert(schema.users).values({
    name: 'Alice', account: 'user1', email: 'user1@example.com',
    password: hashedPw, role: 'user', introduction: 'Hello!',
  }).run()

  db.insert(schema.users).values({
    name: 'Bob', account: 'user2', email: 'user2@example.com',
    password: hashedPw, role: 'user', introduction: 'Hi there!',
  }).run()

  // A tweet by user1 (id=1)
  db.insert(schema.tweets).values({ description: 'Hello world!', UserId: 2 }).run()

  // A reply by user2 on tweet 1
  db.insert(schema.replies).values({ comment: 'Nice tweet!', UserId: 3, TweetId: 1 }).run()

  // user2 likes tweet 1
  db.insert(schema.likes).values({ UserId: 3, TweetId: 1 }).run()

  // user1 follows user2
  db.insert(schema.followships).values({ followerId: 2, followingId: 3 }).run()
}

export interface TestContext {
  app: Hono
  ctx: DbContext
  userToken: string
  user2Token: string
  adminToken: string
}

export async function setupTest(): Promise<TestContext> {
  const ctx = createTestDb()
  await seedTestDb(ctx)
  const app = createApp(ctx)

  const userToken = signToken({ id: 2, role: 'user' })
  const user2Token = signToken({ id: 3, role: 'user' })
  const adminToken = signToken({ id: 1, role: 'admin' })

  return { app, ctx, userToken, user2Token, adminToken }
}

export async function req(
  app: Hono,
  method: string,
  path: string,
  options: { token?: string; body?: any } = {},
) {
  const headers: Record<string, string> = {}
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`

  const init: RequestInit = { method, headers }
  if (options.body) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(options.body)
  }

  const res = await app.request(path, init)
  const json = await res.json()
  return { status: res.status, json }
}
