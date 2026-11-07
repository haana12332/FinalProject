/**
 * SVG `<path>` の d 属性から node_kind と corner_radius を判定する
 * svg-import-spec.md §5.3
 *
 * Figma が出力するパスの分類：
 * - M + H + V + Z のみ        → rectangle (corner_radius = 0)
 * - M + H + V + C + Z         → rectangle with corner_radius
 * - M + C + Z のみ（4曲線）   → ellipse
 * - それ以外                   → vector
 */

import { round2 } from './colorUtils'

/** パスの全コマンドを絶対座標のポイント列に展開し bbox を返す */
export function computePathBBox(d: string): {
  x: number; y: number; width: number; height: number
} {
  const xs: number[] = []
  const ys: number[] = []
  let cx = 0
  let cy = 0

  // コマンドを分割（先頭文字で区切る）
  const tokens = d.match(/[MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*/g) ?? []

  for (const token of tokens) {
    const type = token[0]
    const args = token
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter(n => !isNaN(n))

    switch (type) {
      case 'M':
      case 'L':
        for (let i = 0; i + 1 < args.length; i += 2) {
          cx = args[i]
          cy = args[i + 1]
          xs.push(cx)
          ys.push(cy)
        }
        break
      case 'H':
        args.forEach(x => { cx = x; xs.push(cx); ys.push(cy) })
        break
      case 'V':
        args.forEach(y => { cy = y; xs.push(cx); ys.push(cy) })
        break
      case 'C':
        // 制御点2つ + 終点
        for (let i = 0; i + 5 < args.length; i += 6) {
          xs.push(args[i], args[i + 2], args[i + 4])
          ys.push(args[i + 1], args[i + 3], args[i + 5])
          cx = args[i + 4]
          cy = args[i + 5]
        }
        break
      case 'Z':
      case 'z':
        break
      // 相対コマンド（Figma は絶対だが一応）
      case 'm':
      case 'l':
        for (let i = 0; i + 1 < args.length; i += 2) {
          cx += args[i]; cy += args[i + 1]
          xs.push(cx); ys.push(cy)
        }
        break
      case 'h':
        args.forEach(dx => { cx += dx; xs.push(cx); ys.push(cy) })
        break
      case 'v':
        args.forEach(dy => { cy += dy; xs.push(cx); ys.push(cy) })
        break
    }
  }

  if (xs.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return {
    x: round2(x),
    y: round2(y),
    width: round2(Math.max(...xs) - x),
    height: round2(Math.max(...ys) - y),
  }
}

type ClassifyResult =
  | { kind: 'rectangle'; cornerRadius: number }
  | { kind: 'ellipse' }
  | { kind: 'vector' }

/**
 * d 属性からパスの種類を判定する。
 * bbox.y は corner_radius の計算に使う（外側から渡す）。
 */
export function classifyPath(d: string, bboxY: number): ClassifyResult {
  const tokens = d.match(/[MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*/g) ?? []
  const types = tokens.map(t => t[0].toUpperCase())

  const hasC = types.includes('C')
  const hasH = types.includes('H')
  const hasV = types.includes('V')
  const onlyMHVZ = types.every(t => 'MHVZ'.includes(t))

  // 四角形（角丸なし）
  if (onlyMHVZ) {
    return { kind: 'rectangle', cornerRadius: 0 }
  }

  // 四角形（角丸あり）: H / V と C が交互に並ぶ
  if (hasC && (hasH || hasV)) {
    const radius = extractCornerRadius(d, bboxY)
    return { kind: 'rectangle', cornerRadius: radius }
  }

  // 楕円（円含む）: M + C×4 + Z
  if (hasC && !hasH && !hasV) {
    const cCount = types.filter(t => t === 'C').length
    // 1つの C コマンドに複数セグメントが入る場合もある
    const cSegments = tokens
      .filter(t => t[0].toUpperCase() === 'C')
      .reduce((acc, t) => {
        const args = t.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n))
        return acc + args.length / 6
      }, 0)
    if (cCount >= 1 && cSegments >= 4) {
      return { kind: 'ellipse' }
    }
    // C が少ない場合は vector
  }

  return { kind: 'vector' }
}

/**
 * 角丸四角形のパスから corner_radius を抽出する。
 * 最初の H → C 遷移を見て、C 終点の y - bbox.y を返す。
 */
function extractCornerRadius(d: string, bboxY: number): number {
  // "H{...} C {cp1} {cp2} {end_x} {end_y}" のパターンを探す
  const match = d.match(/[Hh][^CcMmLl]*[Cc]\s*[\d.+-]+\s+[\d.+-]+\s+[\d.+-]+\s+[\d.+-]+\s+([\d.+-]+)\s+([\d.+-]+)/)
  if (match) {
    const endY = parseFloat(match[2])
    const r = Math.abs(endY - bboxY)
    return round2(r)
  }
  return 0
}
