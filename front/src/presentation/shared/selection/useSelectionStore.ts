import { create } from 'zustand'
import type { LayerType } from '../../../domain'

/**
 * Atomic Design の層を「浅い → 深い」順に並べたドリル順。
 * ページ（page）自体はルートとして固定されるため含めない。
 * null は shapes（layer_type が null の図形）レベルを表す。
 */
export const LAYER_DRILL_ORDER: (LayerType | null)[] = [
  'template',
  'organism',
  'molecule',
  'atom',
  null,
]

export type SelectionState = {
  /** 現在選択中のノード ID（null = 選択なし） */
  selectedNodeId: string | null
  /**
   * 現在ブラウズ中の Atomic Design 層。
   * - 'template': テンプレート層を直接選択できる
   * - 'organism': オーガニズム層を直接選択できる
   * - ... 以下同様 ...
   * - null: 図形（layer_type=null）を直接選択できる
   */
  currentLayer: LayerType | null
}

type SelectionActions = {
  /** nodeId のノードを選択する */
  select: (nodeId: string) => void
  /** 選択を解除する（currentLayer は変えない） */
  deselect: () => void
  /**
   * 1層下へドリルダウンする。
   * selectedNodeId をクリアして次の層へ移動。
   */
  drillDown: () => void
  /**
   * 1層上へドリルアップする。
   * selectedNodeId をクリアして前の層へ移動。
   */
  drillUp: () => void
  /** 初期状態（template 層、選択なし）に戻す */
  reset: () => void
}

const INITIAL_STATE: SelectionState = {
  selectedNodeId: null,
  currentLayer: 'template',
}

export const useSelectionStore = create<SelectionState & SelectionActions>(
  (set, get) => ({
    ...INITIAL_STATE,

    select: (nodeId) => set({ selectedNodeId: nodeId }),

    deselect: () => set({ selectedNodeId: null }),

    drillDown: () => {
      const idx = LAYER_DRILL_ORDER.indexOf(get().currentLayer)
      if (idx < 0 || idx >= LAYER_DRILL_ORDER.length - 1) return
      set({ currentLayer: LAYER_DRILL_ORDER[idx + 1], selectedNodeId: null })
    },

    drillUp: () => {
      const idx = LAYER_DRILL_ORDER.indexOf(get().currentLayer)
      if (idx <= 0) return
      set({ currentLayer: LAYER_DRILL_ORDER[idx - 1], selectedNodeId: null })
    },

    reset: () => set(INITIAL_STATE),
  }),
)
