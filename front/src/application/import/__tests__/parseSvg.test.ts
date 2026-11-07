// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseSvgDoc, computeBBoxFromElement } from '../parseSvg'

const VALID_SVG_PATH = join(__dirname, '../../../../../docs/samples/valid/P_ProductDetail.svg')
const EXPECTED_JSON_PATH = join(__dirname, '../../../../../docs/samples/valid/P_ProductDetail.expected.json')

function readValidSvg(): Document {
  const text = readFileSync(VALID_SVG_PATH, 'utf-8')
  return new DOMParser().parseFromString(text, 'image/svg+xml')
}

type ExpectedNode = {
  ref: string
  parent_ref: string | null
  layer_name: string
  layer_type: string | null
  node_kind: string
  sort_order: number
  attributes: Array<{ attribute_type: string; value: unknown }>
}

function readExpected(): { nodes: ExpectedNode[] } {
  return JSON.parse(readFileSync(EXPECTED_JSON_PATH, 'utf-8'))
}

describe('parseSvgDoc — valid/P_ProductDetail.svg', () => {
  it('エラーなしで 37 ノードを返す', () => {
    const doc = readValidSvg()
    const result = parseSvgDoc(doc, computeBBoxFromElement)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.payload.nodes).toHaveLength(37)
  })

  it('ページノード（ref=1）が正しい属性を持つ', () => {
    const doc = readValidSvg()
    const result = parseSvgDoc(doc, computeBBoxFromElement)
    if (!result.ok) return
    const page = result.payload.nodes[0]
    expect(page.layer_name).toBe('P_ProductDetail')
    expect(page.layer_type).toBe('page')
    expect(page.node_kind).toBe('frame')
    expect(page.parent_ref).toBeNull()
    expect(page.sort_order).toBe(0)
    const attrMap = Object.fromEntries(page.attributes.map(a => [a.attribute_type, a.value]))
    expect(attrMap.x).toBe(0)
    expect(attrMap.y).toBe(0)
    expect(attrMap.width).toBe(375)
    expect(attrMap.height).toBe(640)
  })

  it('layer_name と layer_type が expected.json と一致する', () => {
    const doc = readValidSvg()
    const result = parseSvgDoc(doc, computeBBoxFromElement)
    if (!result.ok) return
    const expected = readExpected()

    for (let i = 0; i < expected.nodes.length; i++) {
      const got = result.payload.nodes[i]
      const want = expected.nodes[i]
      expect(got.layer_name, `node[${i}] layer_name`).toBe(want.layer_name)
      expect(got.layer_type, `node[${i}] layer_type`).toBe(want.layer_type)
      expect(got.node_kind, `node[${i}] node_kind`).toBe(want.node_kind)
      expect(got.parent_ref, `node[${i}] parent_ref`).toBe(want.parent_ref)
      expect(got.sort_order, `node[${i}] sort_order`).toBe(want.sort_order)
    }
  })

  it('x/y/width/height が expected.json と ±3 以内で一致する（テキスト以外）', () => {
    const doc = readValidSvg()
    const result = parseSvgDoc(doc, computeBBoxFromElement)
    if (!result.ok) return
    const expected = readExpected()
    const TOLERANCE = 3

    for (let i = 0; i < expected.nodes.length; i++) {
      const got = result.payload.nodes[i]
      const want = expected.nodes[i]
      // テキストは getBBox がフォント依存のためスキップ
      if (got.node_kind === 'text') continue

      const gotMap = Object.fromEntries(got.attributes.map(a => [a.attribute_type, a.value as number]))
      const wantMap = Object.fromEntries(want.attributes.map(a => [a.attribute_type, a.value as number]))

      for (const key of ['x', 'y', 'width', 'height'] as const) {
        if (wantMap[key] === undefined) continue
        const diff = Math.abs((gotMap[key] ?? 0) - wantMap[key])
        expect(diff, `node[${i}] ${got.layer_name} ${key}: got ${gotMap[key]}, want ${wantMap[key]}`).toBeLessThanOrEqual(TOLERANCE)
      }
    }
  })

  it('SearchInput_Bg の corner_radius が 6', () => {
    const doc = readValidSvg()
    const result = parseSvgDoc(doc, computeBBoxFromElement)
    if (!result.ok) return
    const node = result.payload.nodes.find(n => n.layer_name === 'SearchInput_Bg')
    expect(node).toBeDefined()
    const cr = node!.attributes.find(a => a.attribute_type === 'corner_radius')
    expect(cr?.value).toBe(6)
  })

  it('CartIcon_Shape の corner_radius が 4', () => {
    const doc = readValidSvg()
    const result = parseSvgDoc(doc, computeBBoxFromElement)
    if (!result.ok) return
    const node = result.payload.nodes.find(n => n.layer_name === 'CartIcon_Shape')
    expect(node).toBeDefined()
    const cr = node!.attributes.find(a => a.attribute_type === 'corner_radius')
    expect(cr?.value).toBe(4)
  })

  it('SearchButton_Icon が ellipse', () => {
    const doc = readValidSvg()
    const result = parseSvgDoc(doc, computeBBoxFromElement)
    if (!result.ok) return
    const node = result.payload.nodes.find(n => n.layer_name === 'SearchButton_Icon')
    expect(node?.node_kind).toBe('ellipse')
  })

  it('Header_Bg の fill が #1E3A5F', () => {
    const doc = readValidSvg()
    const result = parseSvgDoc(doc, computeBBoxFromElement)
    if (!result.ok) return
    const node = result.payload.nodes.find(n => n.layer_name === 'Header_Bg')
    const fillAttr = node?.attributes.find(a => a.attribute_type === 'fill')
    expect(fillAttr?.value).toEqual([{ color: '#1E3A5F', opacity: 1 }])
  })

  it('warnings が空', () => {
    const doc = readValidSvg()
    const result = parseSvgDoc(doc, computeBBoxFromElement)
    if (!result.ok) return
    expect(result.warnings).toHaveLength(0)
  })
})
