import type { AppError } from '../AppError'

export type InsertableLog = {
  session_id: string
  event_type: string
  target_node_id: string | null
  payload: unknown
  occurred_at: string
}

export interface OperationLogRepository {
  /**
   * 操作ログを一括 INSERT する。
   * @param logs INSERT するログの配列（空配列の場合は何もしない）
   * @param options.keepalive true の場合 keepalive fetch を使う（画面離脱時）
   */
  insertMany(
    logs: InsertableLog[],
    options?: { keepalive?: boolean },
  ): Promise<void | AppError>
}
