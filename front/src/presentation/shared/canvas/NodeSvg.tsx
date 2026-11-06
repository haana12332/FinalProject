import type { RenderNode, HighlightSpec } from './types'

type Props = {
  node: RenderNode
  highlights: HighlightSpec[]
}

/** ハイライトの枠色を決定する */
function highlightStroke(spec: HighlightSpec): string {
  if (spec.color) return spec.color
  switch (spec.style) {
    case 'selection':  return '#262B8C'
    case 'constraint': return '#FF6B6B'
    case 'hover':
    default:           return '#4A90D9'
  }
}

/**
 * RenderNode を SVG 要素として再帰的にレンダリングする。
 *
 * - frame / rectangle: <rect>
 * - group: 透明 <rect>（ヒット領域確保）
 * - text: <text>
 * - ellipse: <ellipse>（path があれば <path>）
 * - vector: <path>
 * - image: <image>
 *
 * highlights に一致するノードは上に選択枠を描画する。
 */
export function NodeSvg({ node, highlights }: Props) {
  const highlight = highlights.find(h => h.nodeId === node.id)

  let shape: React.ReactNode = null

  switch (node.nodeKind) {
    case 'frame':
    case 'rectangle': {
      shape = (
        <rect
          x={node.absX}
          y={node.absY}
          width={node.width}
          height={node.height}
          fill={node.fill ?? 'transparent'}
          stroke={node.stroke ?? 'none'}
          rx={node.cornerRadius}
          ry={node.cornerRadius}
          opacity={node.opacity}
          data-node-id={node.id}
        />
      )
      break
    }
    case 'group': {
      // グループ自身は透明（子要素のコンテナ）
      shape = (
        <rect
          x={node.absX}
          y={node.absY}
          width={node.width}
          height={node.height}
          fill="none"
          stroke="none"
          opacity={node.opacity}
          data-node-id={node.id}
        />
      )
      break
    }
    case 'text': {
      const lines = (node.characters ?? '').split('\n')
      const fs = node.fontSize ?? 14
      shape = (
        <text
          x={node.absX}
          y={node.absY + fs}
          fontSize={fs}
          fontWeight={node.fontWeight ?? 400}
          fontFamily={node.fontFamily ?? 'sans-serif'}
          fill={node.fill ?? '#000000'}
          opacity={node.opacity}
          data-node-id={node.id}
        >
          {lines.map((line, i) => (
            <tspan key={i} x={node.absX} dy={i === 0 ? 0 : fs * 1.2}>
              {line}
            </tspan>
          ))}
        </text>
      )
      break
    }
    case 'ellipse': {
      if (node.path) {
        shape = (
          <path
            d={node.path}
            fill={node.fill ?? 'transparent'}
            stroke={node.stroke ?? 'none'}
            opacity={node.opacity}
            data-node-id={node.id}
          />
        )
      } else {
        shape = (
          <ellipse
            cx={node.absX + node.width / 2}
            cy={node.absY + node.height / 2}
            rx={node.width / 2}
            ry={node.height / 2}
            fill={node.fill ?? 'transparent'}
            stroke={node.stroke ?? 'none'}
            opacity={node.opacity}
            data-node-id={node.id}
          />
        )
      }
      break
    }
    case 'vector': {
      if (node.path) {
        shape = (
          <path
            d={node.path}
            fill={node.fill ?? 'transparent'}
            stroke={node.stroke ?? 'none'}
            opacity={node.opacity}
            data-node-id={node.id}
          />
        )
      }
      break
    }
    case 'image': {
      shape = (
        <image
          x={node.absX}
          y={node.absY}
          width={node.width}
          height={node.height}
          href={node.imageRef ?? ''}
          opacity={node.opacity}
          data-node-id={node.id}
        />
      )
      break
    }
  }

  return (
    <>
      {shape}
      {node.children.map(child => (
        <NodeSvg key={child.id} node={child} highlights={highlights} />
      ))}
      {highlight && (
        <rect
          x={node.absX}
          y={node.absY}
          width={node.width}
          height={node.height}
          fill="none"
          stroke={highlightStroke(highlight)}
          strokeWidth={2 / 1 /* 呼び出し元がスケール調整 */}
          pointerEvents="none"
        />
      )}
    </>
  )
}
