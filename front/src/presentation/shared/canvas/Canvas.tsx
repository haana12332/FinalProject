import { useEffect, useRef, useCallback } from 'react'
import { useCanvasTransform } from './useCanvasTransform'
import { NodeSvg } from './NodeSvg'
import { hitTest } from './hitTest'
import { useLogEvent } from '../../../application/logging/useLogEvent'
import type { RenderNode, HighlightSpec } from './types'
import styles from './Canvas.module.css'

type Props = {
  /** レンダリング済みのノードツリー（buildRenderTree の戻り値） */
  roots: RenderNode[]
  /** ハイライト表示（選択・ホバー等）。省略時は空 */
  highlights?: HighlightSpec[]
  /**
   * ノードをクリックしたときのコールバック。
   * nodeId: ヒットしたノードの ID（背景クリック時は null）
   */
  onNodeClick?: (nodeId: string | null) => void
  /**
   * ノードをダブルクリックしたときのコールバック。
   * nodeId: ヒットしたノードの ID（背景ダブルクリック時は null）
   */
  onNodeDoubleClick?: (nodeId: string | null) => void
  /** デザインの幅（px）。デフォルト 375（モバイル） */
  designWidth?: number
  /** デザインの高さ（px）。デフォルト 640（モバイル） */
  designHeight?: number
}

/**
 * GUI ノードを SVG でレンダリングするキャンバス。
 *
 * - ホイール: カーソル中心ズーム（0.1〜4.0）
 * - ポインタードラッグ: パン
 * - クリック: ヒットテストして onNodeClick を呼ぶ
 * - ズーム変化: canvas_zoom イベントをログに記録
 */
export function Canvas({
  roots,
  highlights = [],
  onNodeClick,
  onNodeDoubleClick,
  designWidth = 375,
  designHeight = 640,
}: Props) {
  const {
    transform,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isPanning,
  } = useCanvasTransform()

  const { logEvent } = useLogEvent()
  const svgRef = useRef<SVGSVGElement>(null)
  const prevScaleRef = useRef(transform.scale)
  // ドラッグ距離を追跡して、パン後のクリックを抑制する
  const dragDistRef = useRef(0)
  const pointerDownClientRef = useRef<{ x: number; y: number } | null>(null)

  // scale が変化したときだけ canvas_zoom をログに記録
  useEffect(() => {
    if (transform.scale !== prevScaleRef.current) {
      logEvent('canvas_zoom', { scale: transform.scale })
      prevScaleRef.current = transform.scale
    }
  }, [transform.scale, logEvent])

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      pointerDownClientRef.current = { x: e.clientX, y: e.clientY }
      dragDistRef.current = 0
      handlePointerDown(e)
    },
    [handlePointerDown],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (pointerDownClientRef.current) {
        const dx = e.clientX - pointerDownClientRef.current.x
        const dy = e.clientY - pointerDownClientRef.current.y
        dragDistRef.current = Math.sqrt(dx * dx + dy * dy)
      }
      handlePointerMove(e)
    },
    [handlePointerMove],
  )

  const onPointerUp = useCallback(() => {
    pointerDownClientRef.current = null
    handlePointerUp()
  }, [handlePointerUp])

  /** SVG 上のクライアント座標 → キャンバス絶対座標に変換 */
  const toCanvasCoords = useCallback(
    (clientX: number, clientY: number): { cx: number; cy: number } | null => {
      if (!svgRef.current) return null
      const rect = svgRef.current.getBoundingClientRect()
      return {
        cx: (clientX - rect.left - transform.translateX) / transform.scale,
        cy: (clientY - rect.top - transform.translateY) / transform.scale,
      }
    },
    [transform],
  )

  const onClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // ドラッグ後のクリックを無視（5px 以上移動したらパンとみなす）
      if (dragDistRef.current > 5) return
      const coords = toCanvasCoords(e.clientX, e.clientY)
      if (!coords) return
      const result = hitTest(roots, coords.cx, coords.cy)
      onNodeClick?.(result?.nodeId ?? null)
    },
    [roots, toCanvasCoords, onNodeClick],
  )

  const onDoubleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const coords = toCanvasCoords(e.clientX, e.clientY)
      if (!coords) return
      const result = hitTest(roots, coords.cx, coords.cy)
      onNodeDoubleClick?.(result?.nodeId ?? null)
    },
    [roots, toCanvasCoords, onNodeDoubleClick],
  )

  const { scale, translateX, translateY } = transform

  return (
    <div className={styles.canvas}>
      <svg
        ref={svgRef}
        className={isPanning ? styles.panning : undefined}
        onWheel={handleWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <g transform={`translate(${translateX},${translateY}) scale(${scale})`}>
          {/* デザインの背景（白） */}
          <rect
            x={0}
            y={0}
            width={designWidth}
            height={designHeight}
            fill="#ffffff"
          />
          {roots.map(root => (
            <NodeSvg key={root.id} node={root} highlights={highlights} />
          ))}
        </g>
      </svg>
    </div>
  )
}
