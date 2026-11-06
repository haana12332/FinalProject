import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LoggingService } from '../LoggingService'
import type { OperationLogRepository, InsertableLog } from '../../repositories/OperationLogRepository'

// OperationLogRepository のモック
function makeRepo(insertMany = vi.fn().mockResolvedValue(undefined)): OperationLogRepository {
  return { insertMany }
}

describe('LoggingService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('add / flush', () => {
    it('add したエントリが flush で repo に渡される', async () => {
      const insertMany = vi.fn().mockResolvedValue(undefined)
      const service = new LoggingService(makeRepo(insertMany), 'session-1')

      service.add('object_select', { layer_type: 'organism' }, 'node-1')
      service.add('canvas_zoom', { scale: 1.5 })

      await service.flush()

      expect(insertMany).toHaveBeenCalledOnce()
      const logs: InsertableLog[] = insertMany.mock.calls[0][0]
      expect(logs).toHaveLength(2)
      expect(logs[0]).toMatchObject({
        session_id: 'session-1',
        event_type: 'object_select',
        target_node_id: 'node-1',
        payload: { layer_type: 'organism' },
      })
      expect(logs[1]).toMatchObject({
        session_id: 'session-1',
        event_type: 'canvas_zoom',
        target_node_id: null,
        payload: { scale: 1.5 },
      })
    })

    it('flush 後はバッファが空になる', async () => {
      const insertMany = vi.fn().mockResolvedValue(undefined)
      const service = new LoggingService(makeRepo(insertMany), 'session-1')

      service.add('canvas_pan', { x: 10, y: 20 })
      await service.flush()
      await service.flush()

      expect(insertMany).toHaveBeenCalledOnce()
    })

    it('空バッファの flush は repo を呼ばない', async () => {
      const insertMany = vi.fn()
      const service = new LoggingService(makeRepo(insertMany), 'session-1')

      await service.flush()

      expect(insertMany).not.toHaveBeenCalled()
    })
  })

  describe('定期 flush（タイマー）', () => {
    it('5秒後に自動的に flush される', async () => {
      const insertMany = vi.fn().mockResolvedValue(undefined)
      const service = new LoggingService(makeRepo(insertMany), 'session-1')

      service.add('layer_select', { layer_name: 'T_Body' })
      expect(insertMany).not.toHaveBeenCalled()

      await vi.runAllTimersAsync()

      expect(insertMany).toHaveBeenCalledOnce()
      service.dispose()
    })
  })

  describe('閾値（50件）での即時 flush', () => {
    it('50件到達で自動 flush される', async () => {
      const insertMany = vi.fn().mockResolvedValue(undefined)
      const service = new LoggingService(makeRepo(insertMany), 'session-1')

      for (let i = 0; i < 50; i++) {
        service.add('page_view', { page_name: `P_${i}` })
      }

      // 即時 flush は非同期なので次のマイクロタスクで確認
      await Promise.resolve()

      expect(insertMany).toHaveBeenCalled()
      service.dispose()
    })
  })

  describe('keepalive flush', () => {
    it('keepalive=true のとき options.keepalive=true で repo を呼ぶ', async () => {
      const insertMany = vi.fn().mockResolvedValue(undefined)
      const service = new LoggingService(makeRepo(insertMany), 'session-1')

      service.add('object_select', { layer_type: null })
      await service.flush(true)

      expect(insertMany).toHaveBeenCalledWith(
        expect.any(Array),
        { keepalive: true },
      )
    })

    it('keepalive=false（デフォルト）のとき options 引数なしで repo を呼ぶ', async () => {
      const insertMany = vi.fn().mockResolvedValue(undefined)
      const service = new LoggingService(makeRepo(insertMany), 'session-1')

      service.add('object_select', { layer_type: null })
      await service.flush()

      // options 引数を渡さずに呼ばれることを確認
      expect(insertMany).toHaveBeenCalledOnce()
      expect(insertMany.mock.calls[0].length).toBe(1)
    })
  })

  describe('dispose', () => {
    it('dispose 後はタイマーが発火しない', async () => {
      const insertMany = vi.fn().mockResolvedValue(undefined)
      const service = new LoggingService(makeRepo(insertMany), 'session-1')

      service.add('layer_select', { layer_name: 'T_Body' })
      service.dispose()

      await vi.runAllTimersAsync()

      expect(insertMany).not.toHaveBeenCalled()
    })
  })
})
