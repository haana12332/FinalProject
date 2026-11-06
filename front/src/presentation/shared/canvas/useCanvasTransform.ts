import { useState, useCallback, useRef } from 'react'
import type { CanvasTransform } from './types'

const MIN_SCALE = 0.1
const MAX_SCALE = 4.0
const ZOOM_FACTOR = 1.1

export type UseCanvasTransformReturn = {
  transform: CanvasTransform
  handleWheel: (e: React.WheelEvent<SVGSVGElement>) => void
  handlePointerDown: (e: React.PointerEvent<SVGSVGElement>) => void
  handlePointerMove: (e: React.PointerEvent<SVGSVGElement>) => void
  handlePointerUp: () => void
  isPanning: boolean
}

/**
 * キャンバスのズーム・パン状態を管理するフック。
 *
 * - ホイール: カーソル中心ズーム（scale: 0.1〜4.0）
 * - ポインタードラッグ: パン
 */
export function useCanvasTransform(): UseCanvasTransformReturn {
  const [transform, setTransform] = useState<CanvasTransform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  })
  // ハンドラ内でスナップショットを読むための ref
  const transformRef = useRef<CanvasTransform>(transform)
  const dragRef = useRef<{
    pointerX: number
    pointerY: number
    tx: number
    ty: number
  } | null>(null)
  const [isPanning, setIsPanning] = useState(false)

  const updateTransform = useCallback((next: CanvasTransform) => {
    transformRef.current = next
    setTransform(next)
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const prev = transformRef.current
      const factor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor))
      const ratio = newScale / prev.scale
      updateTransform({
        scale: newScale,
        translateX: cx - (cx - prev.translateX) * ratio,
        translateY: cy - (cy - prev.translateY) * ratio,
      })
    },
    [updateTransform],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.button !== 0 && e.button !== 1) return
      e.currentTarget.setPointerCapture(e.pointerId)
      const { translateX, translateY } = transformRef.current
      dragRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        tx: translateX,
        ty: translateY,
      }
      setIsPanning(true)
    },
    [],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current
      if (!drag) return
      updateTransform({
        scale: transformRef.current.scale,
        translateX: drag.tx + (e.clientX - drag.pointerX),
        translateY: drag.ty + (e.clientY - drag.pointerY),
      })
    },
    [updateTransform],
  )

  const handlePointerUp = useCallback(() => {
    dragRef.current = null
    setIsPanning(false)
  }, [])

  return {
    transform,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isPanning,
  }
}
