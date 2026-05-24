import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { db, sqlite } from './db/connection.js'
import 'dotenv/config'

const port = Number(process.env.PORT) || 3000
const app = createApp({ db, sqlite })

console.log(`Backend running on http://localhost:${port}`)
console.log(`API docs: http://localhost:${port}/docs`)

serve({ fetch: app.fetch, port })
