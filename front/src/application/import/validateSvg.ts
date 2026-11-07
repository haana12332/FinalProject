/**
 * SVG 構造の検証（命名規則・階層ルール）
 * svg-import-spec.md §4・§9
 *
 * DOM 操作のみ（getBBox 不要）。DOMParser でパースした Document に対して実行できる。
 */
import {
  getLayerTypeFromName,
  isLayerName,
  checkNodeHierarchy,
  type LayerType,
} from '../../domain'
import type { ImportViolation } from './types'

/** 名前に使える文字の正規表現 */
const VALID_NAME_RE = /^[A-Za-z0-9_]+$/

/** 図形要素のタグ名セット（case-insensitive で比較するために小文字で保持） */
const SHAPE_TAGS = new Set(['path', 'rect', 'circle', 'ellipse', 'text', 'image'])

function isShapeTag(tagName: string): boolean {
  return SHAPE_TAGS.has(tagName.toLowerCase())
}

/** 背景の <rect>：id なし or id が空文字 */
function isBackgroundRect(el: Element): boolean {
  return el.tagName.toLowerCase() === 'rect' && !el.getAttribute('id')
}

function makePath(parts: string[]): string {
  return parts.join(' > ')
}

// ---- 再帰的な検証 ----

function traverse(
  parent: Element,
  parentLayerType: LayerType | null,
  pathParts: string[],
  violations: ImportViolation[],
): void {
  for (const child of Array.from(parent.children)) {
    const tag = child.tagName.toLowerCase()

    // 無視する要素
    if (['defs', 'clippath', 'style', 'use', 'mask', 'filter', 'lineargradient', 'radialgradient', 'pattern', 'symbol'].includes(tag)) {
      continue
    }

    if (tag === 'g') {
      // ---- レイヤー ----
      const id = child.getAttribute('id') ?? ''

      if (!id) {
        violations.push({
          code: 'naming_violation',
          rule: 'missing_id',
          layer_name: null,
          path: makePath(pathParts) || '<svg>',
          message: `名前のないグループがあります（${makePath(pathParts) || '<svg>'}）。Figma でレイヤー名を付けてください`,
        })
        // id がないため子を辿る意味がない（layer_type 不明）
        continue
      }

      if (!VALID_NAME_RE.test(id)) {
        violations.push({
          code: 'naming_violation',
          rule: 'invalid_characters',
          layer_name: id,
          path: makePath([...pathParts, id]),
          message: `「${id}」に使えない文字が含まれています。レイヤー名は英字・数字・_ だけにしてください`,
        })
        continue
      }

      const layerType = getLayerTypeFromName(id)

      if (layerType === null) {
        violations.push({
          code: 'naming_violation',
          rule: 'group_without_prefix',
          layer_name: id,
          path: makePath([...pathParts, id]),
          message: `グループ「${id}」に接頭辞がありません。P_ / T_ / O_ / M_ / A_ のどれかを付けてください`,
        })
        continue
      }

      // 階層チェック（page より上、つまり SVG 直下は parentLayerType=null でスキップ）
      if (parentLayerType !== null) {
        const result = checkNodeHierarchy(parentLayerType, layerType)
        if (!result.ok) {
          violations.push({
            code: 'hierarchy_violation',
            rule: 'invalid_parent',
            layer_name: id,
            path: makePath([...pathParts, id]),
            message: `${parentLayerType} の下に ${layerType}（${id}）は置けません`,
          })
          // 階層違反でも子は走査する（すべてのエラーを収集するため）
        }
      }

      traverse(child, layerType, [...pathParts, id], violations)
    } else if (isShapeTag(tag)) {
      // ---- 図形 ----

      // 背景の <rect>（id なし）はチェックしない
      if (isBackgroundRect(child)) continue

      const shapeId = child.getAttribute('id') ?? ''

      // SVG ルート直下（page の外）にある図形 → shape_outside_layer
      if (parentLayerType === null) {
        violations.push({
          code: 'hierarchy_violation',
          rule: 'shape_outside_layer',
          layer_name: shapeId || null,
          path: makePath(shapeId ? [...pathParts, shapeId] : pathParts),
          message: `図形「${shapeId}」がページの外にあります。ページのフレームの中に入れてください`,
        })
        continue
      }

      if (!shapeId) {
        // unnamed_shape は警告（呼び出し側で処理）
        continue
      }

      // 図形に接頭辞がある
      if (isLayerName(shapeId)) {
        violations.push({
          code: 'naming_violation',
          rule: 'prefix_on_shape',
          layer_name: shapeId,
          path: makePath([...pathParts, shapeId]),
          message: `図形「${shapeId}」に接頭辞が付いています。接頭辞はグループ（フレーム）にだけ付けてください`,
        })
      }

      // 文字種チェック
      if (shapeId && !VALID_NAME_RE.test(shapeId)) {
        violations.push({
          code: 'naming_violation',
          rule: 'invalid_characters',
          layer_name: shapeId,
          path: makePath([...pathParts, shapeId]),
          message: `「${shapeId}」に使えない文字が含まれています。レイヤー名は英字・数字・_ だけにしてください`,
        })
      }
    }
    // それ以外の SVG 要素（line, polygon, use など）→ unsupported_element 警告（呼び出し側で処理）
  }
}

