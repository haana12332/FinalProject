// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCanvasTransform } from '../useCanvasTransform'

function makeWheelEvent(
  deltaY: number,
  clientX = 0,
  clientY = 0,
): React.WheelEvent<SVGSVGElement> {
  return {
    deltaY,
    clientX,
    clientY,
    preventDefault: () => {},
    currentTarget: {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
      }),
    },
  } as unknown as React.WheelEvent<SVGSVGElement>
}

describe('useCanvasTransform', () => {
  it('初期状態は scale=1, translate=(0,0)', () => {
    const { result } = renderHook(() => useCanvasTransform())
    expect(result.current.transform).toEqual({
      scale: 1,
      translateX: 0,
      translateY: 0,
    })
    expect(result.current.isPanning).toBe(false)
  })

  it('ホイール上でズームイン（scale > 1）', () => {
    const { result } = renderHook(() => useCanvasTransform())
    act(() => {
      result.current.handleWheel(makeWheelEvent(-100))
    })
    expect(result.current.transform.scale).toBeGreaterThan(1)
  })

  it('ホイール下でズームアウト（scale < 1）', () => {
    const { result } = renderHook(() => useCanvasTransform())
    act(() => {
      result.current.handleWheel(makeWheelEvent(100))
    })
    expect(result.current.transform.scale).toBeLessThan(1)
  })

  it('scale は MIN_SCALE(0.1) 以上にクランプされる', () => {
    const { result } = renderHook(() => useCanvasTransform())
    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.handleWheel(makeWheelEvent(100))
      }
    })
    expect(result.current.transform.scale).toBeGreaterThanOrEqual(0.1)
  })

  it('scale は MAX_SCALE(4.0) 以下にクランプされる', () => {
    const { result } = renderHook(() => useCanvasTransform())
    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.handleWheel(makeWheelEvent(-100))
      }
    })
    expect(result.current.transform.scale).toBeLessThanOrEqual(4.0)
  })

  it('カーソル位置中心でズームする', () => {
    const { result } = renderHook(() => useCanvasTransform())
    // カーソルが (200, 150) にある状態でズームイン
    act(() => {
      result.current.handleWheel(makeWheelEvent(-100, 200, 150))
    })
    const { scale, translateX, translateY } = result.current.transform
    // カーソル下の点がズーム前後で動かないこと:
    //   tx = cx - (cx - 0) * ratio
    //   ty = cy - (cy - 0) * ratio
    expect(translateX).toBeCloseTo(200 * (1 - scale), 5)
    expect(translateY).toBeCloseTo(150 * (1 - scale), 5)
  })

  it('複数回ズームしても式が成立する', () => {
    const { result } = renderHook(() => useCanvasTransform())
    // 同じカーソル位置で 3 回ズームイン
    act(() => {
      result.current.handleWheel(makeWheelEvent(-100, 100, 100))
      result.current.handleWheel(makeWheelEvent(-100, 100, 100))
      result.current.handleWheel(makeWheelEvent(-100, 100, 100))
    })
    const { scale, translateX, translateY } = result.current.transform
    // カーソル (100, 100) の下の点は常に canvas 座標 (100, 100) を指す:
    //   canvasX = (clientX - tx) / scale = (100 - translateX) / scale
    const canvasX = (100 - translateX) / scale
    const canvasY = (100 - translateY) / scale
    expect(canvasX).toBeCloseTo(100, 3)
    expect(canvasY).toBeCloseTo(100, 3)
  })
})
