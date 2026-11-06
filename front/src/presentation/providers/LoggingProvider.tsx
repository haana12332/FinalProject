import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { useSession } from '../../application/session/useSession'
import { useRepositories } from './useRepositories'
import { LoggingService } from '../../application/logging/LoggingService'
import { LoggingContext } from '../../application/logging/LoggingContext'
import type { JsonValue } from '../../domain'
import type { EventType } from '../../domain/operationLogEvents'

/**
 * 操作ログの Provider。
 *
 * - セッションがあるとき（被験者モード）: LoggingService を生成し logEvent を有効にする
 * - セッションがないとき（研究者モード）: logEvent は何もしない
 * - 画面を離れるとき（visibilitychange hidden）: keepalive flush で残りを送り切る
 */
export function LoggingProvider({ children }: { children: ReactNode }) {
  const session = useSession()
  const { operationLog: repo } = useRepositories()
  const serviceRef = useRef<LoggingService | null>(null)

  // セッションが切り替わったら LoggingService を作り直す
  useEffect(() => {
    if (!session) {
      serviceRef.current?.dispose()
      serviceRef.current = null
      return
    }

    serviceRef.current?.dispose()
    serviceRef.current = new LoggingService(repo, session.session_id)

    return () => {
      serviceRef.current?.dispose()
      serviceRef.current = null
    }
  }, [session, repo])

  // 画面を離れるとき → keepalive flush
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && serviceRef.current) {
        void serviceRef.current.flush(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const logEvent = useCallback(
    (type: EventType, payload: JsonValue, targetNodeId?: string | null) => {
      serviceRef.current?.add(type, payload, targetNodeId ?? null)
    },
    [],
  )

  return (
    <LoggingContext.Provider value={{ logEvent }}>
      {children}
    </LoggingContext.Provider>
  )
}
