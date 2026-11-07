/**
 * SVG 要素からノード・属性を抽出する
 * svg-import-spec.md §5
 *
 * getBBox は DI で渡す（ブラウザ: el.getBBox()、テスト: computeBBoxFromElement）
 */
import { getLayerTypeFromName, type LayerType } from '../../domain'
import {
  parseFill,
  parseStroke,
  parseFontWeight,
  parseLetterSpacing,
  round2,
} from './colorUtils'
import { classifyPath, computePathBBox } from './pathClassifier'
import type { ImportNodePayload, ImportAttribute, ImportWarning } from './types'

export type BBoxFn = (el: Element) => { x: number; y: number; width: number; height: number }

type ExtractionContext = {
  parentRef: string | null
  parentAbsX: number
  parentAbsY: number
  getBBox: BBoxFn
  counter: { value: number }
  warnings: ImportWarning[]
  nodes: ImportNodePayload[]
}

// ---- 属性抽出ヘルパー ----

function getAttr(el: Element, name: string): string | null {
  return el.getAttribute(name)
}

function extractFillAttrs(el: Element): ImportAttribute[] {
  const attrs: ImportAttribute[] = []
  const fill = parseFill(getAttr(el, 'fill'), getAttr(el, 'fill-opacity'))
  if (fill) attrs.push({ attribute_type: 'fill', value: fill })
  return attrs
}

function extractStrokeAttrs(el: Element): ImportAttribute[] {
  const attrs: ImportAttribute[] = []
  const stroke = parseStroke(getAttr(el, 'stroke'), getAttr(el, 'stroke-width'))
  if (stroke) attrs.push({ attribute_type: 'stroke', value: stroke })
  return attrs
}

function extractOpacity(el: Element): ImportAttribute[] {
  const opacity = getAttr(el, 'opacity')
  if (opacity === null) return []
  const val = parseFloat(opacity)
  if (isNaN(val) || val === 1) return []
  return [{ attribute_type: 'opacity', value: round2(val) }]
}

// ---- <text> 要素 ----

function processText(
  el: Element,
  sortOrder: number,
  ctx: ExtractionContext,
  parentRef: string | null,
): void {
  const tspan = el.querySelector('tspan')
  const shapeId = getAttr(el, 'id')
  if (!shapeId) return // unnamed_shape（warnings は validateSvg 側で処理）

  const bbox = ctx.getBBox(el)
  const absX = round2(bbox.x)
  const absY = round2(bbox.y)
  const relX = round2(absX - ctx.parentAbsX)
  const relY = round2(absY - ctx.parentAbsY)
  const width = round2(bbox.width)
  const height = round2(bbox.height)

  // text content: tspan の textContent（複数行は \n でつなぐ）
  const tspans = Array.from(el.querySelectorAll('tspan'))
  const characters = tspans.map(ts => ts.textContent ?? '').join('\n') || (el.textContent ?? '')

  const fontSize = parseFloat(getAttr(el, 'font-size') ?? '12')
  const fontWeight = parseFontWeight(getAttr(el, 'font-weight'))
  const fontFamily = getAttr(el, 'font-family') ?? 'sans-serif'
  const lsRaw = tspan?.style?.letterSpacing || getAttr(el, 'letter-spacing') || getAttr(tspan ?? el, 'letter-spacing')
  const letterSpacing = parseLetterSpacing(lsRaw, fontSize)

  const attrs: ImportAttribute[] = [
    { attribute_type: 'x', value: relX },
    { attribute_type: 'y', value: relY },
    { attribute_type: 'width', value: width },
    { attribute_type: 'height', value: height },
    { attribute_type: 'characters', value: characters },
    { attribute_type: 'font_family', value: fontFamily },
    { attribute_type: 'font_size', value: fontSize },
    { attribute_type: 'font_weight', value: fontWeight },
    { attribute_type: 'letter_spacing', value: round2(letterSpacing) },
  ]
  attrs.push(...extractFillAttrs(el))
  attrs.push(...extractOpacity(el))

  ctx.counter.value++
  const ref = String(ctx.counter.value)
  ctx.nodes.push({
    ref,
    parent_ref: parentRef,
    layer_name: shapeId,
    layer_type: null,
    node_kind: 'text',
    sort_order: sortOrder,
    attributes: attrs,
  })
}

