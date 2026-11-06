import { describe, it, expect } from 'vitest'
import {
  getLayerTypeFromName,
  isLayerName,
  isValidLayerName,
  isValidShapeName,
  LAYER_PREFIXES,
} from '../layerUtils'

describe('getLayerTypeFromName', () => {
  it('P_ → page', () => {
    expect(getLayerTypeFromName('P_ProductDetail')).toBe('page')
  })
  it('T_ → template', () => {
    expect(getLayerTypeFromName('T_ProductDetailTemplate')).toBe('template')
  })
  it('O_ → organism', () => {
    expect(getLayerTypeFromName('O_Header')).toBe('organism')
  })
  it('M_ → molecule', () => {
    expect(getLayerTypeFromName('M_SearchBox')).toBe('molecule')
  })
  it('A_ → atom', () => {
    expect(getLayerTypeFromName('A_Price')).toBe('atom')
  })

  it('接頭辞なし → null（図形名）', () => {
    expect(getLayerTypeFromName('Header_Bg')).toBeNull()
    expect(getLayerTypeFromName('Price_Text')).toBeNull()
  })

  it('未知の接頭辞 → null', () => {
    expect(getLayerTypeFromName('X_Unknown')).toBeNull()
    expect(getLayerTypeFromName('B_Footer')).toBeNull()
  })

  it('接頭辞だけの文字列 → null（名前部分がない）', () => {
    // "P_" だけで本体がない場合は null
    expect(getLayerTypeFromName('P_')).toBeNull()
  })

  it('空文字列 → null', () => {
    expect(getLayerTypeFromName('')).toBeNull()
  })

  it('大文字小文字の区別（小文字の接頭辞は不可）', () => {
    expect(getLayerTypeFromName('p_ProductDetail')).toBeNull()
    expect(getLayerTypeFromName('a_Button')).toBeNull()
  })
})

describe('isLayerName', () => {
  it('既知の接頭辞があれば true', () => {
    expect(isLayerName('P_Top')).toBe(true)
    expect(isLayerName('A_Button')).toBe(true)
  })
  it('接頭辞がなければ false', () => {
    expect(isLayerName('Button_Bg')).toBe(false)
    expect(isLayerName('Header')).toBe(false)
  })
})

describe('isValidLayerName', () => {
  it('英数字・_ のみ かつ 既知の接頭辞 → true', () => {
    expect(isValidLayerName('P_ProductDetail')).toBe(true)
    expect(isValidLayerName('A_CartIcon')).toBe(true)
    expect(isValidLayerName('M_SearchBox2')).toBe(true)
  })

  it('使えない文字（ハイフン）があれば false', () => {
    // svg-import-spec.md の naming_violation / invalid_characters に相当
    expect(isValidLayerName('O_Header-Main')).toBe(false)
  })

  it('スペースがあれば false', () => {
    expect(isValidLayerName('O_Header Main')).toBe(false)
  })

  it('日本語が含まれれば false', () => {
    expect(isValidLayerName('A_ボタン')).toBe(false)
  })

  it('接頭辞がなければ false（たとえ文字種が正しくても）', () => {
    expect(isValidLayerName('Header_Bg')).toBe(false)
  })
})

describe('isValidShapeName', () => {
  it('英数字・_ のみ かつ 接頭辞なし → true', () => {
    expect(isValidShapeName('Header_Bg')).toBe(true)
    expect(isValidShapeName('Price_Text')).toBe(true)
    expect(isValidShapeName('SearchInput_Bg')).toBe(true)
  })

  it('接頭辞があれば false', () => {
    expect(isValidShapeName('A_ButtonBg')).toBe(false)
    expect(isValidShapeName('P_Top')).toBe(false)
  })

  it('使えない文字があれば false', () => {
    expect(isValidShapeName('Header-Bg')).toBe(false)
    expect(isValidShapeName('Button Label')).toBe(false)
  })
})

describe('LAYER_PREFIXES', () => {
  it('5種類の接頭辞が存在する', () => {
    expect(LAYER_PREFIXES).toHaveLength(5)
    expect(LAYER_PREFIXES).toContain('P_')
    expect(LAYER_PREFIXES).toContain('T_')
    expect(LAYER_PREFIXES).toContain('O_')
    expect(LAYER_PREFIXES).toContain('M_')
    expect(LAYER_PREFIXES).toContain('A_')
  })
})