/**
 * SVG Document の構造を検証し、違反の一覧を返す。
 * 1件でも violations.length > 0 なら取り込みを中止する。
 */
export function validateSvg(svgDoc: Document): ImportViolation[] {
  const violations: ImportViolation[] = []

  const svgEl = svgDoc.documentElement
  if (!svgEl || svgEl.tagName.toLowerCase() !== 'svg') {
    violations.push({
      code: 'naming_violation',
      rule: 'no_page',
      layer_name: null,
      path: '',
      message: 'ページ（P_）がありません。ページのフレームを書き出してください',
    })
    return violations
  }

  // SVG 直下の <g> 要素を列挙
  const rootGs = Array.from(svgEl.children).filter(c => c.tagName.toLowerCase() === 'g')

  if (rootGs.length === 0) {
    violations.push({
      code: 'naming_violation',
      rule: 'no_page',
      layer_name: null,
      path: '',
      message: 'ページ（P_）がありません。ページのフレームを書き出してください',
    })
    return violations
  }

  // ページ数チェック
  const pages = rootGs.filter(g => (g.getAttribute('id') ?? '').startsWith('P_'))

  if (pages.length === 0) {
    // 最上位レイヤーが P_ でない
    const firstName = rootGs[0].getAttribute('id') ?? ''
    violations.push({
      code: 'naming_violation',
      rule: 'root_not_page',
      layer_name: firstName || null,
      path: firstName || '<svg>',
      message: `最上位のレイヤー「${firstName}」がページ（P_）ではありません。ページのフレームを書き出してください`,
    })
    // 続けて内部を走査しない（page がない状態での階層チェックは意味がない）
    return violations
  }

  if (pages.length > 1) {
    const names = pages.map(p => p.getAttribute('id') ?? '').join(', ')
    violations.push({
      code: 'naming_violation',
      rule: 'multiple_pages',
      layer_name: names,
      path: names,
      message: `ページが ${pages.length} 個あります（${names}）。1つの SVG にはページを1つだけ入れてください`,
    })
    // エラーがあるが内部走査は続ける（他のエラーも全て収集する）
  }

  // SVG 直下の図形（page の外）
  const rootShapes = Array.from(svgEl.children).filter(
    c => isShapeTag(c.tagName) && !isBackgroundRect(c),
  )
  for (const shape of rootShapes) {
    const shapeId = shape.getAttribute('id') ?? ''
    violations.push({
      code: 'hierarchy_violation',
      rule: 'shape_outside_layer',
      layer_name: shapeId || null,
      path: shapeId || '<svg>',
      message: `図形「${shapeId}」がページの外にあります。ページのフレームの中に入れてください`,
    })
  }

  // 全 root <g> を走査（page が1つでも複数でも）
  for (const rootG of rootGs) {
    const id = rootG.getAttribute('id') ?? ''
    const layerType = getLayerTypeFromName(id)
    if (layerType !== null) {
      traverse(rootG, layerType, [id], violations)
    }
  }

  return violations
}
