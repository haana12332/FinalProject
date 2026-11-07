/**
 * SVG の色・塗り・線の値を domain の形式に変換する
 * svg-import-spec.md §5.4
 */

/** CSS 色名 / 16進 → 大文字 #RRGGBB */
export function normalizeColor(color: string): string {
  if (!color || color === 'none') return color
  if (color === 'white') return '#FFFFFF'
  if (color === 'black') return '#000000'
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    // 3桁 → 6桁に展開
    if (hex.length === 3) {
      return '#' + hex.split('').map(c => c + c).join('').toUpperCase()
    }
    return '#' + hex.toUpperCase()
  }
  // rgb(r, g, b) 形式
  const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`.toUpperCase()
  }
  return color
}

/** fill 文字列 → [{ color, opacity }] | null */
export function parseFill(
  fillAttr: string | null,
  fillOpacity: string | null,
): Array<{ color: string; opacity: number }> | null {
  if (!fillAttr || fillAttr === 'none') return null
  // グラデーション（url(#...)）は unsupported_fill として null を返す
  if (fillAttr.startsWith('url(')) return null
  const color = normalizeColor(fillAttr)
  const opacity = fillOpacity ? parseFloat(fillOpacity) : 1
  return [{ color, opacity: isNaN(opacity) ? 1 : opacity }]
}

/** stroke + stroke-width → [{ color, weight }] | null */
export function parseStroke(
  strokeAttr: string | null,
  strokeWidthAttr: string | null,
): Array<{ color: string; weight: number }> | null {
  if (!strokeAttr || strokeAttr === 'none') return null
  if (strokeAttr.startsWith('url(')) return null
  const color = normalizeColor(strokeAttr)
  const weight = strokeWidthAttr ? parseFloat(strokeWidthAttr) : 1
  return [{ color, weight: isNaN(weight) ? 1 : weight }]
}

/** font-weight 文字列 → 数値 (400 / 700 / 100-900) */
export function parseFontWeight(fw: string | null | undefined): number {
  if (!fw) return 400
  if (fw === 'bold') return 700
  if (fw === 'normal') return 400
  const n = parseInt(fw)
  return isNaN(n) ? 400 : n
}

/** letter-spacing の em → px 変換 */
export function parseLetterSpacing(ls: string | null | undefined, fontSize: number): number {
  if (!ls || ls === '0' || ls === '0em') return 0
  const emMatch = ls.match(/([\d.+-]+)em/)
  if (emMatch) return parseFloat(emMatch[1]) * fontSize
  const pxMatch = ls.match(/([\d.+-]+)(?:px)?$/)
  if (pxMatch) return parseFloat(pxMatch[1])
  return 0
}

/** 小数第2位で丸める */
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
