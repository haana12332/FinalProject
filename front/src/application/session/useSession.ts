import { useContext } from 'react'
import { SessionContext, type SessionState } from './SessionContext'

/**
 * 現在のセッション文脈を返す。
 * - 被験者モード: SessionState
 * - 研究者モード（セッションなし）: null
 */
export function useSession(): SessionState | null {
  return useContext(SessionContext)
}