// ---- <path> 要素 ----

function processPath(
  el: Element,
  sortOrder: number,
  ctx: ExtractionContext,
  parentRef: string | null,
): void {
  const shapeId = getAttr(el, 'id')
  if (!shapeId) return

  const bbox = ctx.getBBox(el)
  const absX = round2(bbox.x)
  const absY = round2(bbox.y)
  const relX = round2(absX - ctx.parentAbsX)
  const relY = round2(absY - ctx.parentAbsY)
  const width = round2(bbox.width)
  const height = round2(bbox.height)

  const d = getAttr(el, 'd') ?? ''
  const classified = classifyPath(d, bbox.y)

  const attrs: ImportAttribute[] = [
    { attribute_type: 'x', value: relX },
    { attribute_type: 'y', value: relY },
    { attribute_type: 'width', value: width },
    { attribute_type: 'height', value: height },
  ]
  attrs.push(...extractFillAttrs(el))
  attrs.push(...extractStrokeAttrs(el))
  attrs.push(...extractOpacity(el))

  let nodeKind: 'rectangle' | 'ellipse' | 'vector'
  if (classified.kind === 'rectangle') {
    nodeKind = 'rectangle'
    if (classified.cornerRadius > 0) {
      attrs.push({ attribute_type: 'corner_radius', value: classified.cornerRadius })
    }
  } else if (classified.kind === 'ellipse') {
    nodeKind = 'ellipse'
  } else {
    nodeKind = 'vector'
    attrs.push({ attribute_type: 'path', value: d })
  }

  ctx.counter.value++
  const ref = String(ctx.counter.value)
  ctx.nodes.push({
    ref,
    parent_ref: parentRef,
    layer_name: shapeId,
    layer_type: null,
    node_kind: nodeKind,
    sort_order: sortOrder,
    attributes: attrs,
  })
}

// ---- <rect> (id あり) ----

function processRect(
  el: Element,
  sortOrder: number,
  ctx: ExtractionContext,
  parentRef: string | null,
): void {
  const shapeId = getAttr(el, 'id')
  if (!shapeId) return

  // 絶対座標を読む（Figma の <rect> は明示的な x/y を持つ）
  const absX = round2(parseFloat(getAttr(el, 'x') ?? '0'))
  const absY = round2(parseFloat(getAttr(el, 'y') ?? '0'))
  const width = round2(parseFloat(getAttr(el, 'width') ?? '0'))
  const height = round2(parseFloat(getAttr(el, 'height') ?? '0'))
  const relX = round2(absX - ctx.parentAbsX)
  const relY = round2(absY - ctx.parentAbsY)

  const rx = parseFloat(getAttr(el, 'rx') ?? '0')

  const attrs: ImportAttribute[] = [
    { attribute_type: 'x', value: relX },
    { attribute_type: 'y', value: relY },
    { attribute_type: 'width', value: width },
    { attribute_type: 'height', value: height },
  ]
  attrs.push(...extractFillAttrs(el))
  attrs.push(...extractStrokeAttrs(el))
  attrs.push(...extractOpacity(el))
  if (rx > 0) attrs.push({ attribute_type: 'corner_radius', value: round2(rx) })

  ctx.counter.value++
  const ref = String(ctx.counter.value)
  ctx.nodes.push({
    ref,
    parent_ref: parentRef,
    layer_name: shapeId,
    layer_type: null,
    node_kind: 'rectangle',
    sort_order: sortOrder,
    attributes: attrs,
  })
}

// ---- <circle> / <ellipse> ----

