/**
 * エンティティの TypeScript 型定義
 *
 * DB のカラム名と完全に一致させる（snake_case）。
 * api.md §2「変換の手間をなくす」方針に従い、マッピング不要。
 * React / Supabase には依存しない。
 */
import type { UserRole, LayerType, NodeKind, AttributeType, AttributeSource, DetermineType, Method } from './enums'

// --- 汎用 ---

/** jsonb 列に入る値の型 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

// --- エンティティ ---

export interface User {
  id: string
  name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface RequirementDocument {
  id: string
  project_id: string
  name: string
  summary: string | null
  todo: string[]
  notodo: string[]
  dod: string | null
  comment: string | null
  created_at: string
  updated_at: string
}

export interface GUI {
  id: string
  project_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

/**
 * ノード（レイヤーまたは図形）
 *
 * - レイヤー（P_ / T_ / O_ / M_ / A_ の接頭辞付き）: layer_type が LayerType
 * - 図形（接頭辞なし）: layer_type が null
 *   （svg-import-spec.md §12 の変更を先取りして nullable にしている）
 */
export interface Node {
  id: string
  gui_id: string
  /** 最上位ノード（page）は null */
  parent_node_id: string | null
  layer_name: string
  /** 図形は null */
  layer_type: LayerType | null
  node_kind: NodeKind
  /** 同じ親の中での順番（重なり順） */
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Link {
  id: string
  source_node_id: string
  target_node_id: string
  name: string
  created_at: string
  updated_at: string
}

/**
 * 属性
 *
 * - node_id と link_id はどちらか一方だけに値を持つ（不変条件1）
 * - value の形は attribute_type ごとに定まる（不変条件3）
 */
export interface Attribute {
  id: string
  /** node_id か link_id のどちらか一方が必ず設定される */
  node_id: string | null
  link_id: string | null
  attribute_type: AttributeType
  /** 値なし属性（composition, link_source）は null */
  value: JsonValue | null
  source: AttributeSource
  created_at: string
  updated_at: string
}

export interface DesignDecision {
  id: string
  attribute_id: string
  determine_type: DetermineType
  comments: string | null
  created_at: string
  updated_at: string
}

// --- 実験の運用 ---

export interface Session {
  id: string
  participant_id: string
  project_id: string
  method: Method
  order_index: number
  started_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
}

export interface OperationLog {
  id: string
  session_id: string
  event_type: string
  target_node_id: string | null
  payload: JsonValue
  occurred_at: string
  created_at: string
}

export interface Question {
  id: string
  session_id: string
  body: string
  submitted_at: string | null
  created_at: string
  updated_at: string
}

export interface Answer {
  id: string
  question_id: string
  body: string
  submitted_at: string | null
  created_at: string
  updated_at: string
}

export interface TimelineEvent {
  id: string
  project_id: string
  step_index: number
  target_node_id: string | null
  action: string
  rationale: string | null
  created_at: string
  updated_at: string
}
