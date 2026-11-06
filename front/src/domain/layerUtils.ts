/**
 * レイヤーユーティリティ
 *
 * SVG のレイヤー名（Figma のレイヤー名 = `id` 属性）から
 * Atomic Design の層（LayerType）を判定する。
 * svg-import-spec.md §3.1・§4.1 に対応。
 */
import type { LayerType } from './enums'

/** 接頭辞 → LayerType のマッピング。svg-import-spec.md §4.1 */
const LAYER_PREFIX_MAP = {
  P_: 'page',
  T_: 'template',
  O_: 'organism',
  M_: 'molecule',
  A_: 'atom',
} as const satisfies Record<string, LayerType>

/** レイヤー名に使える文字の正規表現。svg-import-spec.md §4.1 の命名規則1 */
const VALID_NAME_RE = /^[A-Za-z0-9_]+$/

/**
 * レイヤー名の接頭辞から LayerType を返す。
 * 接頭辞がなければ null（図形の名前、または不正な名前）。
 */
export function getLayerTypeFromName(layerName: string): LayerType | null {
  for (const [prefix, layerType] of Object.entries(LAYER_PREFIX_MAP)) {
    if (layerName.startsWith(prefix) && layerName.length > prefix.length) {
      return layerType
    }
  }
  return null
}

/**
 * レイヤー名かどうか（いずれかの接頭辞で始まる）。
 * 文字種の検証は行わない。
 */
export function isLayerName(name: string): boolean {
  return getLayerTypeFromName(name) !== null
}

/**
 * レイヤー名として正しいかどうか。
 * 条件：使える文字（英数字・_）かつ既知の接頭辞で始まる。
 * svg-import-spec.md §4.1 命名規則1・2。
 */
export function isValidLayerName(name: string): boolean {
  return VALID_NAME_RE.test(name) && isLayerName(name)
}

/**
 * 図形の名前として正しいかどうか。
 * 条件：使える文字（英数字・_）かつ接頭辞がない。
 * svg-import-spec.md §4.1 命名規則3。
 */
export function isValidShapeName(name: string): boolean {
  return VALID_NAME_RE.test(name) && !isLayerName(name)
}

/** 接頭辞の一覧（文字列として）。SVG パース時の判定に使える。 */
export const LAYER_PREFIXES = Object.keys(LAYER_PREFIX_MAP) as ReadonlyArray<string>
