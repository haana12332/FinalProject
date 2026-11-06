import type { PostgrestError } from '@supabase/supabase-js'
import type { AppError } from '../../application/AppError'

/**
 * Supabase から返るエラーを AppError に変換する。
 * infrastructure 層の中でだけ使う。
 */
export function toAppError(error: PostgrestError | Error): AppError {
  // fetch の失敗（TypeError: Failed to fetch など）
  if (error instanceof TypeError) {
    return { code: 'network_error', message: '通信できませんでした。ネットワークを確認してください。' }
  }

  if (!(error instanceof Error) || !('code' in error)) {
    // PostgrestError として処理
    return mapPostgrestError(error as PostgrestError)
  }

  // 通常の Error（想定外）
  console.error('[internal_error]', error)
  return { code: 'internal_error', message: '予期しないエラーが発生しました。' }
}

function mapPostgrestError(error: PostgrestError): AppError {
  const code = error.code

  if (code === 'PGRST116') {
    return { code: 'not_found', message: 'データが見つかりませんでした。' }
  }

  if (code === '23505' || code === '23503') {
    return { code: 'conflict', message: '重複しているか、関連するデータがあるため操作できません。' }
  }

  if (code === 'DR001') {
    return { code: 'hierarchy_violation', message: '階層の制約に違反しています。', details: parseDetails(error.details) }
  }

  if (code === 'DR002') {
    return { code: 'naming_violation', message: 'レイヤー名の命名規則に違反しています。', details: parseDetails(error.details) }
  }

  if (code === '23514' || code === 'DR003') {
    return { code: 'domain_violation', message: 'データの不変条件に違反しています。', details: parseDetails(error.details) }
  }

  console.error('[internal_error]', error)
  return { code: 'internal_error', message: '予期しないエラーが発生しました。' }
}

function parseDetails(details: string | null): unknown[] | undefined {
  if (!details) return undefined
  try {
    const parsed = JSON.parse(details)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return [details]
  }
}
