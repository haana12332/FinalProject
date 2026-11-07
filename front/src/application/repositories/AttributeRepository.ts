/**
 * 属性のリポジトリ（Issue #24 — #27 でも使う）
 * api.md §7.4
 */
import type { AttributeType, JsonValue, Attribute } from '../../domain'
import type { AppError } from '../AppError'

export type CreateAttributePayload = {
  node_id?: string
  link_id?: string
  attribute_type: AttributeType
  value: JsonValue | null
}

export interface AttributeRepository {
  /** source = 'manual' で属性を作成する */
  create(payload: CreateAttributePayload): Promise<Attribute | AppError>

  /** 属性の value を更新する */
  update(id: string, value: JsonValue | null): Promise<void | AppError>

  /** 属性を削除する */
  delete(id: string): Promise<void | AppError>
}
