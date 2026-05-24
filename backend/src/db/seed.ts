import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { sql } from 'drizzle-orm'
import argon2 from 'argon2'
import * as schema from './schema.js'
import 'dotenv/config'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const DB_PATH = process.env.DATABASE_PATH || './data/social-media.sqlite'

async function seed() {
  mkdirSync(dirname(DB_PATH), { recursive: true })
  const sqlite = new Database(DB_PATH)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })

  // Create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
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
    CREATE TABLE IF NOT EXISTS tweets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      UserId INTEGER NOT NULL REFERENCES users(id),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      UserId INTEGER NOT NULL REFERENCES users(id),
      TweetId INTEGER NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      UserId INTEGER NOT NULL REFERENCES users(id),
      TweetId INTEGER NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS likes_user_tweet_idx ON likes(UserId, TweetId);
    CREATE TABLE IF NOT EXISTS followships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      followerId INTEGER NOT NULL REFERENCES users(id),
      followingId INTEGER NOT NULL REFERENCES users(id),
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS followships_pair_idx ON followships(followerId, followingId);
  `)

  // Check if already seeded
  const existing = db.select().from(schema.users).all()
  if (existing.length > 0) {
    console.log('Database already seeded, skipping.')
    sqlite.close()
    return
  }

  const hashedPw = await argon2.hash('12345678')

  // Super user (admin, can login to both front and back office)
  db.insert(schema.users).values({
    name: 'Super User',
    account: 'test',
    email: 'test@gmail.com',
    password: hashedPw,
    role: 'admin',
    introduction: 'Super user for testing',
  }).run()

  // Admin user
  db.insert(schema.users).values({
    name: 'Root Admin',
    account: 'root',
    email: 'root@example.com',
    password: hashedPw,
    role: 'admin',
    introduction: 'Platform administrator',
  }).run()

  // Regular users
  const userSeeds = [
    { name: 'Alice Chen', account: 'user1', email: 'user1@example.com', introduction: 'Hello, I love coding!' },
    { name: 'Bob Wang', account: 'user2', email: 'user2@example.com', introduction: 'Full-stack developer' },
    { name: 'Carol Lin', account: 'user3', email: 'user3@example.com', introduction: 'Design enthusiast' },
    { name: 'David Lee', account: 'user4', email: 'user4@example.com', introduction: 'Backend engineer' },
    { name: 'Eve Wu', account: 'user5', email: 'user5@example.com', introduction: 'Frontend newbie, learning Vue!' },
  ]

  for (const u of userSeeds) {
    db.insert(schema.users).values({
      ...u,
      password: hashedPw,
      role: 'user',
    }).run()
  }

  console.log('Seeded 7 users (2 admin + 5 regular)')

  // Tweets (UserId 3-7 are user1-user5)
  const tweetSeeds = [
    { description: 'Just started learning Vue 3, it is amazing!', UserId: 3 },
    { description: 'Anyone knows a good restaurant near Taipei 101?', UserId: 3 },
    { description: 'Working on a new side project with Hono + SQLite', UserId: 4 },
    { description: 'TypeScript makes everything better, change my mind', UserId: 4 },
    { description: 'Just finished reading a great book on UX design', UserId: 5 },
    { description: 'CSS Grid is underrated, fight me', UserId: 5 },
    { description: 'Docker containers are the best thing since sliced bread', UserId: 6 },
    { description: 'Finally got my CI/CD pipeline working!', UserId: 6 },
    { description: 'Day 1 of learning frontend development, wish me luck!', UserId: 7 },
    { description: 'Successfully built my first component in Vue!', UserId: 7 },
  ]

  for (const t of tweetSeeds) {
    db.insert(schema.tweets).values(t).run()
  }

  console.log('Seeded 10 tweets')

  // Replies
  const replySeeds = [
    { UserId: 4, TweetId: 1, comment: 'Vue 3 Composition API is great!' },
    { UserId: 5, TweetId: 1, comment: 'Welcome to the Vue community!' },
    { UserId: 6, TweetId: 2, comment: 'Try Din Tai Fung, it is classic!' },
    { UserId: 3, TweetId: 3, comment: 'Sounds cool, what is it about?' },
    { UserId: 7, TweetId: 3, comment: 'I want to learn Hono too!' },
    { UserId: 3, TweetId: 4, comment: 'Totally agree!' },
    { UserId: 5, TweetId: 5, comment: 'Which book? I need recommendations!' },
    { UserId: 4, TweetId: 6, comment: 'Flexbox is pretty great too though' },
    { UserId: 3, TweetId: 7, comment: 'Kubernetes next?' },
    { UserId: 6, TweetId: 9, comment: 'Good luck! You will love it!' },
    { UserId: 4, TweetId: 9, comment: 'Feel free to ask questions!' },
    { UserId: 3, TweetId: 10, comment: 'Congrats! Keep going!' },
    { UserId: 5, TweetId: 10, comment: 'That is a great milestone!' },
    { UserId: 7, TweetId: 4, comment: 'I am still learning JavaScript first...' },
    { UserId: 6, TweetId: 5, comment: 'Design thinking is so important' },
  ]

  for (const r of replySeeds) {
    db.insert(schema.replies).values(r).run()
  }

  console.log('Seeded 15 replies')

  // Likes
  const likeSeeds = [
    { UserId: 3, TweetId: 3 }, { UserId: 3, TweetId: 5 }, { UserId: 3, TweetId: 9 }, { UserId: 3, TweetId: 10 },
    { UserId: 4, TweetId: 1 }, { UserId: 4, TweetId: 5 }, { UserId: 4, TweetId: 9 }, { UserId: 4, TweetId: 10 },
    { UserId: 5, TweetId: 1 }, { UserId: 5, TweetId: 3 }, { UserId: 5, TweetId: 7 }, { UserId: 5, TweetId: 9 },
    { UserId: 6, TweetId: 1 }, { UserId: 6, TweetId: 4 }, { UserId: 6, TweetId: 9 }, { UserId: 6, TweetId: 10 },
    { UserId: 7, TweetId: 1 }, { UserId: 7, TweetId: 3 }, { UserId: 7, TweetId: 5 }, { UserId: 7, TweetId: 7 },
  ]

  for (const l of likeSeeds) {
    db.insert(schema.likes).values(l).run()
  }

  console.log('Seeded 20 likes')

  // Followships
  const followSeeds = [
    { followerId: 3, followingId: 4 }, { followerId: 3, followingId: 5 },
    { followerId: 4, followingId: 3 }, { followerId: 4, followingId: 6 },
    { followerId: 5, followingId: 3 }, { followerId: 5, followingId: 7 },
    { followerId: 6, followingId: 3 }, { followerId: 7, followingId: 3 },
  ]

  for (const f of followSeeds) {
    db.insert(schema.followships).values(f).run()
  }

  console.log('Seeded 8 followships')
  console.log('\nSeed complete! Test accounts:')
  console.log('  Super user: test@gmail.com / 12345678 (admin)')
  console.log('  Admin: root / 12345678')
  console.log('  Users: user1~user5 / 12345678')

  sqlite.close()
}

seed().catch(console.error)
