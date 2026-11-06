/**
 * 属性の値スキーマ（Zod）
 *
 * domain.md「属性の定義」の「値の形」列を実装。
 * 取り込み・入力・表示のすべてで同じスキーマを使う（二重実装防止）。
 */
import { z } from 'zod'
import type { AttributeType } from './enums'

// --- パーツスキーマ ---

const FillItemSchema = z.object({
  color: z.string(),
  opacity: z.number().min(0).max(1),
})

const StrokeItemSchema = z.object({
  color: z.string(),
  weight: z.number().nonnegative(),
})

const CornerRadiusSchema = z.union([
  z.number().nonnegative(),
  z.tuple([
    z.number().nonnegative(),
    z.number().nonnegative(),
    z.number().nonnegative(),
    z.number().nonnegative(),
  ]),
])

// --- 属性ごとの value スキーマ ---
// Record<AttributeType, z.ZodType> に適合することを satisfies で保証する。

export const ATTRIBUTE_VALUE_SCHEMAS: Record<AttributeType, z.ZodType> = {
  // ---- Figma 由来の視覚属性 ----
  x: z.number(),
  y: z.number(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
  /** 0〜1 の不透明度 */
  opacity: z.number().min(0).max(1),
  /** 塗りのリスト。1件以上必須 */
  fill: z.array(FillItemSchema).min(1),
  /** 線のリスト。1件以上必須 */
  stroke: z.array(StrokeItemSchema).min(1),
  /** 角丸。均一なら number、4隅が違えば [tl, tr, br, bl] */
  corner_radius: CornerRadiusSchema,
  /** SVG の d 属性（vector のみ） */
  path: z.string(),
  /** Supabase Storage への参照パス（image のみ） */
  image_ref: z.string(),
  characters: z.string(),
  font_family: z.string(),
  font_size: z.number().positive(),
  /** CSS font-weight に対応。100〜900 */
  font_weight: z.number().min(100).max(900),
  /** 行の高さ（px）。自動なら null */
  line_height: z.number().positive().nullable(),
  letter_spacing: z.number(),
  text_align: z.enum(['left', 'center', 'right']),

  // ---- 手動入力：静的プロパティ ----
  /** padding。均一なら number、個別なら { top, right, bottom, left } */
  padding: z.union([
    z.number().nonnegative(),
    z.object({
      top: z.number().nonnegative(),
      right: z.number().nonnegative(),
      bottom: z.number().nonnegative(),
      left: z.number().nonnegative(),
    }),
  ]),

  // ---- 手動入力：配置 ----
  order: z.number().int().nonnegative(),
  gap: z.number().nonnegative(),

  // ---- 手動入力：値なし属性（設計時の判断の置き場として存在する） ----
  /** 子オブジェクトの組み合わせ採用。値は null（sort_order・parent_node_id から決まる） */
  composition: z.null(),
  /** 遷移の起点。値は null（source_node_id から決まる） */
  link_source: z.null(),

  // ---- 手動入力：目的・クラス・デバイス ----
  purpose: z.string(),
  class_or_token: z.string(),
  target_device: z.string(),

  // ---- 手動入力：動的プロパティ ----
  visibility: z.enum(['visible', 'hidden']),
  scroll_behavior: z.string(),
  responsive: z.string(),

  // ---- 手動入力：状態 ----
  variant: z.string(),

  // ---- 手動入力：データ入力仕様 ----
  input_format: z.string(),
  selection_rule: z.string(),
  validation_rule: z.string(),

  // ---- リンク属性（状態遷移） ----
  hit_area: z.object({
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
  }),
  trigger: z.enum(['click', 'hover']),
  transition_method: z.enum(['replace', 'overlay', 'back']),
  impact_scope: z.object({
    scope: z.enum(['self', 'others']),
    affected_node_ids: z.array(z.string()),
  }),
  animation: z.object({
    type: z.string(),
    duration_ms: z.number().nonnegative(),
  }),
  initial_state: z.string(),
  source_handling: z.enum(['keep', 'discard']),
  return_state: z.enum(['preserve', 'reset']),
  passed_values: z.array(z.string()),
}

/**
 * 指定した attribute_type の value を検証する。
 * 不変条件3（value の形）の実装。
 */
export function parseAttributeValue(
  attributeType: AttributeType,
  value: unknown,
): z.ZodSafeParseResult<unknown> {
  return ATTRIBUTE_VALUE_SCHEMAS[attributeType].safeParse(value)
}
