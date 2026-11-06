import type { JsonValue } from '../../domain'
import type { EventType } from '../../domain/operationLogEvents'
import type { OperationLogRepository, InsertableLog } from '../repositories/OperationLogRepository'

/** バッファに積む前の一時エントリ（session_id は flush 時に付ける） */
type PendingEntry = {
  event_type: EventType
  target_node_id: string | null
  payload: JsonValue
  occurred_at: string
}

/**
 * 操作ログのバッファ管理クラス。
 *
 * - `add()` でエントリをバッファに積む
 * - 一定件数 or 一定時間でまとめて flush する
 * - `flush(keepalive: true)` で画面離脱時にも確実に送る
 * - dispose() で内部タイマーをクリアする（React の useEffect cleanup で呼ぶ）
 */
export class LoggingService {
  private buffer: PendingEntry[] = []
  private flushTimer: ReturnType<typeof setTimeout> | null = null

  /** バッファがこの件数を超えたら即 flush */
  private readonly FLUSH_THRESHOLD = 50
  /** 通常の定期 flush 間隔（ms） */
  private readonly FLUSH_INTERVAL_MS = 5_000
  /** keepalive 1 回あたりの最大件数（64KB 制限対策） */
  private readonly KEEPALIVE_CHUNK = 200

  private readonly repo: OperationLogRepository
  private readonly sessionId: string

  constructor(repo: OperationLogRepository, sessionId: string) {
    this.repo = repo
    this.sessionId = sessionId
  }

  add(eventType: EventType, payload: JsonValue, targetNodeId: string | null = null): void {
    this.buffer.push({
      event_type: eventType,
      target_node_id: targetNodeId,
      payload,
      occurred_at: new Date().toISOString(),
    })

    if (this.buffer.length >= this.FLUSH_THRESHOLD) {
      void this.flush()
    } else {
      this.scheduleFlush()
    }
  }

  /**
   * バッファの内容を送信する。
   * @param keepalive true のとき keepalive fetch を使う（画面離脱時）
   */
  async flush(keepalive = false): Promise<void> {
    this.clearFlushTimer()

    if (this.buffer.length === 0) return

    const toSend = this.buffer.splice(0)
    const logs: InsertableLog[] = toSend.map(e => ({
      session_id: this.sessionId,
      event_type: e.event_type,
      target_node_id: e.target_node_id,
      payload: e.payload,
      occurred_at: e.occurred_at,
    }))

    if (keepalive) {
      // 64KB 制限対策：KEEPALIVE_CHUNK 件ずつ分割して送る
      for (let i = 0; i < logs.length; i += this.KEEPALIVE_CHUNK) {
        const chunk = logs.slice(i, i + this.KEEPALIVE_CHUNK)
        const result = await this.repo.insertMany(chunk, { keepalive: true })
        if (result && 'code' in result) {
          console.error('[LoggingService] keepalive flush failed:', result)
        }
      }
    } else {
      const result = await this.repo.insertMany(logs)
      if (result && 'code' in result) {
        console.error('[LoggingService] flush failed:', result)
      }
    }
  }

  /** タイマーをクリアしてリソースを解放する（useEffect cleanup で使う） */
  dispose(): void {
    this.clearFlushTimer()
  }

  private scheduleFlush(): void {
    if (this.flushTimer !== null) return
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null
      void this.flush()
    }, this.FLUSH_INTERVAL_MS)
  }

  private clearFlushTimer(): void {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
  }
}
