import { describe, it, expect } from 'vitest'
import type { PostgrestError } from '@supabase/supabase-js'
import { toAppError } from '../toAppError'

function makePostgrestError(code: string, details: string | null = null): PostgrestError {
  return { name: 'PostgrestError', message: '', code, details, hint: '' }
}

describe('toAppError', () => {
  it('PGRST116 → not_found', () => {
    expect(toAppError(makePostgrestError('PGRST116'))).toMatchObject({ code: 'not_found' })
  })

  it('23505 → conflict', () => {
    expect(toAppError(makePostgrestError('23505'))).toMatchObject({ code: 'conflict' })
  })

  it('23503 → conflict', () => {
    expect(toAppError(makePostgrestError('23503'))).toMatchObject({ code: 'conflict' })
  })

  it('DR001 → hierarchy_violation', () => {
    expect(toAppError(makePostgrestError('DR001'))).toMatchObject({ code: 'hierarchy_violation' })
  })

  it('DR002 → naming_violation', () => {
    expect(toAppError(makePostgrestError('DR002'))).toMatchObject({ code: 'naming_violation' })
  })

  it('23514 → domain_violation', () => {
    expect(toAppError(makePostgrestError('23514'))).toMatchObject({ code: 'domain_violation' })
  })

  it('DR003 → domain_violation', () => {
    expect(toAppError(makePostgrestError('DR003'))).toMatchObject({ code: 'domain_violation' })
  })

  it('未知のコード → internal_error', () => {
    expect(toAppError(makePostgrestError('99999'))).toMatchObject({ code: 'internal_error' })
  })

  it('TypeError（fetch 失敗） → network_error', () => {
    expect(toAppError(new TypeError('Failed to fetch'))).toMatchObject({ code: 'network_error' })
  })

  it('details が JSON 配列のとき details に展開される', () => {
    const result = toAppError(makePostgrestError('DR002', '[{"layer":"T_foo","reason":"prefix"}]'))
    expect(result.code).toBe('naming_violation')
    expect(result.details).toHaveLength(1)
  })

  it('details が null のとき details は undefined', () => {
    const result = toAppError(makePostgrestError('DR001', null))
    expect(result.details).toBeUndefined()
  })
})
