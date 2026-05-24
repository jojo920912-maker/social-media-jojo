import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from '@hono/node-server/serve-static'
import { authRoutes } from './routes/auth.js'
import { tweetRoutes } from './routes/tweets.js'
import { userRoutes } from './routes/users.js'
import { followshipRoutes } from './routes/followships.js'
import { adminRoutes } from './routes/admin.js'
import type { DbContext } from './db/connection.js'

export function createApp(ctx: DbContext) {
  const app = new Hono()

  app.use('*', cors())

  // Static files for uploads
  app.use('/uploads/*', serveStatic({ root: './' }))

  // Hello API (demo for frontend)
  app.get('/api/hello', (c) => {
    return c.json({ message: 'Hello from backend!' })
  })

  // Mount routes
  const auth = authRoutes(ctx)
  app.route('/api', auth)

  app.route('/api/tweets', tweetRoutes(ctx))
  app.route('/api/users', userRoutes(ctx))
  app.route('/api/followships', followshipRoutes(ctx))
  app.route('/api/admin', adminRoutes(ctx))

  // Simple API docs page
  app.get('/docs', (c) => {
    return c.html(getDocsHtml())
  })

  return app
}

function getDocsHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>2026 Social Media API Docs</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #c9d1d9; line-height: 1.6; padding: 2rem; }
    h1 { color: #58a6ff; margin-bottom: 0.5rem; }
    h2 { color: #79c0ff; margin: 2rem 0 1rem; border-bottom: 1px solid #21262d; padding-bottom: 0.5rem; }
    h3 { color: #d2a8ff; margin: 1.5rem 0 0.5rem; }
    .subtitle { color: #8b949e; margin-bottom: 2rem; }
    .endpoint { background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 1rem; margin: 0.5rem 0; display: flex; align-items: center; gap: 1rem; }
    .method { font-weight: bold; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; min-width: 60px; text-align: center; }
    .GET { background: #1f6feb33; color: #58a6ff; }
    .POST { background: #2ea04333; color: #3fb950; }
    .PUT { background: #d29922aa; color: #e3b341; }
    .DELETE { background: #f8514933; color: #f85149; }
    .path { font-family: 'SFMono-Regular', Consolas, monospace; color: #c9d1d9; }
    .desc { color: #8b949e; margin-left: auto; }
    .auth-badge { font-size: 0.75rem; padding: 0.15rem 0.4rem; border-radius: 3px; background: #388bfd33; color: #58a6ff; }
    .section { margin-bottom: 2rem; }
    code { background: #161b22; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9rem; }
    pre { background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 1rem; overflow-x: auto; margin: 0.5rem 0; }
    .test-section { background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
    .test-section h3 { margin-top: 0; }
    input, button, textarea { font-family: inherit; font-size: 0.9rem; }
    input, textarea { background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; padding: 0.5rem; border-radius: 4px; width: 100%; }
    button { background: #238636; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin: 0.5rem 0.5rem 0.5rem 0; }
    button:hover { background: #2ea043; }
    #result { margin-top: 1rem; white-space: pre-wrap; word-break: break-all; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 0.5rem 0; }
  </style>
</head>
<body>
  <h1>2026 Social Media API</h1>
  <p class="subtitle">Interactive API documentation — base URL: <code>http://localhost:3000</code></p>

  <h2>Test Console</h2>
  <div class="test-section">
    <h3>Quick Login</h3>
    <div class="grid">
      <input id="loginAccount" placeholder="account (e.g. user1 or test@gmail.com)" value="user1">
      <input id="loginPassword" placeholder="password" value="12345678" type="password">
    </div>
    <button onclick="doLogin()">Login as User</button>
    <button onclick="doAdminLogin()">Login as Admin</button>
    <p style="margin-top:0.5rem;color:#8b949e">Token: <code id="currentToken" style="word-break:break-all">none</code></p>

    <h3 style="margin-top:1.5rem">Try an API</h3>
    <div class="grid">
      <select id="reqMethod" style="background:#0d1117;border:1px solid #30363d;color:#c9d1d9;padding:0.5rem;border-radius:4px">
        <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
      </select>
      <input id="reqPath" placeholder="/api/tweets" value="/api/tweets">
    </div>
    <textarea id="reqBody" rows="3" placeholder='{"description":"Hello world!"}' style="margin-top:0.5rem"></textarea>
    <button onclick="doRequest()">Send Request</button>
    <pre id="result">Response will appear here...</pre>
  </div>

  <h2>Endpoints</h2>

  <div class="section">
    <h3>Auth</h3>
    <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/users/signin</span><span class="desc">Login (body: account, password)</span></div>
    <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/users</span><span class="desc">Register (body: name, account, email, password, checkPassword)</span></div>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/auth/test-token</span><span class="desc">Verify user token</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/auth/test-token-admin</span><span class="desc">Verify admin token</span><span class="auth-badge">admin</span></div>
  </div>

  <div class="section">
    <h3>Tweets</h3>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/tweets</span><span class="desc">Get all tweets</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/tweets/:tweet_id</span><span class="desc">Get single tweet</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/tweets</span><span class="desc">Create tweet (body: description)</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/tweets/:tweet_id/replies</span><span class="desc">Get tweet replies</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/tweets/:tweet_id/replies</span><span class="desc">Reply to tweet (body: comment)</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/tweets/:tweet_id/like</span><span class="desc">Like a tweet</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/tweets/:tweet_id/unlike</span><span class="desc">Unlike a tweet</span><span class="auth-badge">auth</span></div>
  </div>

  <div class="section">
    <h3>Users</h3>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/users/top</span><span class="desc">Get recommended users</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/users/:userId</span><span class="desc">Get user profile</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method PUT">PUT</span><span class="path">/api/users/:userId</span><span class="desc">Update profile (FormData)</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/users/:userId/tweets</span><span class="desc">User's tweets</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/users/:userId/replied_tweets</span><span class="desc">User's replies</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/users/:userId/likes</span><span class="desc">User's liked tweets</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/users/:userId/followings</span><span class="desc">User's following list</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/users/:userId/followers</span><span class="desc">User's followers list</span><span class="auth-badge">auth</span></div>
  </div>

  <div class="section">
    <h3>Followships</h3>
    <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/followships</span><span class="desc">Follow user (body: id)</span><span class="auth-badge">auth</span></div>
    <div class="endpoint"><span class="method DELETE">DELETE</span><span class="path">/api/followships/:followingId</span><span class="desc">Unfollow user</span><span class="auth-badge">auth</span></div>
  </div>

  <div class="section">
    <h3>Admin</h3>
    <div class="endpoint"><span class="method POST">POST</span><span class="path">/api/admin/signin</span><span class="desc">Admin login</span></div>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/admin/tweets</span><span class="desc">All tweets (admin view)</span><span class="auth-badge">admin</span></div>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/admin/users</span><span class="desc">All users</span><span class="auth-badge">admin</span></div>
    <div class="endpoint"><span class="method DELETE">DELETE</span><span class="path">/api/admin/tweets/:id</span><span class="desc">Delete tweet</span><span class="auth-badge">admin</span></div>
  </div>

  <div class="section">
    <h3>Demo</h3>
    <div class="endpoint"><span class="method GET">GET</span><span class="path">/api/hello</span><span class="desc">Hello world (no auth needed)</span></div>
  </div>

  <script>
    let token = '';
    async function doLogin() {
      const account = document.getElementById('loginAccount').value;
      const password = document.getElementById('loginPassword').value;
      const res = await fetch('/api/users/signin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ account, password }) });
      const data = await res.json();
      if (data.token) { token = data.token; document.getElementById('currentToken').textContent = token.slice(0,30) + '...'; }
      document.getElementById('result').textContent = JSON.stringify(data, null, 2);
    }
    async function doAdminLogin() {
      const account = document.getElementById('loginAccount').value;
      const password = document.getElementById('loginPassword').value;
      const res = await fetch('/api/admin/signin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ account, password }) });
      const data = await res.json();
      if (data.token) { token = data.token; document.getElementById('currentToken').textContent = token.slice(0,30) + '...'; }
      document.getElementById('result').textContent = JSON.stringify(data, null, 2);
    }
    async function doRequest() {
      const method = document.getElementById('reqMethod').value;
      const path = document.getElementById('reqPath').value;
      const bodyStr = document.getElementById('reqBody').value;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;
      const opts = { method, headers };
      if (bodyStr && method !== 'GET') opts.body = bodyStr;
      try {
        const res = await fetch(path, opts);
        const data = await res.json();
        document.getElementById('result').textContent = res.status + ' ' + res.statusText + '\\n\\n' + JSON.stringify(data, null, 2);
      } catch(e) { document.getElementById('result').textContent = 'Error: ' + e.message; }
    }
  </script>
</body>
</html>`
}
