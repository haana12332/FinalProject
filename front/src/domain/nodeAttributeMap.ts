/**
 * node_kind ごとに許可される attribute_type の定義
 *
 * domain.md「属性の定義」の「対象の node_kind」列と
 * 不変条件2・5 の実装に使う。
 */
import type { AttributeType, NodeKind } from './enums'

/**
 * source = 'figma' にできる属性（Figma 由来の視覚属性）。
 * 不変条件5：同じページを再インポートしたとき、この Set に含まれる属性だけを更新する。
 */
export const FIGMA_ATTRIBUTE_TYPES = new Set<AttributeType>([
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
])

/**
 * リンク（Links）にしか付けられない属性。
 * ノードの属性として渡されたときはエラーにする（不変条件2）。
 */
export const LINK_ATTRIBUTE_TYPES = new Set<AttributeType>([
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

/**
 * Figma 由来の視覚属性について、許可される node_kind の Set。
 * domain.md「属性の定義」§の「対象の node_kind」列に対応。
 *
 * - 手動入力属性はノードの種類を問わず付けられるため、ここには含まない。
 * - リンク属性は LINK_ATTRIBUTE_TYPES で管理し、ここには含まない。
 */
export const FIGMA_ATTRIBUTE_FOR_NODE_KIND: Readonly<
  Record<string, ReadonlySet<NodeKind>>
> = {
  x: new Set(['frame', 'group', 'rectangle', 'ellipse', 'vector', 'text', 'image']),
  y: new Set(['frame', 'group', 'rectangle', 'ellipse', 'vector', 'text', 'image']),
  width: new Set(['frame', 'group', 'rectangle', 'ellipse', 'vector', 'text', 'image']),
  height: new Set(['frame', 'group', 'rectangle', 'ellipse', 'vector', 'text', 'image']),
  opacity: new Set(['frame', 'group', 'rectangle', 'ellipse', 'vector', 'text', 'image']),
  // frame は背景の <rect> の fill を引き継ぐ。text は文字色
  fill: new Set(['frame', 'rectangle', 'ellipse', 'vector', 'text']),
  stroke: new Set(['frame', 'rectangle', 'ellipse', 'vector']),
  corner_radius: new Set(['frame', 'rectangle']),
  path: new Set(['vector']),
  image_ref: new Set(['image']),
  characters: new Set(['text']),
  font_family: new Set(['text']),
  font_size: new Set(['text']),
  font_weight: new Set(['text']),
  line_height: new Set(['text']),
  letter_spacing: new Set(['text']),
  text_align: new Set(['text']),
} satisfies Partial<Record<AttributeType, ReadonlySet<NodeKind>>>
