/**
 * 状態遷移リンクのリポジトリ（Issue #24）
 * api.md §7.4
 */
import type { AttributeType } from '../../domain'
import type { JsonValue } from '../../domain/entities'
import type { AppError } from '../AppError'

export type CreateLinkPayload = {
  source_node_id: string
  target_node_id: string
  name: string
  /** リンクに付ける属性（trigger など） */
  attributes: Array<{
    attribute_type: AttributeType
    value: JsonValue | null
  }>
}

export interface LinkRepository {
  /** リンクと属性を 1 トランザクションで保存する（create_link RPC） */
  create(payload: CreateLinkPayload): Promise<{ link_id: string } | AppError>

  /** リンク名を更新する */
  update(id: string, name: string): Promise<void | AppError>

  /** リンクと属性を削除する（ON DELETE CASCADE） */
  delete(id: string): Promise<void | AppError>
}
