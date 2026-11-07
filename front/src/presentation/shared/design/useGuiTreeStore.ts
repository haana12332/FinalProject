/**
 * 現在表示中の GUI ツリーを保持する Zustand ストア
 *
 * AdminDesignPage が import/reimport 後にツリーをセットし、
 * DesignLayout の LayerPanel と Canvas が読み取る。
 */
import { create } from 'zustand'
import { buildRenderTree } from '../canvas/buildRenderTree'
import type { RenderNode } from '../canvas/types'
import type { Node, Attribute, Link } from '../../../domain/entities'

type GuiTreeState = {
  /** 現在ロードされている GUI の id（null は未ロード） */
  guiId: string | null
  /** buildRenderTree の戻り値（ページが roots） */
  roots: RenderNode[]
  /** ページノードの id（再取り込みボタン用） */
  pageNodeId: string | null
  /** GUI に属する状態遷移リンク */
  links: Link[]
  /** リンクの属性（link_id が設定されているもの） */
  linkAttributes: Attribute[]

  /**
   * 取り込み / 再取り込み / getTree 後にツリーをセットする。
   * nodes + attributes から RenderNode[] を組み立てる。
   */
  setTree(guiId: string, nodes: Node[], attributes: Attribute[], links?: Link[]): void

  /** GUI 切り替え時にリセットする */
  clearTree(): void
}

export const useGuiTreeStore = create<GuiTreeState>((set) => ({
  guiId: null,
  roots: [],
  pageNodeId: null,
  links: [],
  linkAttributes: [],

  setTree(guiId, nodes, attributes, links = []) {
    const roots = buildRenderTree(nodes, attributes)
    const pageNodeId = roots[0]?.id ?? null
    const linkAttributes = attributes.filter(a => a.link_id !== null)
    set({ guiId, roots, pageNodeId, links, linkAttributes })
  },

  clearTree() {
    set({ guiId: null, roots: [], pageNodeId: null, links: [], linkAttributes: [] })
  },
}))
