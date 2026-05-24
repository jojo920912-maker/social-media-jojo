import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  account: text('account').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  introduction: text('introduction').default(''),
  avatar: text('avatar').default('https://i.imgur.com/tQzgcPK.png'),
  banner: text('banner').default('https://i.imgur.com/xwLLnZh.png'),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  createdAt: text('createdAt').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updatedAt').notNull().default(sql`(datetime('now'))`),
})

export const tweets = sqliteTable('tweets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  description: text('description').notNull(),
  UserId: integer('UserId').notNull().references(() => users.id),
  createdAt: text('createdAt').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updatedAt').notNull().default(sql`(datetime('now'))`),
})

export const replies = sqliteTable('replies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  UserId: integer('UserId').notNull().references(() => users.id),
  TweetId: integer('TweetId').notNull().references(() => tweets.id, { onDelete: 'cascade' }),
  comment: text('comment').notNull(),
  createdAt: text('createdAt').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updatedAt').notNull().default(sql`(datetime('now'))`),
})

export const likes = sqliteTable('likes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  UserId: integer('UserId').notNull().references(() => users.id),
  TweetId: integer('TweetId').notNull().references(() => tweets.id, { onDelete: 'cascade' }),
  createdAt: text('createdAt').notNull().default(sql`(datetime('now'))`),
}, (table) => [
  uniqueIndex('likes_user_tweet_idx').on(table.UserId, table.TweetId),
])

export const followships = sqliteTable('followships', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  followerId: integer('followerId').notNull().references(() => users.id),
  followingId: integer('followingId').notNull().references(() => users.id),
  createdAt: text('createdAt').notNull().default(sql`(datetime('now'))`),
}, (table) => [
  uniqueIndex('followships_pair_idx').on(table.followerId, table.followingId),
])
