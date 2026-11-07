/**
 * リンク作成 UI の状態機械（Issue #24）
 *
 * idle → pick-source（起点を選択中）→ pick-target（終点を選択中）→ idle
 */
import { create } from 'zustand'

export type LinkCreationMode = 'idle' | 'pick-source' | 'pick-target'

type LinkCreationState = {
  mode: LinkCreationMode
  sourceNodeId: string | null
  sourceNodeName: string

  startCreation(): void
  setSource(nodeId: string, nodeName: string): void
  cancel(): void
}

export const useLinkCreationStore = create<LinkCreationState>((set) => ({
  mode: 'idle',
  sourceNodeId: null,
  sourceNodeName: '',

  startCreation() {
    set({ mode: 'pick-source', sourceNodeId: null, sourceNodeName: '' })
  },

  setSource(nodeId, nodeName) {
    set({ mode: 'pick-target', sourceNodeId: nodeId, sourceNodeName: nodeName })
  },

  cancel() {
    set({ mode: 'idle', sourceNodeId: null, sourceNodeName: '' })
  },
}))
