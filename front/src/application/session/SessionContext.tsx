import { createContext } from 'react'
import type { Method } from '../../domain'

/**
 * 被験者セッションの文脈。
 * 研究者モードでは Provider に何も渡さず null のまま使う。
 * セッションの中身（participant_id の入力・sessionStorage からの復元）は #30 で実装する。
 */
export type SessionState = {
  participant_id: string
  session_id: string
  method: Method
}

export const SessionContext = createContext<SessionState | null>(null)
