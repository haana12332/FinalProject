import { describe, it, expect } from 'vitest'
import { buildRenderTree, flattenNodes } from '../buildRenderTree'
import type { Node, Attribute } from '../../../../domain'

// テスト用ファクトリ

function makeNode(
  id: string,
  parentId: string | null,
  sortOrder = 0,
): Node {
  return {
    id,
    gui_id: 'gui-1',
    parent_node_id: parentId,
    layer_name: `layer-${id}`,
    layer_type: parentId === null ? 'page' : 'atom',
    node_kind: 'rectangle',
    sort_order: sortOrder,
    created_at: '',
    updated_at: '',
  }
}

function makeAttr(
  nodeId: string,
  type: Attribute['attribute_type'],
  value: Attribute['value'],
): Attribute {
  return {
    id: `attr-${nodeId}-${type}`,
    node_id: nodeId,
    link_id: null,
    attribute_type: type,
    value,
    source: 'figma',
    created_at: '',
    updated_at: '',
  }
}

// ----

describe('buildRenderTree', () => {
  it('空ノードのとき空配列を返す', () => {
    expect(buildRenderTree([], [])).toEqual([])
  })

  it('ルートノードを構築する', () => {
    const nodes = [makeNode('p1', null)]
    const attrs = [
      makeAttr('p1', 'x', 0),
      makeAttr('p1', 'y', 0),
      makeAttr('p1', 'width', 375),
      makeAttr('p1', 'height', 640),
    ]
    const roots = buildRenderTree(nodes, attrs)
    expect(roots).toHaveLength(1)
    expect(roots[0].id).toBe('p1')
    expect(roots[0].width).toBe(375)
    expect(roots[0].height).toBe(640)
    expect(roots[0].absX).toBe(0)
    expect(roots[0].absY).toBe(0)
    expect(roots[0].children).toHaveLength(0)
  })

  it('親子関係を組み立てる', () => {
    const nodes = [makeNode('page', null), makeNode('child', 'page')]
    const attrs = [
      makeAttr('page', 'x', 0),
      makeAttr('page', 'y', 0),
      makeAttr('page', 'width', 375),
      makeAttr('page', 'height', 640),
      makeAttr('child', 'x', 10),
      makeAttr('child', 'y', 20),
      makeAttr('child', 'width', 100),
      makeAttr('child', 'height', 50),
    ]
    const roots = buildRenderTree(nodes, attrs)
    expect(roots[0].children).toHaveLength(1)
    const child = roots[0].children[0]
    expect(child.id).toBe('child')
    expect(child.absX).toBe(10)
    expect(child.absY).toBe(20)
  })

  it('親の absX/Y を加算して絶対座標を計算する', () => {
    const nodes = [
      makeNode('page', null),
      makeNode('frame', 'page'),
      makeNode('child', 'frame'),
    ]
    const attrs = [
      makeAttr('page', 'x', 0),
      makeAttr('page', 'y', 0),
      makeAttr('page', 'width', 375),
      makeAttr('page', 'height', 640),
      makeAttr('frame', 'x', 50),
      makeAttr('frame', 'y', 100),
      makeAttr('frame', 'width', 200),
      makeAttr('frame', 'height', 200),
      makeAttr('child', 'x', 10),
      makeAttr('child', 'y', 20),
      makeAttr('child', 'width', 50),
      makeAttr('child', 'height', 50),
    ]
    const roots = buildRenderTree(nodes, attrs)
    const frame = roots[0].children[0]
    const child = frame.children[0]
    expect(frame.absX).toBe(50)
    expect(frame.absY).toBe(100)
    expect(child.absX).toBe(60)   // 50 + 10
    expect(child.absY).toBe(120)  // 100 + 20
  })

  it('children を sort_order 昇順でソートする', () => {
    const nodes = [
      makeNode('page', null, 0),
      makeNode('c1', 'page', 2),
      makeNode('c2', 'page', 1),
      makeNode('c3', 'page', 0),
    ]
    const roots = buildRenderTree(nodes, [])
    expect(roots[0].children.map(c => c.id)).toEqual(['c3', 'c2', 'c1'])
  })

  it('属性がないノードはデフォルト値を使う', () => {
    const nodes = [makeNode('p', null)]
    const roots = buildRenderTree(nodes, [])
    expect(roots[0].absX).toBe(0)
    expect(roots[0].absY).toBe(0)
    expect(roots[0].width).toBe(100)   // デフォルト
    expect(roots[0].height).toBe(100)  // デフォルト
    expect(roots[0].fill).toBeNull()
    expect(roots[0].opacity).toBe(1)
  })

  it('roots を sort_order でソートする', () => {
    const nodes = [makeNode('p2', null, 1), makeNode('p1', null, 0)]
    const roots = buildRenderTree(nodes, [])
    expect(roots[0].id).toBe('p1')
    expect(roots[1].id).toBe('p2')
  })
})

describe('flattenNodes', () => {
  it('全ノードを id でフラット化する', () => {
    // buildRenderTree で作ったツリーを使う（型が確定している）
    const nodes = [
      makeNode('p', null),
      makeNode('c', 'p'),
      makeNode('g', 'c'),
    ]
    const roots = buildRenderTree(nodes, [])
    const map = flattenNodes(roots)
    expect(map.size).toBe(3)
    expect(map.has('p')).toBe(true)
    expect(map.has('c')).toBe(true)
    expect(map.has('g')).toBe(true)
  })
})
