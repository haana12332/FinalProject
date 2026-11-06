import type { LayerType, NodeKind } from '../../../domain'

/** レンダリング用ノード（属性を展開済み・絶対座標付き） */
export type RenderNode = {
  // --- identity ---
  id: string
  parentId: string | null
  layerType: LayerType | null
  nodeKind: NodeKind
  sortOrder: number
  layerName: string
  // --- geometry (page-space 絶対座標) ---
  absX: number
  absY: number
  width: number
  height: number
  // --- visual ---
  fill: string | null
  opacity: number
  stroke: string | null
  cornerRadius: number
  // --- shape ---
  path: string | null
  // --- text ---
  characters: string | null
  fontSize: number | null
  fontWeight: number | null
  fontFamily: string | null
  // --- image ---
  imageRef: string | null
  // --- tree ---
  children: RenderNode[]
}

/** ズーム・パン状態 */
export type CanvasTransform = {
  scale: number
  translateX: number
  translateY: number
}

/** ハイライト指定 */
export type HighlightSpec = {
  nodeId: string
  style?: 'selection' | 'hover' | 'constraint'
  color?: string
}

/** ヒットテスト結果 */
export type HitTestResult = {
  nodeId: string
  /** parent → grandparent → ... → page の順（最も近い祖先が先） */
  ancestors: string[]
}
