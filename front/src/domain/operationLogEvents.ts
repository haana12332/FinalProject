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
  // オブジェクト選択（#15）
  | 'object_select'
  | 'object_deselect'
  // レイヤーパネル（#16）
  | 'layer_expand'
  | 'layer_collapse'
  | 'layer_select'
  // ページ（#20）
  | 'page_view'
  // プロトタイプ（#25）
  | 'link_click'
  | 'prototype_start'
  | 'prototype_stop'
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
  layer_expand: { layer_name: string }
  layer_collapse: { layer_name: string }
  layer_select: { layer_name: string }
  page_view: { page_name: string }
  link_click: { link_name: string }
  prototype_start: Record<string, never>
  prototype_stop: Record<string, never>
  design_decision_view: { attribute_type: string }
  question_start: Record<string, never>
  question_submit: Record<string, never>
}

/** logEvent の payload 引数の型（型安全版） */
export type EventPayload<T extends EventType> = EventPayloadMap[T] extends JsonValue
  ? EventPayloadMap[T]
  : JsonValue
