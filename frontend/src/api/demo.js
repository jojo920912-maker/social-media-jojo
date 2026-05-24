/**
 * API Demo - 示範如何用 fetch 呼叫後端 API
 *
 * 這個檔案是給前端開發的範例，展示如何：
 * 1. 呼叫不需要登入的 API
 * 2. 登入取得 token
 * 3. 帶著 token 呼叫需要驗證的 API
 *
 * 後端 API 文件頁面：http://localhost:3000/docs
 */

const BASE_URL = '/api'

/**
 * 呼叫 Hello API（不需要登入）
 * @returns {Promise<{message: string}>}
 */
export async function fetchHello() {
  const res = await fetch(`${BASE_URL}/hello`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
