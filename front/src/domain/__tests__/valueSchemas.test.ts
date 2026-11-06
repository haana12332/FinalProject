import { describe, it, expect } from 'vitest'
import { ATTRIBUTE_VALUE_SCHEMAS, parseAttributeValue } from '../valueSchemas'
import type { AttributeType } from '../enums'

// helpers
const valid = (type: AttributeType, value: unknown) =>
  expect(ATTRIBUTE_VALUE_SCHEMAS[type].safeParse(value).success, `${type} should accept ${JSON.stringify(value)}`).toBe(true)

const invalid = (type: AttributeType, value: unknown) =>
  expect(ATTRIBUTE_VALUE_SCHEMAS[type].safeParse(value).success, `${type} should reject ${JSON.stringify(value)}`).toBe(false)

describe('ATTRIBUTE_VALUE_SCHEMAS — 幾何（x / y / width / height / opacity）', () => {
  it('x, y は任意の数値を受け付ける（負も可）', () => {
    valid('x', 0)
    valid('x', -100)
    valid('x', 16.5)
    valid('y', 369.55)
  })

  it('width, height は 0 以上の数値のみ', () => {
    valid('width', 0)
    valid('width', 375)
    invalid('width', -1)
    invalid('height', -0.1)
  })

  it('opacity は 0〜1', () => {
    valid('opacity', 0)
    valid('opacity', 1)
    valid('opacity', 0.5)
    invalid('opacity', -0.1)
    invalid('opacity', 1.1)
  })

  it('数値以外は拒否', () => {
    invalid('x', '100')
    invalid('width', null)
    invalid('opacity', true)
  })
})

describe('ATTRIBUTE_VALUE_SCHEMAS — fill', () => {
  it('正しい塗りのリスト', () => {
    valid('fill', [{ color: '#262B8C', opacity: 1 }])
    valid('fill', [{ color: '#FFFFFF', opacity: 0.5 }, { color: '#000000', opacity: 1 }])
  })

  it('空リストは拒否', () => {
    invalid('fill', [])
  })

  it('color / opacity がない場合は拒否', () => {
    invalid('fill', [{ color: '#FF0000' }])       // opacity なし
    invalid('fill', [{ opacity: 0.5 }])            // color なし
    invalid('fill', [{}])
  })

  it('opacity が範囲外は拒否', () => {
    invalid('fill', [{ color: '#FF0000', opacity: 1.5 }])
    invalid('fill', [{ color: '#FF0000', opacity: -0.1 }])
  })
})

describe('ATTRIBUTE_VALUE_SCHEMAS — stroke', () => {
  it('正しい線', () => {
    valid('stroke', [{ color: '#D4D5EC', weight: 1 }])
  })

  it('空リストは拒否', () => {
    invalid('stroke', [])
  })

  it('weight が負は拒否', () => {
    invalid('stroke', [{ color: '#000000', weight: -1 }])
  })
})

describe('ATTRIBUTE_VALUE_SCHEMAS — corner_radius', () => {
  it('単一数値', () => {
    valid('corner_radius', 0)
    valid('corner_radius', 6)
  })

  it('4要素タプル', () => {
    valid('corner_radius', [4, 4, 0, 0])
    valid('corner_radius', [0, 0, 0, 0])
  })

  it('負の値は拒否', () => {
    invalid('corner_radius', -1)
    invalid('corner_radius', [4, -1, 0, 0])
  })

  it('3要素タプルは拒否', () => {
    invalid('corner_radius', [4, 4, 0])
  })

  it('文字列は拒否', () => {
    invalid('corner_radius', '6px')
  })
})

