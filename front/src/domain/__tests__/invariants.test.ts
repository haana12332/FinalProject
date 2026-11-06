import { describe, it, expect } from 'vitest'
import {
  checkAttributeOwnership,
  checkAttributeTypeForNodeKind,
  checkAttributeValue,
  checkAttributeSource,
  checkDetermineType,
  checkNodeHierarchy,
  checkShapeParent,
  validateAttribute,
} from '../invariants'

// --- 不変条件1：node_id と link_id は排他 ---

describe('checkAttributeOwnership', () => {
  it('node_id のみ → ok', () => {
    expect(checkAttributeOwnership('node-1', null).ok).toBe(true)
  })

  it('link_id のみ → ok', () => {
    expect(checkAttributeOwnership(null, 'link-1').ok).toBe(true)
  })

  it('両方 null → エラー', () => {
    const r = checkAttributeOwnership(null, null)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/両方が null/)
  })

  it('両方に値 → エラー', () => {
    const r = checkAttributeOwnership('node-1', 'link-1')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/両方に値/)
  })
})

// --- 不変条件2：node_kind に許された属性 ---

describe('checkAttributeTypeForNodeKind', () => {
  it('x は全 node_kind に許可', () => {
    for (const kind of ['frame', 'group', 'rectangle', 'ellipse', 'vector', 'text', 'image'] as const) {
      expect(checkAttributeTypeForNodeKind('x', kind).ok, `x on ${kind}`).toBe(true)
    }
  })

  it('fill は text に許可', () => {
    expect(checkAttributeTypeForNodeKind('fill', 'text').ok).toBe(true)
  })

  it('fill は image に不許可', () => {
    const r = checkAttributeTypeForNodeKind('fill', 'image')
    expect(r.ok).toBe(false)
  })

  it('stroke は ellipse に許可', () => {
    expect(checkAttributeTypeForNodeKind('stroke', 'ellipse').ok).toBe(true)
  })

  it('stroke は text に不許可', () => {
    expect(checkAttributeTypeForNodeKind('stroke', 'text').ok).toBe(false)
  })

  it('corner_radius は frame / rectangle のみ', () => {
    expect(checkAttributeTypeForNodeKind('corner_radius', 'frame').ok).toBe(true)
    expect(checkAttributeTypeForNodeKind('corner_radius', 'rectangle').ok).toBe(true)
    expect(checkAttributeTypeForNodeKind('corner_radius', 'ellipse').ok).toBe(false)
    expect(checkAttributeTypeForNodeKind('corner_radius', 'text').ok).toBe(false)
  })

  it('path は vector のみ', () => {
    expect(checkAttributeTypeForNodeKind('path', 'vector').ok).toBe(true)
    expect(checkAttributeTypeForNodeKind('path', 'rectangle').ok).toBe(false)
  })

  it('image_ref は image のみ', () => {
    expect(checkAttributeTypeForNodeKind('image_ref', 'image').ok).toBe(true)
    expect(checkAttributeTypeForNodeKind('image_ref', 'rectangle').ok).toBe(false)
  })

  it('characters / font_size / text_align は text のみ', () => {
    expect(checkAttributeTypeForNodeKind('characters', 'text').ok).toBe(true)
    expect(checkAttributeTypeForNodeKind('characters', 'rectangle').ok).toBe(false)
    expect(checkAttributeTypeForNodeKind('font_size', 'text').ok).toBe(true)
    expect(checkAttributeTypeForNodeKind('text_align', 'frame').ok).toBe(false)
  })

  it('リンク属性はノードに不許可', () => {
    expect(checkAttributeTypeForNodeKind('trigger', 'frame').ok).toBe(false)
    expect(checkAttributeTypeForNodeKind('hit_area', 'rectangle').ok).toBe(false)
    expect(checkAttributeTypeForNodeKind('transition_method', 'text').ok).toBe(false)
  })

  it('手動入力属性は全 node_kind に許可', () => {
    for (const kind of ['frame', 'group', 'rectangle', 'ellipse', 'vector', 'text', 'image'] as const) {
      expect(checkAttributeTypeForNodeKind('purpose', kind).ok, `purpose on ${kind}`).toBe(true)
      expect(checkAttributeTypeForNodeKind('visibility', kind).ok, `visibility on ${kind}`).toBe(true)
    }
  })
})

