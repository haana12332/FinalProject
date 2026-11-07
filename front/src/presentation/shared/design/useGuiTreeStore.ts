/**
 * 現在表示中の GUI ツリーを保持する Zustand ストア
 *
 * AdminDesignPage が import/reimport 後にツリーをセットし、
 * DesignLayout の LayerPanel と Canvas が読み取る。
 */
import { create } from 'zustand'
import { buildRenderTree } from '../canvas/buildRenderTree'
import type { RenderNode } from '../canvas/types'
import type { Node, Attribute } from '../../../domain/entities'

type GuiTreeState = {
  /** 現在ロードされている GUI の id（null は未ロード） */
  guiId: string | null
  /** buildRenderTree の戻り値（ページが roots） */
  roots: RenderNode[]
  /** ページノードの id（再取り込みボタン用） */
  pageNodeId: string | null

  /**
   * 取り込み / 再取り込み後にツリーをセットする。
   * nodes + attributes から RenderNode[] を組み立てる。
   */
  setTree(guiId: string, nodes: Node[], attributes: Attribute[]): void

  /** GUI 切り替え時にリセットする */
  clearTree(): void
}

export const useGuiTreeStore = create<GuiTreeState>((set) => ({
  guiId: null,
  roots: [],
  pageNodeId: null,

  setTree(guiId, nodes, attributes) {
    const roots = buildRenderTree(nodes, attributes)
    // ページノードは roots[0]（SVG 仕様上かならず 1 件）
    const pageNodeId = roots[0]?.id ?? null
    set({ guiId, roots, pageNodeId })
  },

  clearTree() {
    set({ guiId: null, roots: [], pageNodeId: null })
  },
}))
