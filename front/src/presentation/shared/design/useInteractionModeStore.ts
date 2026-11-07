/**
 * インタラクションモードの Zustand ストア（Issue #25）
 *
 * 'select'  → 通常の選択モード（ノード選択・レイヤーパネル操作）
 * 'preview' → プロトタイププレビューモード（クリックで遷移・ホバーで状態切り替え）
 */
import { create } from 'zustand'

export type InteractionMode = 'select' | 'preview'

type InteractionModeState = {
  mode: InteractionMode
  setMode(mode: InteractionMode): void
  toggle(): void
}

export const useInteractionModeStore = create<InteractionModeState>((set) => ({
  mode: 'select',

  setMode(mode) {
    set({ mode })
  },

  toggle() {
    set(s => ({ mode: s.mode === 'select' ? 'preview' : 'select' }))
  },
}))
