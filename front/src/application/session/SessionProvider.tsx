import { type ReactNode, useState } from 'react'
import { SessionContext, type SessionState } from './SessionContext'

/**
 * セッション Provider のシェル。
 * 被験者 ID の入力・sessionStorage からの復元は #30 で実装する。
 * 現時点では session を null（研究者モード）のまま提供する。
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  // #30 でここに session の初期化ロジックを追加する
  const [session] = useState<SessionState | null>(null)

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  )
}
