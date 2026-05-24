import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import * as schema from './schema.js'
import 'dotenv/config'

const DB_PATH = process.env.DATABASE_PATH || './data/social-media.sqlite'

export interface DbContext {
  db: ReturnType<typeof drizzle<typeof schema>>
  sqlite: InstanceType<typeof Database>
}

export function createDb(dbPath: string = DB_PATH): DbContext {
  mkdirSync(dirname(dbPath), { recursive: true })
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })
  return { db, sqlite }
}

export function createMemoryDb(): DbContext {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })
  return { db, sqlite }
}

const defaultCtx = createDb()
export const db = defaultCtx.db
export const sqlite = defaultCtx.sqlite
export type AppDatabase = DbContext['db']
