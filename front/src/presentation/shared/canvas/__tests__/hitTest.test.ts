import { describe, it, expect } from 'vitest'
import { hitTest } from '../hitTest'
import type { RenderNode } from '../types'

function makeNode(
  id: string,
  absX: number,
  absY: number,
  width: number,
  height: number,
  children: RenderNode[] = [],
): RenderNode {
  return {
    id,
    parentId: null,
    layerType: null,
    nodeKind: 'rectangle',
    sortOrder: 0,
    layerName: id,
    absX,
    absY,
    width,
    height,
    fill: null,
    opacity: 1,
    stroke: null,
    cornerRadius: 0,
    path: null,
    characters: null,
    fontSize: null,
    fontWeight: null,
    fontFamily: null,
    imageRef: null,
    children,
  }
}

describe('hitTest', () => {
  it('空ツリーは null を返す', () => {
    expect(hitTest([], 0, 0)).toBeNull()
  })

  it('範囲外の座標は null を返す', () => {
    const roots = [makeNode('page', 0, 0, 375, 640)]
    expect(hitTest(roots, 400, 300)).toBeNull()
    expect(hitTest(roots, 100, 700)).toBeNull()
  })

  it('ヒットしたノードの nodeId と空の ancestors を返す', () => {
    const roots = [makeNode('page', 0, 0, 375, 640)]
    const result = hitTest(roots, 100, 200)
    expect(result?.nodeId).toBe('page')
    expect(result?.ancestors).toEqual([])
  })

  it('最も深い子ノードを返す', () => {
    const child = makeNode('child', 50, 50, 100, 100)
    const page = makeNode('page', 0, 0, 375, 640, [child])
    const result = hitTest([page], 100, 100)
    expect(result?.nodeId).toBe('child')
    expect(result?.ancestors).toEqual(['page'])
  })

  it('孫ノードにヒットしたとき ancestors に祖先が含まれる', () => {
    const grandchild = makeNode('grandchild', 60, 60, 20, 20)
    const child = makeNode('child', 50, 50, 100, 100, [grandchild])
    const page = makeNode('page', 0, 0, 375, 640, [child])
    const result = hitTest([page], 70, 70)
    expect(result?.nodeId).toBe('grandchild')
    expect(result?.ancestors).toEqual(['child', 'page'])
  })

  it('子にヒットしないとき親を返す', () => {
    const child = makeNode('child', 50, 50, 100, 100)
    const page = makeNode('page', 0, 0, 375, 640, [child])
    const result = hitTest([page], 10, 10)
    expect(result?.nodeId).toBe('page')
    expect(result?.ancestors).toEqual([])
  })

  it('重なる子はインデックスが大きい方が優先される（Z 上位）', () => {
    const c1 = makeNode('c1', 0, 0, 100, 100)
    const c2 = makeNode('c2', 0, 0, 100, 100)
    const page = makeNode('page', 0, 0, 375, 640, [c1, c2])
    const result = hitTest([page], 50, 50)
    expect(result?.nodeId).toBe('c2')
  })

  it('境界上の点もヒットする', () => {
    const roots = [makeNode('page', 0, 0, 375, 640)]
    expect(hitTest(roots, 0, 0)?.nodeId).toBe('page')
    expect(hitTest(roots, 375, 640)?.nodeId).toBe('page')
  })

  it('複数のルートノードがあるとき後ろを優先する', () => {
    const p1 = makeNode('p1', 0, 0, 200, 200)
    const p2 = makeNode('p2', 0, 0, 200, 200)
    const result = hitTest([p1, p2], 100, 100)
    expect(result?.nodeId).toBe('p2')
  })
})
