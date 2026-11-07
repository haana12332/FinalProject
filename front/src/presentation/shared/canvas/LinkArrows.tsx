/**
 * 状態遷移リンクを矢印で描画する SVG コンポーネント（Issue #24）
 *
 * - 同じページ内のリンク: ソース → ターゲットの中心を結ぶ曲線矢印
 * - クロスページリンク: ソースノードの右端から右方向への矢印＋ページ名ラベル
 */
import type { Link, Attribute } from '../../../domain/entities'
import type { RenderNode } from './types'

type Props = {
  links: Link[]
  linkAttributes: Attribute[]
  /** 表示中のルートに属する全ノードのフラットマップ */
  flatMap: Map<string, RenderNode>
  /** ページ名マップ: pageNodeId → layerName（クロスページラベル用） */
  pageNames: Map<string, string>
  /** クリックされたリンク id を通知する */
  onLinkClick?: (linkId: string) => void
  /** 選択中のリンク id */
  selectedLinkId?: string | null
}

const MARKER_ID = 'arrow-head'
const SELECTED_MARKER_ID = 'arrow-head-selected'

function nodeCenterX(node: RenderNode) {
  return node.absX + node.width / 2
}
function nodeCenterY(node: RenderNode) {
  return node.absY + node.height / 2
}

/** 二点を結ぶ二次ベジェ曲線の d 属性（少し上に膨らむ） */
function curvePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.25
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`
}

export function LinkArrows({
  links,
  linkAttributes,
  flatMap,
  pageNames,
  onLinkClick,
  selectedLinkId,
}: Props) {
  if (links.length === 0) return null

  const attrByLink = new Map<string, Attribute[]>()
  for (const a of linkAttributes) {
    if (!a.link_id) continue
    if (!attrByLink.has(a.link_id)) attrByLink.set(a.link_id, [])
    attrByLink.get(a.link_id)!.push(a)
  }

  return (
    <>
      <defs>
        <marker
          id={MARKER_ID}
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill="#E63946" />
        </marker>
        <marker
          id={SELECTED_MARKER_ID}
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill="#262B8C" />
        </marker>
      </defs>

      {links.map(link => {
        const src = flatMap.get(link.source_node_id)
        const isSelected = link.id === selectedLinkId
        const color = isSelected ? '#262B8C' : '#E63946'
        const markerId = isSelected ? SELECTED_MARKER_ID : MARKER_ID

        if (!src) return null

        const tgt = flatMap.get(link.target_node_id)
        const srcCx = nodeCenterX(src)
        const srcCy = nodeCenterY(src)

        // ターゲットが同じページ内にある場合
        if (tgt) {
          const tgtCx = nodeCenterX(tgt)
          const tgtCy = nodeCenterY(tgt)
          const d = curvePath(srcCx, srcCy, tgtCx, tgtCy)
          const triggerAttr = attrByLink.get(link.id)?.find(a => a.attribute_type === 'trigger')
          const trigger = triggerAttr?.value as string | undefined

          return (
            <g
              key={link.id}
              role="button"
              style={{ cursor: 'pointer' }}
              onClick={() => onLinkClick?.(link.id)}
            >
              {/* クリック領域を広げる透明な太い線 */}
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={12}
              />
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={isSelected ? 2.5 : 1.5}
                strokeDasharray={isSelected ? undefined : '5 3'}
                markerEnd={`url(#${markerId})`}
              />
              <text
                x={(srcCx + tgtCx) / 2}
                y={(srcCy + tgtCy) / 2 - Math.abs(tgtCx - srcCx) * 0.25 - 4}
                fontSize={10}
                fill={color}
                textAnchor="middle"
              >
                {link.name}{trigger ? ` (${trigger})` : ''}
              </text>
            </g>
          )
        }

        // クロスページリンク: 右方向の矢印＋遷移先ページ名
        const targetPageName = pageNames.get(link.target_node_id) ?? '→'
        const arrowEndX = src.absX + src.width + 40
        const arrowEndY = srcCy

        return (
          <g
            key={link.id}
            role="button"
            style={{ cursor: 'pointer' }}
            onClick={() => onLinkClick?.(link.id)}
          >
            <line
              x1={srcCx}
              y1={srcCy}
              x2={arrowEndX}
              y2={arrowEndY}
              stroke={color}
              strokeWidth={isSelected ? 2.5 : 1.5}
              strokeDasharray="5 3"
              markerEnd={`url(#${markerId})`}
            />
            <text
              x={arrowEndX + 4}
              y={arrowEndY + 4}
              fontSize={10}
              fill={color}
            >
              → {targetPageName}
            </text>
          </g>
        )
      })}
    </>
  )
}
