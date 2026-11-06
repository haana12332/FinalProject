import { createContext } from 'react'
import type { JsonValue } from '../../domain'
import type { EventType } from '../../domain/operationLogEvents'

export type LoggingContextValue = {
  /**
   * 操作ログを記録する。
   * - 被験者モード: バッファに積んでまとめて保存
   * - 研究者モード（セッションなし）: 何もしない
   *
   * @param type イベント種別（domain/operationLogEvents.ts で定義）
   * @param payload イベントのデータ
   * @param targetNodeId 対象ノードの ID（任意）
   */
  logEvent: (type: EventType, payload: JsonValue, targetNodeId?: string | null) => void
}

/** デフォルト値: 研究者モード相当（何もしない） */
export const LoggingContext = createContext<LoggingContextValue>({
  logEvent: () => {},
})
