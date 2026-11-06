import { z } from 'zod'

// ユーザーロール
export const UserRoleSchema = z.enum(['researcher', 'participant'])
export type UserRole = z.infer<typeof UserRoleSchema>

// Atomic Design の層
export const LayerTypeSchema = z.enum(['page', 'template', 'organism', 'molecule', 'atom'])
export type LayerType = z.infer<typeof LayerTypeSchema>

// Figma の図形の種類
export const NodeKindSchema = z.enum(['frame', 'group', 'rectangle', 'ellipse', 'vector', 'text', 'image'])
export type NodeKind = z.infer<typeof NodeKindSchema>

// 属性の出どころ
export const AttributeSourceSchema = z.enum(['figma', 'manual'])
export type AttributeSource = z.infer<typeof AttributeSourceSchema>

// 属性の種類（41種）
// - Figma 由来の視覚属性（x〜text_align）
// - 手動入力の設計属性（padding〜target_device）
// - リンク属性（link_source〜passed_values）
export const AttributeTypeSchema = z.enum([
  // --- Figma 由来の視覚属性 ---
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
  // --- 手動：静的プロパティ ---
  'padding',
  // --- 手動：配置 ---
  'order',
  'gap',
  // --- 手動：子オブジェクトの組み合わせ ---
  'composition',
  // --- 手動：目的 ---
  'purpose',
  // --- 手動：クラス／トークン ---
  'class_or_token',
  // --- 手動：動的プロパティ ---
  'visibility',
  'scroll_behavior',
  'responsive',
  // --- 手動：状態 ---
  'variant',
  // --- 手動：データ入力 ---
  'input_format',
  'selection_rule',
  'validation_rule',
  // --- 手動：対象デバイス ---
  'target_device',
  // --- リンク属性（state transition） ---
  'link_source',
  'hit_area',
  'trigger',
  'transition_method',
  'impact_scope',
  'animation',
  'initial_state',
  'source_handling',
  'return_state',
  'passed_values',
])
export type AttributeType = z.infer<typeof AttributeTypeSchema>

// 設計時の判断型（12種）
export const DetermineTypeSchema = z.enum([
  'static_property',
  'child_composition',
  'object_purpose',
  'dynamic_property',
  'state_transition',
  'arrangement',
  'class_or_token_purpose',
  'class_or_token_reuse',
  'interaction',
  'state',
  'data_input',
  'target_device',
])
export type DetermineType = z.infer<typeof DetermineTypeSchema>

// 実験の手法
export const MethodSchema = z.enum(['timeline', 'structural'])
export type Method = z.infer<typeof MethodSchema>
