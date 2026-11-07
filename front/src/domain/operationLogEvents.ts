/**
 * 操作ログのイベント種別と payload の型
 *
 * event_type の確定リストは #6（実験運用仕様）で決める。
 * このファイルは #6 がマージされるまでの暫定セット。
 */
import type { JsonValue } from './entities'

// ---- イベント種別 ----

export type EventType =
  // キャンバス操作（#14）
  | 'canvas_zoom'
  | 'canvas_pan'
  // オブジェクト選択・層移動（#15）
  | 'object_select'
  | 'object_deselect'
  | 'layer_change'
  // レイヤーパネル（#16）
  | 'layer_expand'
  | 'layer_collapse'
  | 'layer_select'
  // 要件定義書（#21）
  | 'requirements_view'
  // ページ（#20）
  | 'page_view'
  // プロトタイプ（#25）
  | 'link_click'
  | 'prototype_start'
  | 'prototype_stop'
  | 'transition_fire'
  | 'hover'
  | 'mode_change'
  // 設計根拠（#26）
  | 'design_decision_view'
  // 質問（#31）
  | 'question_start'
  | 'question_submit'

// ---- payload の型 ----

export type EventPayloadMap = {
  canvas_zoom: { scale: number }
  canvas_pan: { x: number; y: number }
  object_select: { layer_type: string | null }
  object_deselect: Record<string, never>
  layer_change: { from: string | null; to: string | null }
  layer_expand: { layer_name: string }
  layer_collapse: { layer_name: string }
  layer_select: { layer_name: string }
  requirements_view: { project_id: string }
  page_view: { page_name: string }
  link_click: { link_name: string }
  prototype_start: Record<string, never>
  prototype_stop: Record<string, never>
  transition_fire: { link_name: string; from_node_id: string; to_node_id: string }
  hover: { node_id: string; node_name: string }
  mode_change: { from: string; to: string }
  design_decision_view: { attribute_type: string }
  question_start: Record<string, never>
  question_submit: Record<string, never>
}

/** logEvent の payload 引数の型（型安全版） */
export type EventPayload<T extends EventType> = EventPayloadMap[T] extends JsonValue
  ? EventPayloadMap[T]
  : JsonValue
