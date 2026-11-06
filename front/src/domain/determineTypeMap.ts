/**
 * 設計時の判断型（DetermineType）と属性型（AttributeType）の対応
 *
 * domain.md「設計時の判断型と属性の対応」表を実装。
 * 不変条件7の検証に使う。
 */
import type { AttributeType, DetermineType } from './enums'

/**
 * 判断型 → 付けられる属性型の一覧（正引き）
 * domain.md の対応表をそのまま実装。
 */
export const DETERMINE_TYPE_TO_ATTRIBUTE_TYPES: Readonly<
  Record<DetermineType, ReadonlyArray<AttributeType>>
> = {
  static_property: [
    'x',
    'y',
    'width',
    'height',
    'opacity',
    'fill',
    'stroke',
    'corner_radius',
    'path',
    'image_ref',
    'characters',
    'font_family',
    'font_size',
    'font_weight',
    'line_height',
    'letter_spacing',
    'text_align',
    'padding',
  ],
  arrangement: ['order', 'gap'],
  child_composition: ['composition'],
  object_purpose: ['purpose'],
  // class_or_token_purpose と class_or_token_reuse はどちらも class_or_token に付く
  class_or_token_purpose: ['class_or_token'],
  class_or_token_reuse: ['class_or_token'],
  dynamic_property: ['visibility', 'scroll_behavior', 'responsive'],
  state: ['variant'],
  data_input: ['input_format', 'selection_rule', 'validation_rule'],
  interaction: ['link_source', 'hit_area', 'trigger', 'transition_method'],
  state_transition: [
    'impact_scope',
    'animation',
    'initial_state',
    'source_handling',
    'return_state',
    'passed_values',
  ],
  target_device: ['target_device'],
}

/**
 * 属性型 → 付けられる判断型の一覧（逆引き）
 * DETERMINE_TYPE_TO_ATTRIBUTE_TYPES から自動生成する（手書きの重複を防ぐ）。
 */
export const ATTRIBUTE_TYPE_TO_DETERMINE_TYPES: Readonly<
  Record<AttributeType, ReadonlyArray<DetermineType>>
> = (() => {
  const map = new Map<AttributeType, DetermineType[]>()
  for (const [determineType, attrTypes] of Object.entries(
    DETERMINE_TYPE_TO_ATTRIBUTE_TYPES,
  ) as Array<[DetermineType, ReadonlyArray<AttributeType>]>) {
    for (const attrType of attrTypes) {
      const existing = map.get(attrType) ?? []
      existing.push(determineType)
      map.set(attrType, existing)
    }
  }
  return Object.fromEntries(map) as Record<AttributeType, ReadonlyArray<DetermineType>>
})()
