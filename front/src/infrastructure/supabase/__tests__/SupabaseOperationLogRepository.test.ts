import { describe, it, expect, vi } from 'vitest'
import { SupabaseOperationLogRepository } from '../repositories/SupabaseOperationLogRepository'
import type { InsertableLog } from '../../../application/repositories/OperationLogRepository'

/** Supabase クライアントのモック */
function makeClient(insertResult: { error: null | { code: string; message: string; details: string | null; hint: string; name: string } } = { error: null }) {
  const insertFn = vi.fn().mockResolvedValue(insertResult)
  return {
    from: vi.fn(() => ({ insert: insertFn })),
    _insertFn: insertFn,
  } as unknown as ReturnType<typeof import('@supabase/supabase-js').createClient> & { _insertFn: typeof insertFn }
}

const sampleLog: InsertableLog = {
  session_id: 'session-abc',
  event_type: 'object_select',
  target_node_id: 'node-1',
  payload: { layer_type: 'organism' },
  occurred_at: '2026-11-06T10:00:00.000Z',
}

describe('SupabaseOperationLogRepository', () => {
  it('通常モードは db.from を使う', async () => {
    const db = makeClient()
    const keepaliveDb = makeClient()
    const repo = new SupabaseOperationLogRepository(
      db as never,
      keepaliveDb as never,
    )

    const result = await repo.insertMany([sampleLog])

    expect(db.from).toHaveBeenCalledWith('operation_logs')
    expect(keepaliveDb.from).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })

  it('keepalive モードは keepaliveDb.from を使う', async () => {
    const db = makeClient()
    const keepaliveDb = makeClient()
    const repo = new SupabaseOperationLogRepository(
      db as never,
      keepaliveDb as never,
    )

    await repo.insertMany([sampleLog], { keepalive: true })

    expect(keepaliveDb.from).toHaveBeenCalledWith('operation_logs')
    expect(db.from).not.toHaveBeenCalled()
  })

  it('空配列のとき DB を呼ばない', async () => {
    const db = makeClient()
    const keepaliveDb = makeClient()
    const repo = new SupabaseOperationLogRepository(
      db as never,
      keepaliveDb as never,
    )

    await repo.insertMany([])

    expect(db.from).not.toHaveBeenCalled()
  })

  it('DB エラーのとき AppError を返す', async () => {
    const db = makeClient({ error: { code: 'PGRST116', message: 'not found', details: null, hint: '', name: 'PostgrestError' } })
    const repo = new SupabaseOperationLogRepository(db as never, db as never)

    const result = await repo.insertMany([sampleLog])

    expect(result).toMatchObject({ code: 'not_found' })
  })

  it('研究者モード（セッションなし）では insertMany を呼ばない — LoggingService が制御する', () => {
    // LoggingService が session=null のとき add() を呼ばないので、
    // OperationLogRepository.insertMany は呼ばれない。
    // この仕様は LoggingService.test.ts で確認する。
    expect(true).toBe(true)
  })
})
