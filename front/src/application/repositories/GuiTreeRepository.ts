/**
 * GUI ツリー（ノード＋属性）の取得・取り込みリポジトリ
 * svg-import-spec.md §6 / api.md §6.2
 */
import type { Node, Attribute, Link } from '../../domain/entities'
import type { ImportPayload } from '../import/types'
import type { AppError } from '../AppError'

/** GUI に属する全ノード・属性・リンクをまとめた型（buildRenderTree の入力として使う） */
export type GuiTree = {
  gui_id: string
  nodes: Node[]
  attributes: Attribute[]
  links: Link[]
}

export interface GuiTreeRepository {
  /**
   * GUI に Figma SVG を初回取り込みする。
   * import_page RPC を呼び出し、全ノードと属性を挿入して GuiTree を返す。
   */
  importPage(guiId: string, payload: ImportPayload): Promise<GuiTree | AppError>

  /**
   * 既存ページを削除して再取り込みする。
   * reimport_page RPC を呼び出す。
   */
  reimportPage(pageNodeId: string, payload: ImportPayload): Promise<GuiTree | AppError>

  /**
   * GUI に属する全ノード・属性を取得する。
   * nodes が空の場合は nodes=[], attributes=[] を返す（エラーにしない）。
   */
  getTree(guiId: string): Promise<GuiTree | AppError>

  /**
   * ページノードの x・y 属性を更新する（Issue #23）。
   * update_page_position RPC を呼び出す。
   */
  updatePagePosition(pageNodeId: string, x: number, y: number): Promise<void | AppError>
}