describe('ATTRIBUTE_VALUE_SCHEMAS — テキスト属性', () => {
  it('font_weight は 100〜900', () => {
    valid('font_weight', 100)
    valid('font_weight', 400)
    valid('font_weight', 700)
    valid('font_weight', 900)
    invalid('font_weight', 99)
    invalid('font_weight', 901)
  })

  it('line_height は正の数または null', () => {
    valid('line_height', 20)
    valid('line_height', null)
    invalid('line_height', 0)
    invalid('line_height', -1)
  })

  it('text_align は left / center / right のみ', () => {
    valid('text_align', 'left')
    valid('text_align', 'center')
    valid('text_align', 'right')
    invalid('text_align', 'justify')
    invalid('text_align', '')
  })

  it('font_size は正の数', () => {
    valid('font_size', 14)
    invalid('font_size', 0)
    invalid('font_size', -12)
  })
})

describe('ATTRIBUTE_VALUE_SCHEMAS — 値なし属性', () => {
  it('composition は null のみ', () => {
    valid('composition', null)
    invalid('composition', '')
    invalid('composition', 0)
    invalid('composition', {})
  })

  it('link_source は null のみ', () => {
    valid('link_source', null)
    invalid('link_source', 'node-id-123')
  })
})

describe('ATTRIBUTE_VALUE_SCHEMAS — リンク属性', () => {
  it('trigger は click / hover のみ', () => {
    valid('trigger', 'click')
    valid('trigger', 'hover')
    invalid('trigger', 'tap')
    invalid('trigger', '')
  })

  it('transition_method は replace / overlay / back のみ', () => {
    valid('transition_method', 'replace')
    valid('transition_method', 'overlay')
    valid('transition_method', 'back')
    invalid('transition_method', 'push')
  })

  it('source_handling は keep / discard のみ', () => {
    valid('source_handling', 'keep')
    valid('source_handling', 'discard')
    invalid('source_handling', 'delete')
  })

  it('return_state は preserve / reset のみ', () => {
    valid('return_state', 'preserve')
    valid('return_state', 'reset')
    invalid('return_state', 'keep')
  })

  it('hit_area は width / height を持つオブジェクト', () => {
    valid('hit_area', { width: 48, height: 48 })
    invalid('hit_area', { width: 48 })
    invalid('hit_area', { width: -1, height: 48 })
  })

  it('impact_scope', () => {
    valid('impact_scope', { scope: 'self', affected_node_ids: [] })
    valid('impact_scope', { scope: 'others', affected_node_ids: ['abc'] })
    invalid('impact_scope', { scope: 'global', affected_node_ids: [] })
    invalid('impact_scope', { affected_node_ids: [] })
  })

  it('animation は type と duration_ms を持つオブジェクト', () => {
    valid('animation', { type: 'slide', duration_ms: 300 })
    invalid('animation', { type: 'slide', duration_ms: -1 })
    invalid('animation', { type: 'slide' })
  })

  it('passed_values は文字列の配列', () => {
    valid('passed_values', [])
    valid('passed_values', ['itemId', 'quantity'])
    invalid('passed_values', 'itemId')
    invalid('passed_values', [1, 2])
  })
})

describe('ATTRIBUTE_VALUE_SCHEMAS — 手動入力属性', () => {
  it('padding は数値または { top, right, bottom, left }', () => {
    valid('padding', 16)
    valid('padding', { top: 8, right: 16, bottom: 8, left: 16 })
    invalid('padding', -1)
    invalid('padding', { top: 8, right: 16 })   // bottom / left なし
  })

  it('order は 0 以上の整数', () => {
    valid('order', 0)
    valid('order', 3)
    invalid('order', -1)
    invalid('order', 1.5)
  })

  it('visibility は visible / hidden のみ', () => {
    valid('visibility', 'visible')
    valid('visibility', 'hidden')
    invalid('visibility', 'none')
  })
})

describe('parseAttributeValue', () => {
  it('valid な値は success: true', () => {
    const result = parseAttributeValue('x', 100)
    expect(result.success).toBe(true)
  })

  it('invalid な値は success: false', () => {
    const result = parseAttributeValue('opacity', 2)
    expect(result.success).toBe(false)
  })
})