function processEllipse(
  el: Element,
  sortOrder: number,
  ctx: ExtractionContext,
  parentRef: string | null,
): void {
  const shapeId = getAttr(el, 'id')
  if (!shapeId) return

  const cx = parseFloat(getAttr(el, 'cx') ?? '0')
  const cy = parseFloat(getAttr(el, 'cy') ?? '0')
  const rx = parseFloat(getAttr(el, 'rx') ?? getAttr(el, 'r') ?? '0')
  const ry = parseFloat(getAttr(el, 'ry') ?? getAttr(el, 'r') ?? '0')
  const absX = round2(cx - rx)
  const absY = round2(cy - ry)
  const relX = round2(absX - ctx.parentAbsX)
  const relY = round2(absY - ctx.parentAbsY)
  const width = round2(rx * 2)
  const height = round2(ry * 2)

  const attrs: ImportAttribute[] = [
    { attribute_type: 'x', value: relX },
    { attribute_type: 'y', value: relY },
    { attribute_type: 'width', value: width },
    { attribute_type: 'height', value: height },
  ]
  attrs.push(...extractFillAttrs(el))
  attrs.push(...extractStrokeAttrs(el))
  attrs.push(...extractOpacity(el))

  ctx.counter.value++
  const ref = String(ctx.counter.value)
  ctx.nodes.push({
    ref,
    parent_ref: parentRef,
    layer_name: shapeId,
    layer_type: null,
    node_kind: 'ellipse',
    sort_order: sortOrder,
    attributes: attrs,
  })
}

// ---- <g>（レイヤー）の再帰処理 ----

function processGroup(
  el: Element,
  sortOrder: number,
  ctx: ExtractionContext,
  parentRef: string | null,
): void {
  const id = getAttr(el, 'id') ?? ''
  const layerType: LayerType | null = getLayerTypeFromName(id)
  if (layerType === null) return // group_without_prefix はvalidateで検出済み

  const gBBox = ctx.getBBox(el)
  const absX = round2(gBBox.x)
  const absY = round2(gBBox.y)
  const relX = round2(absX - ctx.parentAbsX)
  const relY = round2(absY - ctx.parentAbsY)
  const width = round2(gBBox.width)
  const height = round2(gBBox.height)

  // 背景の <rect>（id なし）があれば frame、なければ group
  const bgRect = Array.from(el.children).find(
    c => c.tagName.toLowerCase() === 'rect' && !c.getAttribute('id'),
  )
  const nodeKind: 'frame' | 'group' = bgRect ? 'frame' : 'group'

  const attrs: ImportAttribute[] = [
    { attribute_type: 'x', value: relX },
    { attribute_type: 'y', value: relY },
    { attribute_type: 'width', value: width },
    { attribute_type: 'height', value: height },
  ]
  attrs.push(...extractOpacity(el))

  // frame の場合は背景 <rect> の fill/stroke をこのレイヤーに付ける
  if (bgRect) {
    attrs.push(...extractFillAttrs(bgRect))
    attrs.push(...extractStrokeAttrs(bgRect))
  }

  ctx.counter.value++
  const ref = String(ctx.counter.value)
  ctx.nodes.push({
    ref,
    parent_ref: parentRef,
    layer_name: id,
    layer_type: layerType,
    node_kind: nodeKind,
    sort_order: sortOrder,
    attributes: attrs,
  })

  // 子要素を処理
  const childCtx: ExtractionContext = {
    ...ctx,
    parentRef: ref,
    parentAbsX: absX,
    parentAbsY: absY,
  }

  let childSortOrder = 0
  for (const child of Array.from(el.children)) {
    const childTag = child.tagName.toLowerCase()

    // 背景 <rect>（id なし）はスキップ（すでに上で処理）
    if (childTag === 'rect' && !child.getAttribute('id')) continue

    // 無視
    if (['defs', 'clippath', 'style'].includes(childTag)) continue

    if (childTag === 'g') {
      processGroup(child, childSortOrder, childCtx, ref)
      childSortOrder++
    } else if (childTag === 'path') {
      processPath(child, childSortOrder, childCtx, ref)
      childSortOrder++
    } else if (childTag === 'rect') {
      processRect(child, childSortOrder, childCtx, ref)
      childSortOrder++
    } else if (childTag === 'circle' || childTag === 'ellipse') {
      processEllipse(child, childSortOrder, childCtx, ref)
      childSortOrder++
    } else if (childTag === 'text') {
      processText(child, childSortOrder, childCtx, ref)
      childSortOrder++
    } else if (childTag === 'image') {
      // image_ref は §6.2 の TODO（Supabase Storage 未実装）
      ctx.warnings.push({
        rule: 'unsupported_element',
        element: child.getAttribute('id') ?? 'image',
        message: '画像の取り込みは未対応です（image_ref は後続の Issue で実装）',
      })
    }
    // その他は unsupported_element 警告（ここでは省略）
  }
}