// --- 不変条件3：value の形 ---

describe('checkAttributeValue', () => {
  it('valid な値 → ok', () => {
    expect(checkAttributeValue('x', 100).ok).toBe(true)
    expect(checkAttributeValue('fill', [{ color: '#FF0000', opacity: 1 }]).ok).toBe(true)
    expect(checkAttributeValue('trigger', 'click').ok).toBe(true)
    expect(checkAttributeValue('composition', null).ok).toBe(true)
  })

  it('invalid な値 → エラー', () => {
    expect(checkAttributeValue('opacity', 2).ok).toBe(false)
    expect(checkAttributeValue('trigger', 'tap').ok).toBe(false)
    expect(checkAttributeValue('fill', []).ok).toBe(false)
  })

  it('エラーメッセージに attribute_type が含まれる', () => {
    const r = checkAttributeValue('opacity', 999)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toContain('opacity')
  })
})

// --- 不変条件5：source = 'figma' は Figma 由来のみ ---

describe('checkAttributeSource', () => {
  it('Figma 由来の属性に figma → ok', () => {
    expect(checkAttributeSource('x', 'figma').ok).toBe(true)
    expect(checkAttributeSource('fill', 'figma').ok).toBe(true)
    expect(checkAttributeSource('text_align', 'figma').ok).toBe(true)
  })

  it('Figma 由来の属性に manual → ok', () => {
    expect(checkAttributeSource('x', 'manual').ok).toBe(true)
  })

  it('手動入力属性に figma → エラー', () => {
    expect(checkAttributeSource('purpose', 'figma').ok).toBe(false)
    expect(checkAttributeSource('visibility', 'figma').ok).toBe(false)
    expect(checkAttributeSource('padding', 'figma').ok).toBe(false)
  })

  it('リンク属性に figma → エラー', () => {
    expect(checkAttributeSource('trigger', 'figma').ok).toBe(false)
    expect(checkAttributeSource('hit_area', 'figma').ok).toBe(false)
  })
})

// --- 不変条件7：determine_type と attribute_type の対応 ---

describe('checkDetermineType', () => {
  it('static_property は x, y, fill など', () => {
    expect(checkDetermineType('static_property', 'x').ok).toBe(true)
    expect(checkDetermineType('static_property', 'fill').ok).toBe(true)
    expect(checkDetermineType('static_property', 'padding').ok).toBe(true)
  })

  it('arrangement は order, gap のみ', () => {
    expect(checkDetermineType('arrangement', 'order').ok).toBe(true)
    expect(checkDetermineType('arrangement', 'gap').ok).toBe(true)
    expect(checkDetermineType('arrangement', 'x').ok).toBe(false)
  })

  it('interaction は link_source, hit_area, trigger, transition_method', () => {
    expect(checkDetermineType('interaction', 'trigger').ok).toBe(true)
    expect(checkDetermineType('interaction', 'transition_method').ok).toBe(true)
    expect(checkDetermineType('interaction', 'x').ok).toBe(false)
  })

  it('state_transition は impact_scope, animation など', () => {
    expect(checkDetermineType('state_transition', 'animation').ok).toBe(true)
    expect(checkDetermineType('state_transition', 'return_state').ok).toBe(true)
    expect(checkDetermineType('state_transition', 'trigger').ok).toBe(false)
  })

  it('class_or_token_purpose / class_or_token_reuse はどちらも class_or_token', () => {
    expect(checkDetermineType('class_or_token_purpose', 'class_or_token').ok).toBe(true)
    expect(checkDetermineType('class_or_token_reuse', 'class_or_token').ok).toBe(true)
  })

  it('target_device は target_device のみ', () => {
    expect(checkDetermineType('target_device', 'target_device').ok).toBe(true)
    expect(checkDetermineType('target_device', 'purpose').ok).toBe(false)
  })

  it('エラーメッセージに両方の型名が含まれる', () => {
    const r = checkDetermineType('arrangement', 'x')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.message).toContain('arrangement')
      expect(r.message).toContain('x')
    }
  })
})

