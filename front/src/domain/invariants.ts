/**
 * 不変条件の検証関数
 *
 * domain.md §不変条件、db-schema.md §4.2 を実装。
 * React / Supabase に依存しない純粋関数。
 * 保存前に呼び出し、違反があれば保存しない。
 */
import type { AttributeType, AttributeSource, NodeKind, LayerType, DetermineType } from './enums'
import { FIGMA_ATTRIBUTE_TYPES, LINK_ATTRIBUTE_TYPES, FIGMA_ATTRIBUTE_FOR_NODE_KIND } from './nodeAttributeMap'
import { ATTRIBUTE_TYPE_TO_DETERMINE_TYPES } from './determineTypeMap'
import { parseAttributeValue } from './valueSchemas'

/** 検証結果 */
export type ValidationResult = { ok: true } | { ok: false; message: string }

const OK: ValidationResult = { ok: true }
const fail = (message: string): ValidationResult => ({ ok: false, message })

// ---------------------------------------------------------------------------
// 不変条件1：node_id と link_id はどちらか一方だけに値を持つ
// ---------------------------------------------------------------------------

/**
 * 不変条件1
 * `Attributes` は node_id か link_id のどちらか一方だけを持つ。
 * 両方 null、両方値あり はいずれも違反。
 */
export function checkAttributeOwnership(
  nodeId: string | null,
  linkId: string | null,
): ValidationResult {
  const hasNode = nodeId !== null
  const hasLink = linkId !== null
  if (hasNode === hasLink) {
    return hasNode
      ? fail('node_id と link_id の両方に値があります。どちらか一方だけにしてください')
      : fail('node_id と link_id の両方が null です。どちらかに値を設定してください')
  }
  return OK
}

// ---------------------------------------------------------------------------
// 不変条件2：node_kind に許された attribute_type だけを持つ
// ---------------------------------------------------------------------------

/**
 * 不変条件2
 * ノードの属性については、attribute_type がその node_kind に許されたものかを確認する。
 *
 * - リンク属性（LINK_ATTRIBUTE_TYPES）はノードに付けられない
 * - Figma 由来の視覚属性は、FIGMA_ATTRIBUTE_FOR_NODE_KIND の制約に従う
 * - 手動入力属性はノードの種類を問わず付けられる
 */
export function checkAttributeTypeForNodeKind(
  attributeType: AttributeType,
  nodeKind: NodeKind,
): ValidationResult {
  if (LINK_ATTRIBUTE_TYPES.has(attributeType)) {
    return fail(
      `"${attributeType}" はリンクの属性です。ノードには付けられません`,
    )
  }
  if (FIGMA_ATTRIBUTE_TYPES.has(attributeType)) {
    const allowed = FIGMA_ATTRIBUTE_FOR_NODE_KIND[attributeType]
    if (allowed !== undefined && !allowed.has(nodeKind)) {
      return fail(
        `"${attributeType}" は node_kind="${nodeKind}" に付けられません（許可: ${[...allowed].join(', ')}）`,
      )
    }
  }
  return OK
}

// ---------------------------------------------------------------------------
// 不変条件3：value の形が attribute_type に合っている
// ---------------------------------------------------------------------------

/**
 * 不変条件3
 * value は attribute_type ごとに定めた形に従う。
 * 「値なし」属性（composition, link_source）は value = null。
 */
export function checkAttributeValue(
  attributeType: AttributeType,
  value: unknown,
): ValidationResult {
  const result = parseAttributeValue(attributeType, value)
  if (!result.success) {
    return fail(
      `"${attributeType}" の value が不正です: ${result.error.message}`,
    )
  }
  return OK
}

// ---------------------------------------------------------------------------
// 不変条件5：source = 'figma' は Figma 由来の属性だけ
// ---------------------------------------------------------------------------

/**
 * 不変条件5
 * source = 'figma' にできるのは FIGMA_ATTRIBUTE_TYPES に含まれる属性だけ。
 * 再インポート時は source = 'figma' の行だけを更新し、source = 'manual' は残す。
 */
export function checkAttributeSource(
  attributeType: AttributeType,
  source: AttributeSource,
): ValidationResult {
  if (source === 'figma' && !FIGMA_ATTRIBUTE_TYPES.has(attributeType)) {
    return fail(
      `"${attributeType}" は Figma 由来の属性ではありません。source = 'figma' にはできません`,
    )
  }
  return OK
}

