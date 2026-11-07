import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { useCanvasTransform } from './useCanvasTransform'
import { NodeSvg } from './NodeSvg'
import { LinkArrows } from './LinkArrows'
import { flattenNodes } from './buildRenderTree'
import { hitTest } from './hitTest'
import { useLogEvent } from '../../../application/logging/useLogEvent'
import type { RenderNode, HighlightSpec } from './types'
import type { Link, Attribute } from '../../../domain/entities'
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
  /**
   * ドラッグ可能なページノードの ID セット（researcher モードのみ設定）。
   * ページ背景をポインターダウンするとページ移動ドラッグが始まる。
   * 未設定またはサイズ 0 の場合はページドラッグを行わない。
   */
  draggablePageIds?: ReadonlySet<string>
  /**
   * ページドラッグが完了したときに呼ばれるコールバック。
   * newX / newY はキャンバス空間の絶対座標。
   */
  onPageDragEnd?: (pageId: string, newX: number, newY: number) => void
  /** 表示する状態遷移リンク（researcher モードで矢印表示） */
  links?: Link[]
  /** リンクの属性（trigger など） */
  linkAttributes?: Attribute[]
  /** ページ名マップ: pageNodeId → layerName（クロスページラベル用） */
  pageNames?: Map<string, string>
  /** リンクをクリックしたときのコールバック */
  onLinkClick?: (linkId: string) => void
  /** 選択中のリンク id */
  selectedLinkId?: string | null
}

type PageDragState = {
  pageId: string
  /** ドラッグ開始時のポインタークライアント座標 */
  startClientX: number
  startClientY: number
  /** ドラッグ開始時のページ absX / absY */
  originX: number
  originY: number
}

/**
 * GUI ノードを SVG でレンダリングするキャンバス。
 *
 * - ホイール: カーソル中心ズーム（0.1〜4.0）
 * - ポインタードラッグ（背景）: パン
 * - ポインタードラッグ（ページ背景 + draggablePageIds 設定時）: ページ移動
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
  draggablePageIds,
  onPageDragEnd,
  links = [],
  linkAttributes = [],
  pageNames = new Map(),
  onLinkClick,
  selectedLinkId,
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
  const dragDistRef = useRef(0)
  const pointerDownClientRef = useRef<{ x: number; y: number } | null>(null)

  // ---- ページドラッグ状態 ----
  // liveOffset は毎フレーム更新するためマップを useState で管理する。
  const pageDragRef = useRef<PageDragState | null>(null)
  const [liveOffset, setLiveOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 })

  // scale が変化したときだけ canvas_zoom をログに記録
  useEffect(() => {
    if (transform.scale !== prevScaleRef.current) {
      logEvent('canvas_zoom', { scale: transform.scale })
      prevScaleRef.current = transform.scale
    }
  }, [transform.scale, logEvent])

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

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      pointerDownClientRef.current = { x: e.clientX, y: e.clientY }
      dragDistRef.current = 0

      // ページドラッグ判定（researcher モードのみ）
      if (draggablePageIds && draggablePageIds.size > 0) {
        const coords = toCanvasCoords(e.clientX, e.clientY)
        if (coords) {
          const hit = hitTest(roots, coords.cx, coords.cy)
          // ヒット先がページ直接（ancestors が空 = roots の直接子）かつ draggablePageIds に含まれる
          if (hit && hit.ancestors.length === 0 && draggablePageIds.has(hit.nodeId)) {
            const pageNode = roots.find(r => r.id === hit.nodeId)
            if (pageNode) {
              e.currentTarget.setPointerCapture(e.pointerId)
              pageDragRef.current = {
                pageId: hit.nodeId,
                startClientX: e.clientX,
                startClientY: e.clientY,
                originX: pageNode.absX,
                originY: pageNode.absY,
              }
              setLiveOffset({ dx: 0, dy: 0 })
              return // キャンバスパンを抑制
            }
          }
        }
      }

      handlePointerDown(e)
    },
    [roots, draggablePageIds, toCanvasCoords, handlePointerDown],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (pointerDownClientRef.current) {
        const dx = e.clientX - pointerDownClientRef.current.x
        const dy = e.clientY - pointerDownClientRef.current.y
        dragDistRef.current = Math.sqrt(dx * dx + dy * dy)
      }

      const pd = pageDragRef.current
      if (pd) {
        const dxClient = e.clientX - pd.startClientX
        const dyClient = e.clientY - pd.startClientY
        // クライアント座標差をキャンバス空間に変換
        const dxCanvas = dxClient / transform.scale
        const dyCanvas = dyClient / transform.scale
        setLiveOffset({ dx: dxCanvas, dy: dyCanvas })
        return
      }

      handlePointerMove(e)
    },
    [handlePointerMove, transform.scale],
  )

  const onPointerUp = useCallback(() => {
    pointerDownClientRef.current = null

    const pd = pageDragRef.current
    if (pd) {
      pageDragRef.current = null
      const newX = pd.originX + liveOffset.dx
      const newY = pd.originY + liveOffset.dy
      setLiveOffset({ dx: 0, dy: 0 })
      onPageDragEnd?.(pd.pageId, newX, newY)
      return
    }

    handlePointerUp()
  }, [handlePointerUp, liveOffset, onPageDragEnd])

  const onClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
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

  // ドラッグ中のページ ID（カーソル変更用）
  const isDraggingPage = pageDragRef.current !== null
  const draggingPageId = pageDragRef.current?.pageId ?? null

  // リンク矢印用フラットマップ（roots 変化時だけ再計算）
  const flatMap = useMemo(() => flattenNodes(roots), [roots])

  return (
    <div className={styles.canvas}>
      <svg
        ref={svgRef}
        className={
          isDraggingPage ? styles.pageDragging
          : isPanning     ? styles.panning
          : undefined
        }
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
          {roots.map(root => {
            const isBeingDragged = root.id === draggingPageId
            return isBeingDragged ? (
              <g
                key={root.id}
                transform={`translate(${liveOffset.dx},${liveOffset.dy})`}
              >
                <NodeSvg node={root} highlights={highlights} />
              </g>
            ) : (
              <NodeSvg key={root.id} node={root} highlights={highlights} />
            )
          })}
          {/* 状態遷移リンクの矢印（ノードの上に描画） */}
          <LinkArrows
            links={links}
            linkAttributes={linkAttributes}
            flatMap={flatMap}
            pageNames={pageNames}
            onLinkClick={onLinkClick}
            selectedLinkId={selectedLinkId}
          />
        </g>
      </svg>
    </div>
  )
}
