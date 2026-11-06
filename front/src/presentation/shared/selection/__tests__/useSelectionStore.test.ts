import { describe, it, expect, beforeEach } from 'vitest'
import { useSelectionStore, LAYER_DRILL_ORDER } from '../useSelectionStore'

// Zustand ストアはモジュールレベルのシングルトン。
// テスト間でリセットする。
function getStore() {
  return useSelectionStore.getState()
}

beforeEach(() => {
  getStore().reset()
})

describe('初期状態', () => {
  it('selectedNodeId = null, currentLayer = template', () => {
    const { selectedNodeId, currentLayer } = getStore()
    expect(selectedNodeId).toBeNull()
    expect(currentLayer).toBe('template')
  })
})

describe('select', () => {
  it('selectedNodeId をセットする', () => {
    getStore().select('node-1')
    expect(getStore().selectedNodeId).toBe('node-1')
  })

  it('currentLayer は変化しない', () => {
    getStore().select('node-1')
    expect(getStore().currentLayer).toBe('template')
  })
})

describe('deselect', () => {
  it('selectedNodeId をクリアする', () => {
    getStore().select('node-1')
    getStore().deselect()
    expect(getStore().selectedNodeId).toBeNull()
  })

  it('currentLayer は変化しない', () => {
    getStore().deselect()
    expect(getStore().currentLayer).toBe('template')
  })
})

describe('drillDown', () => {
  it('LAYER_DRILL_ORDER の順に層を深くする', () => {
    for (let i = 0; i < LAYER_DRILL_ORDER.length - 1; i++) {
      useSelectionStore.setState({ currentLayer: LAYER_DRILL_ORDER[i] })
      getStore().drillDown()
      expect(getStore().currentLayer).toBe(LAYER_DRILL_ORDER[i + 1])
    }
  })

  it('最下層（null）ではドリルダウンできない', () => {
    useSelectionStore.setState({ currentLayer: null })
    getStore().drillDown()
    expect(getStore().currentLayer).toBeNull()
  })

  it('selectedNodeId をクリアする', () => {
    getStore().select('node-1')
    getStore().drillDown()
    expect(getStore().selectedNodeId).toBeNull()
  })
})

describe('drillUp', () => {
  it('LAYER_DRILL_ORDER の逆順に層を浅くする', () => {
    for (let i = LAYER_DRILL_ORDER.length - 1; i > 0; i--) {
      useSelectionStore.setState({ currentLayer: LAYER_DRILL_ORDER[i] })
      getStore().drillUp()
      expect(getStore().currentLayer).toBe(LAYER_DRILL_ORDER[i - 1])
    }
  })

  it('最上層（template）ではドリルアップできない', () => {
    useSelectionStore.setState({ currentLayer: 'template' })
    getStore().drillUp()
    expect(getStore().currentLayer).toBe('template')
  })

  it('selectedNodeId をクリアする', () => {
    useSelectionStore.setState({ currentLayer: 'organism' })
    getStore().select('node-1')
    getStore().drillUp()
    expect(getStore().selectedNodeId).toBeNull()
  })
})

describe('reset', () => {
  it('初期状態に戻す', () => {
    useSelectionStore.setState({ selectedNodeId: 'x', currentLayer: null })
    getStore().reset()
    expect(getStore().selectedNodeId).toBeNull()
    expect(getStore().currentLayer).toBe('template')
  })
})