// ---------------------------------------------------------------------------
// 不変条件7：determine_type は属性の attribute_type に対応する判断型に限る
// ---------------------------------------------------------------------------

/**
 * 不変条件7
 * DesignDecisions.determine_type は、紐づく属性の attribute_type に対応する判断型に限る。
 * domain.md「設計時の判断型と属性の対応」表による。
 */
export function checkDetermineType(
  determineType: DetermineType,
  attributeType: AttributeType,
): ValidationResult {
  const validTypes = ATTRIBUTE_TYPE_TO_DETERMINE_TYPES[attributeType]
  if (validTypes === undefined || !validTypes.includes(determineType)) {
    const allowed = validTypes?.join(', ') ?? 'なし'
    return fail(
      `"${attributeType}" に対して "${determineType}" は付けられません（許可: ${allowed}）`,
    )
  }
  return OK
}

// ---------------------------------------------------------------------------
// 階層制約：親子にできる layer_type の組み合わせ
// ---------------------------------------------------------------------------

/**
 * db-schema.md §4.2 の階層ルール（レイヤー同士）
 *
 * | 親             | 子にできる層                      |
 * |----------------|----------------------------------|
 * | page           | template のみ                    |
 * | template       | organism, molecule, atom         |
 * | organism       | molecule, atom                   |
 * | molecule       | atom のみ                        |
 * | atom           | 子を持たない                      |
 */
const ALLOWED_CHILD_LAYER_TYPES: Readonly<Record<LayerType, ReadonlyArray<LayerType>>> = {
  page: ['template'],
  template: ['organism', 'molecule', 'atom'],
  organism: ['molecule', 'atom'],
  molecule: ['atom'],
  atom: [],
}

/**
 * レイヤー同士の親子関係が正しいかを確認する。
 * db-schema.md §4.2 の制約に対応。
 */
export function checkNodeHierarchy(
  parentLayerType: LayerType,
  childLayerType: LayerType,
): ValidationResult {
  const allowed = ALLOWED_CHILD_LAYER_TYPES[parentLayerType]
  if (!allowed.includes(childLayerType)) {
    return fail(
      `"${parentLayerType}" の下に "${childLayerType}" は置けません`,
    )
  }
  return OK
}

/**
 * 図形の親として許可されているかを確認する。
 * svg-import-spec.md §4.2：図形の親は template / organism / molecule / atom のみ。
 * page の直下に図形は置けない。
 *
 * @param parentLayerType  親ノードの layer_type。null は「図形を SVG の最上位に置く」場合。
 */
export function checkShapeParent(parentLayerType: LayerType | null): ValidationResult {
  if (parentLayerType === null) {
    return fail('図形はページの外に置けません。レイヤーの中に入れてください')
  }
  if (parentLayerType === 'page') {
    return fail(
      'ページの直下に図形は置けません。テンプレート以下のレイヤーの中に入れてください',
    )
  }
  return OK
}

// ---------------------------------------------------------------------------
// コンビネーター：属性を一括検証
// ---------------------------------------------------------------------------

/**
 * 1件の属性に対してすべての不変条件を検証し、違反の一覧を返す。
 * 1件でも違反があれば保存しない（呼び出し側の責任）。
 *
 * @param attr    検証対象の属性（部分的でもよい）
 * @param nodeKind  ノード属性の場合に指定。リンク属性なら省略可。
 */
export function validateAttribute(
  attr: {
    node_id: string | null
    link_id: string | null
    attribute_type: AttributeType
    value: unknown
    source: AttributeSource
  },
  nodeKind?: NodeKind,
): ValidationResult[] {
  const results: ValidationResult[] = []

  results.push(checkAttributeOwnership(attr.node_id, attr.link_id))
  results.push(checkAttributeValue(attr.attribute_type, attr.value))
  results.push(checkAttributeSource(attr.attribute_type, attr.source))

  if (attr.node_id !== null && nodeKind !== undefined) {
    results.push(checkAttributeTypeForNodeKind(attr.attribute_type, nodeKind))
  }

  return results.filter((r): r is { ok: false; message: string } => !r.ok)
}
