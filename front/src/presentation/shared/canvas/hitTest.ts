import type { RenderNode, HitTestResult } from './types'

function contains(node: RenderNode, cx: number, cy: number): boolean {
  return (
    cx >= node.absX &&
    cx <= node.absX + node.width &&
    cy >= node.absY &&
    cy <= node.absY + node.height
  )
}

/**
 * キャンバス座標 (cx, cy) でヒットテストを行う。
 *
 * - 最も深い（子孫の）ノードを返す
 * - 子は sort_order 降順（後ろ = Z 上位）で優先
 * - ancestors は「直近の親 → ルート」の順
 *
 * @param roots buildRenderTree の戻り値
 * @param cx キャンバス空間の X 座標（絶対値、transform 適用前）
 * @param cy キャンバス空間の Y 座標（絶対値、transform 適用前）
 */
export function hitTest(
  roots: RenderNode[],
  cx: number,
  cy: number,
): HitTestResult | null {
  function walk(node: RenderNode, ancestors: string[]): HitTestResult | null {
    if (!contains(node, cx, cy)) return null
    // 子を逆順（Z 上位から）でチェック
    for (let i = node.children.length - 1; i >= 0; i--) {
      const hit = walk(node.children[i], [node.id, ...ancestors])
      if (hit) return hit
    }
    return { nodeId: node.id, ancestors }
  }

  for (let i = roots.length - 1; i >= 0; i--) {
    const hit = walk(roots[i], [])
    if (hit) return hit
  }
  return null
}