// --- 階層制約 ---

describe('checkNodeHierarchy', () => {
  it('page → template は許可', () => {
    expect(checkNodeHierarchy('page', 'template').ok).toBe(true)
  })

  it('template → organism, molecule, atom は許可', () => {
    expect(checkNodeHierarchy('template', 'organism').ok).toBe(true)
    expect(checkNodeHierarchy('template', 'molecule').ok).toBe(true)
    expect(checkNodeHierarchy('template', 'atom').ok).toBe(true)
  })

  it('organism → molecule, atom は許可', () => {
    expect(checkNodeHierarchy('organism', 'molecule').ok).toBe(true)
    expect(checkNodeHierarchy('organism', 'atom').ok).toBe(true)
  })

  it('molecule → atom は許可', () => {
    expect(checkNodeHierarchy('molecule', 'atom').ok).toBe(true)
  })

  it('page → organism は不許可', () => {
    const r = checkNodeHierarchy('page', 'organism')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toContain('page')
  })

  it('page → molecule, atom, page は不許可', () => {
    expect(checkNodeHierarchy('page', 'molecule').ok).toBe(false)
    expect(checkNodeHierarchy('page', 'atom').ok).toBe(false)
    expect(checkNodeHierarchy('page', 'page').ok).toBe(false)
  })

  it('template → template, page は不許可', () => {
    expect(checkNodeHierarchy('template', 'template').ok).toBe(false)
    expect(checkNodeHierarchy('template', 'page').ok).toBe(false)
  })

  it('organism → organism, template は不許可', () => {
    expect(checkNodeHierarchy('organism', 'organism').ok).toBe(false)
    expect(checkNodeHierarchy('organism', 'template').ok).toBe(false)
  })

  it('molecule → organism, molecule は不許可', () => {
    expect(checkNodeHierarchy('molecule', 'organism').ok).toBe(false)
    expect(checkNodeHierarchy('molecule', 'molecule').ok).toBe(false)
  })

  it('atom は子を持てない（全種類不許可）', () => {
    for (const child of ['page', 'template', 'organism', 'molecule', 'atom'] as const) {
      expect(checkNodeHierarchy('atom', child).ok, `atom → ${child}`).toBe(false)
    }
  })
})

describe('checkShapeParent', () => {
  it('template / organism / molecule / atom の下は許可', () => {
    expect(checkShapeParent('template').ok).toBe(true)
    expect(checkShapeParent('organism').ok).toBe(true)
    expect(checkShapeParent('molecule').ok).toBe(true)
    expect(checkShapeParent('atom').ok).toBe(true)
  })

  it('page の下は不許可', () => {
    const r = checkShapeParent('page')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toContain('ページ')
  })

  it('親なし（null）は不許可', () => {
    const r = checkShapeParent(null)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toContain('外')
  })
})

// --- validateAttribute（コンビネーター） ---

describe('validateAttribute', () => {
  it('すべて valid なら空配列', () => {
    const errors = validateAttribute(
      {
        node_id: 'node-1',
        link_id: null,
        attribute_type: 'x',
        value: 100,
        source: 'figma',
      },
      'frame',
    )
    expect(errors).toHaveLength(0)
  })

  it('複数の違反をまとめて返す', () => {
    const errors = validateAttribute(
      {
        node_id: 'node-1',
        link_id: null,
        attribute_type: 'opacity',
        value: 999,          // 不変条件3違反
        source: 'figma',
      },
      'frame',
    )
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.every((e) => !e.ok)).toBe(true)
  })

  it('node_id と link_id の両方に値があればエラー', () => {
    const errors = validateAttribute({
      node_id: 'node-1',
      link_id: 'link-1',
      attribute_type: 'x',
      value: 0,
      source: 'figma',
    })
    expect(errors.length).toBeGreaterThan(0)
  })

  it('リンク属性をノードに付けようとするとエラー', () => {
    const errors = validateAttribute(
      {
        node_id: 'node-1',
        link_id: null,
        attribute_type: 'trigger',
        value: 'click',
        source: 'manual',
      },
      'frame',
    )
    expect(errors.length).toBeGreaterThan(0)
  })
})