// ---- エントリーポイント ----

/**
 * SVG ルート要素からノード一覧を抽出する。
 * validateSvg() でエラーがないことを確認してから呼ぶ。
 *
 * @param svgEl   <svg> 要素（DOM に追加済みで getBBox が動く状態）
 * @param getBBox getBBox の実装（本番: el.getBBox(), テスト: computeBBoxFromElement）
 */
export function extractNodes(
  svgEl: Element,
  getBBox: BBoxFn,
): { nodes: ImportNodePayload[]; warnings: ImportWarning[] } {
  const nodes: ImportNodePayload[] = []
  const warnings: ImportWarning[] = []
  const counter = { value: 0 }

  // <svg> 属性からページサイズを取得
  const svgWidth = parseFloat(svgEl.getAttribute('width') ?? '0')
  const svgHeight = parseFloat(svgEl.getAttribute('height') ?? '0')

  // ページノード（P_...）を探して処理
  for (const child of Array.from(svgEl.children)) {
    if (child.tagName.toLowerCase() !== 'g') continue
    const id = child.getAttribute('id') ?? ''
    if (!id.startsWith('P_')) continue

    // ページ自体は svg の width/height を使い、座標は (0, 0)
    const pageFill = parseFill('white', null) // デフォルト（背景 rect の fill で上書きされる）
    const bgRect = Array.from(child.children).find(
      c => c.tagName.toLowerCase() === 'rect' && !c.getAttribute('id'),
    )
    const fill = bgRect ? parseFill(bgRect.getAttribute('fill'), bgRect.getAttribute('fill-opacity')) : pageFill

    counter.value++
    const pageRef = String(counter.value)
    const pageAttrs: ImportAttribute[] = [
      { attribute_type: 'x', value: 0 },
      { attribute_type: 'y', value: 0 },
      { attribute_type: 'width', value: svgWidth },
      { attribute_type: 'height', value: svgHeight },
    ]
    if (fill) pageAttrs.push({ attribute_type: 'fill', value: fill })

    nodes.push({
      ref: pageRef,
      parent_ref: null,
      layer_name: id,
      layer_type: 'page',
      node_kind: bgRect ? 'frame' : 'group',
      sort_order: 0,
      attributes: pageAttrs,
    })

    // ページの子を処理
    const pageCtx: ExtractionContext = {
      parentRef: pageRef,
      parentAbsX: 0,
      parentAbsY: 0,
      getBBox,
      counter,
      warnings,
      nodes,
    }

    let sortOrder = 0
    for (const grandchild of Array.from(child.children)) {
      const gcTag = grandchild.tagName.toLowerCase()
      if (gcTag === 'rect' && !grandchild.getAttribute('id')) continue // ページ背景
      if (['defs', 'clippath', 'style'].includes(gcTag)) continue
      if (gcTag === 'g') {
        processGroup(grandchild, sortOrder, pageCtx, pageRef)
        sortOrder++
      }
      // ページ直下の図形は svg-import-spec §4.2 で × （validateSvg で検証済み）
    }
  }

  return { nodes, warnings }
}
