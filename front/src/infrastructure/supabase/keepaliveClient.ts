import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * keepalive fetch を使う Supabase クライアント。
 * 操作ログの画面離脱時 flush 専用（api.md §6.3）。
 *
 * - sendBeacon は apikey ヘッダーを付けられないため使わない
 * - keepalive は 1 回あたり 64KB 上限 → LoggingService で分割して呼ぶ
 */
function keepaliveFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { ...init, keepalive: true })
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const keepaliveSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  global: { fetch: keepaliveFetch },
})
