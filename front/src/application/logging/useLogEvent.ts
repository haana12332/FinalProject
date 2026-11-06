import { useContext } from 'react'
import { LoggingContext, type LoggingContextValue } from './LoggingContext'

/**
 * 操作ログを記録するフックを返す。
 *
 * 使い方:
 * ```tsx
 * const { logEvent } = useLogEvent()
 * logEvent('object_select', { layer_type: 'organism' }, node.id)
 * ```
 */
export function useLogEvent(): LoggingContextValue {
  return useContext(LoggingContext)
}
