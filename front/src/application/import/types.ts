/**
 * SVG 取り込みの型定義
 * svg-import-spec.md §9 / api.md §6.2 に対応
 */
import type { LayerType, NodeKind, AttributeType } from '../../domain'

// ---- import_page に渡す形 ----

export type ImportAttribute = {
  attribute_type: AttributeType
  value: unknown
}

export type ImportNodePayload = {
  /** この呼び出し内の仮 ID（ノードの uuid はまだない） */
  ref: string
  parent_ref: string | null
  layer_name: string
  layer_type: LayerType | null
  node_kind: NodeKind
  sort_order: number
  attributes: ImportAttribute[]
}

export type ImportPayload = {
  nodes: ImportNodePayload[]
}

// ---- エラー / 警告 ----

export type ViolationCode = 'naming_violation' | 'hierarchy_violation'

export type ImportViolation = {
  code: ViolationCode
  rule: string
  /** null は "名前のないグループ" など識別子がない場合 */
  layer_name: string | null
  /** "P_Sample > T_Sample > Header" */
  path: string
  message: string
}

export type WarningRule = 'unsupported_element' | 'unsupported_fill' | 'unnamed_shape'

export type ImportWarning = {
  rule: WarningRule
  element: string
  message: string
}

// ---- パース結果 ----

export type ParseSuccess = {
  ok: true
  payload: ImportPayload
  warnings: ImportWarning[]
}

export type ParseFailure = {
  ok: false
  violations: ImportViolation[]
}

export type ParseResult = ParseSuccess | ParseFailure
