/**
 * SVG 文字列をパースして ImportPayload に変換する
 * svg-import-spec.md §2
 *
 * ブラウザ（Chromium）環境で動かすことを前提にする。
 * getBBox を使うため、SVG を document.body の非表示 div に挿入する。
 */
import { validateSvg } from './validateSvg'
import { extractNodes, type BBoxFn } from './extractNodes'
import { computePathBBox } from './pathClassifier'
import type { ParseResult } from './types'

// ---- getBBox のブラウザ実装 ----

function browserGetBBox(el: Element): { x: number; y: number; width: number; height: number } {
  return (el as SVGGraphicsElement).getBBox()
}

// ---- DOMParser での SVG パース ----

function parseSvgString(svgText: string): Document {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, 'image/svg+xml')
  // パースエラーの確認
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error(`SVG パースエラー: ${parserError.textContent}`)
  }
  return doc
}

/**
 * SVG 文字列を取り込む（ブラウザ用）。
 *
 * 1. DOMParser で SVG をパース
 * 2. 命名規則・階層を検証
 * 3. document.body に追加して getBBox を取得
 * 4. ノード・属性を抽出して返す
 */
export async function parseSvg(svgText: string): Promise<ParseResult> {
  const doc = parseSvgString(svgText)

  // ---- 1. 検証 ----
  const violations = validateSvg(doc)
  if (violations.length > 0) {
    return { ok: false, violations }
  }

  // ---- 2. DOM に追加して getBBox を有効化 ----
  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;left:-99999px;top:-99999px;visibility:hidden;pointer-events:none'
  container.innerHTML = svgText
  document.body.appendChild(container)

  try {
    // フォントを待つ（テキストの getBBox に影響する）
    await document.fonts.ready

    const svgEl = container.querySelector('svg')
    if (!svgEl) {
      return {
        ok: false,
        violations: [{
          code: 'naming_violation',
          rule: 'no_page',
          layer_name: null,
          path: '',
          message: '<svg> 要素が見つかりません',
        }],
      }
    }

    // ---- 3. 抽出 ----
    const { nodes, warnings } = extractNodes(svgEl, browserGetBBox)
    return { ok: true, payload: { nodes }, warnings }
  } finally {
    document.body.removeChild(container)
  }
}

// ---- テスト用: DOM なし版 ----

/**
 * jsdom テスト用。Document と getBBox 関数を外から渡す。
 * 検証のみ行いたい場合は getBBox = () => ({x:0,y:0,width:0,height:0}) を渡す。
 */
export function parseSvgDoc(
  svgDoc: Document,
  getBBoxFn?: BBoxFn,
): ParseResult {
  const violations = validateSvg(svgDoc)
  if (violations.length > 0) {
    return { ok: false, violations }
  }

  const svgEl = svgDoc.documentElement
  if (!svgEl || svgEl.tagName.toLowerCase() !== 'svg') {
    return { ok: false, violations: [{ code: 'naming_violation', rule: 'no_page', layer_name: null, path: '', message: '<svg> 要素が見つかりません' }] }
  }

  const getBBox: BBoxFn = getBBoxFn ?? computeBBoxFromElement
  const { nodes, warnings } = extractNodes(svgEl, getBBox)
  return { ok: true, payload: { nodes }, warnings }
}

// ---- テスト用: Element の属性から bbox を計算 ----

/**
 * jsdom で getBBox が動かない環境向けのフォールバック。
 * SVG 属性から bbox を近似計算する。
 */
export function computeBBoxFromElement(el: Element): {
  x: number; y: number; width: number; height: number
} {
  const tag = el.tagName.toLowerCase()

  if (tag === 'rect') {
    return {
      x: parseFloat(el.getAttribute('x') ?? '0'),
      y: parseFloat(el.getAttribute('y') ?? '0'),
      width: parseFloat(el.getAttribute('width') ?? '0'),
      height: parseFloat(el.getAttribute('height') ?? '0'),
    }
  }

  if (tag === 'circle' || tag === 'ellipse') {
    const cx = parseFloat(el.getAttribute('cx') ?? '0')
    const cy = parseFloat(el.getAttribute('cy') ?? '0')
    const rx = parseFloat(el.getAttribute('rx') ?? el.getAttribute('r') ?? '0')
    const ry = parseFloat(el.getAttribute('ry') ?? el.getAttribute('r') ?? '0')
    return { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2 }
  }

  if (tag === 'path') {
    const d = el.getAttribute('d') ?? ''
    return computePathBBox(d)
  }

  if (tag === 'text') {
    const tspan = el.querySelector('tspan')
    if (tspan) {
      const x = parseFloat(tspan.getAttribute('x') ?? '0')
      const baseline = parseFloat(tspan.getAttribute('y') ?? '0')
      const fontSize = parseFloat(el.getAttribute('font-size') ?? '12')
      const content = tspan.textContent ?? ''
      // 文字幅の近似（テストで ±3px 許容）
      // CJK / Hiragana / Katakana は full-width（1.0em）、Latin は 0.55em
      const estimatedWidth = [...content].reduce((sum, ch) => {
        const cp = ch.codePointAt(0) ?? 0
        const isFullWidth =
          (cp >= 0x3000 && cp <= 0x9FFF) ||  // CJK Unified Ideographs + Katakana/Hiragana
          (cp >= 0xF900 && cp <= 0xFAFF) ||  // CJK Compatibility Ideographs
          (cp >= 0x3400 && cp <= 0x4DBF) ||  // CJK Extension A
          (cp >= 0xFF00 && cp <= 0xFFEF)     // Halfwidth/Fullwidth Forms
        return sum + fontSize * (isFullWidth ? 1.0 : 0.60)
      }, 0)
      // Inter フォントの ascent ≈ fontSize、height ≈ fontSize × 1.25
      return {
        x,
        y: baseline - fontSize,
        width: estimatedWidth,
        height: fontSize * 1.25,
      }
    }
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  if (tag === 'g') {
    // 子要素の bbox の和集合
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
    for (const child of Array.from(el.children)) {
      const childTag = child.tagName.toLowerCase()
      if (['defs', 'clippath', 'style'].includes(childTag)) continue
      const cb = computeBBoxFromElement(child)
      if (cb.width === 0 && cb.height === 0) continue
      x1 = Math.min(x1, cb.x)
      y1 = Math.min(y1, cb.y)
      x2 = Math.max(x2, cb.x + cb.width)
      y2 = Math.max(y2, cb.y + cb.height)
    }
    if (!isFinite(x1)) return { x: 0, y: 0, width: 0, height: 0 }
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 }
  }

  return { x: 0, y: 0, width: 0, height: 0 }
}
