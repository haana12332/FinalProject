import type { Node, Attribute } from '../../../domain'
import type { RenderNode } from './types'

type AttrMap = Map<string, Map<string, Attribute['value']>>

function buildAttrMap(attributes: Attribute[]): AttrMap {
  const map: AttrMap = new Map()
  for (const attr of attributes) {
    if (!attr.node_id) continue
    if (!map.has(attr.node_id)) map.set(attr.node_id, new Map())
    map.get(attr.node_id)!.set(attr.attribute_type, attr.value)
  }
  return map
}

function getNum(attrs: Map<string, Attribute['value']> | undefined, key: string, fallback = 0): number {
  const v = attrs?.get(key)
  return typeof v === 'number' ? v : fallback
}

function getStr(attrs: Map<string, Attribute['value']> | undefined, key: string): string | null {
  const v = attrs?.get(key)
  return typeof v === 'string' ? v : null
}

/**
 * フラットな Node[] と Attribute[] からレンダリング用ツリーを構築する。
 * 座標はページ空間での絶対値に変換する（親の absX / absY を加算する）。
 * ページノード（parent_node_id=null）を roots として返す。
 */
export function buildRenderTree(nodes: Node[], attributes: Attribute[]): RenderNode[] {
  if (nodes.length === 0) return []

  const attrMap = buildAttrMap(attributes)

  // ---- ノードマップを構築 ----
  const nodeMap = new Map<string, RenderNode>()
  for (const node of nodes) {
    const attrs = attrMap.get(node.id)
    nodeMap.set(node.id, {
      id: node.id,
      parentId: node.parent_node_id,
      layerType: node.layer_type,
      nodeKind: node.node_kind,
      sortOrder: node.sort_order,
      layerName: node.layer_name,
      // 相対座標（後で絶対座標に変換）
      absX: getNum(attrs, 'x'),
      absY: getNum(attrs, 'y'),
      width: getNum(attrs, 'width', 100),
      height: getNum(attrs, 'height', 100),
      fill: getStr(attrs, 'fill'),
      opacity: getNum(attrs, 'opacity', 1),
      stroke: getStr(attrs, 'stroke'),
      cornerRadius: getNum(attrs, 'corner_radius'),
      path: getStr(attrs, 'path'),
      characters: getStr(attrs, 'characters'),
      fontSize: attrs?.has('font_size') ? getNum(attrs, 'font_size') : null,
      fontWeight: attrs?.has('font_weight') ? getNum(attrs, 'font_weight') : null,
      fontFamily: getStr(attrs, 'font_family'),
      imageRef: getStr(attrs, 'image_ref'),
      children: [],
    })
  }

  // ---- 親子関係を組み立て ----
  const roots: RenderNode[] = []
  for (const rn of nodeMap.values()) {
    if (!rn.parentId) {
      roots.push(rn)
    } else {
      const parent = nodeMap.get(rn.parentId)
      parent?.children.push(rn)
    }
  }

  // ---- 子を sort_order でソート ----
  for (const rn of nodeMap.values()) {
    rn.children.sort((a, b) => a.sortOrder - b.sortOrder)
  }

  // ---- 絶対座標を再帰的に計算 ----
  function resolveAbs(node: RenderNode, parentAbsX: number, parentAbsY: number): void {
    node.absX = parentAbsX + node.absX
    node.absY = parentAbsY + node.absY
    for (const child of node.children) {
      resolveAbs(child, node.absX, node.absY)
    }
  }
  for (const root of roots) {
    resolveAbs(root, 0, 0)
  }

  roots.sort((a, b) => a.sortOrder - b.sortOrder)
  return roots
}

/** 全ノードを id → RenderNode の平坦マップで返す（ヒットテスト用） */
export function flattenNodes(roots: RenderNode[]): Map<string, RenderNode> {
  const map = new Map<string, RenderNode>()
  function walk(node: RenderNode) {
    map.set(node.id, node)
    for (const c of node.children) walk(c)
  }
  for (const r of roots) walk(r)
  return map
}
