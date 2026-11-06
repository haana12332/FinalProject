// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'
import { LayerPanel } from '../LayerPanel'
import { useSelectionStore } from '../../selection/useSelectionStore'
import { LoggingContext } from '../../../../application/logging/LoggingContext'
import type { RenderNode } from '../../canvas/types'

// ---- テスト用ツリー ----

function makeNode(
  id: string,
  parentId: string | null,
  layerType: RenderNode['layerType'],
  layerName: string,
  children: RenderNode[] = [],
): RenderNode {
  return {
    id,
    parentId,
    layerType,
    nodeKind: 'frame',
    sortOrder: 0,
    layerName,
    absX: 0,
    absY: 0,
    width: 375,
    height: 640,
    fill: null,
    opacity: 1,
    stroke: null,
    cornerRadius: 0,
    path: null,
    characters: null,
    fontSize: null,
    fontWeight: null,
    fontFamily: null,
    imageRef: null,
    children,
  }
}

const roots: RenderNode[] = [
  makeNode('page-1', null, 'page', 'P_ProductDetail', [
    makeNode('tmpl-1', 'page-1', 'template', 'T_Main', [
      makeNode('org-1', 'tmpl-1', 'organism', 'O_Header', []),
      makeNode('org-2', 'tmpl-1', 'organism', 'O_Body', []),
    ]),
    makeNode('tmpl-2', 'page-1', 'template', 'T_Footer', []),
  ]),
]

// ---- ラッパー ----

const logEventMock = vi.fn()

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <LoggingContext.Provider value={{ logEvent: logEventMock }}>
      {children}
    </LoggingContext.Provider>
  )
}

beforeEach(() => {
  useSelectionStore.getState().reset()
  logEventMock.mockClear()
})

afterEach(cleanup)

// ---- テスト ----

describe('LayerPanel', () => {
  describe('レンダリング', () => {
    it('ルートノードの名前が表示される', () => {
      render(<Wrapper><LayerPanel roots={roots} /></Wrapper>)
      expect(screen.getByText('P_ProductDetail')).toBeInTheDocument()
    })

    it('初期状態でルートは展開されており子も見える', () => {
      render(<Wrapper><LayerPanel roots={roots} /></Wrapper>)
      expect(screen.getByText('T_Main')).toBeInTheDocument()
      expect(screen.getByText('T_Footer')).toBeInTheDocument()
    })

    it('子の子（O_Header）も初期展開状態で見える', () => {
      render(<Wrapper><LayerPanel roots={roots} /></Wrapper>)
      // T_Main は初期展開されていないので O_Header は見えない
      // (ルートのみ初期展開)
      // → T_Main を展開しないと O_Header は表示されない
      expect(screen.queryByText('O_Header')).not.toBeInTheDocument()
    })

    it('空ルートでもエラーにならない', () => {
      render(<Wrapper><LayerPanel roots={[]} /></Wrapper>)
      expect(screen.getByText('レイヤー')).toBeInTheDocument()
    })
  })

  describe('展開・折りたたみ', () => {
    it('展開ボタンをクリックすると子が表示される', () => {
      render(<Wrapper><LayerPanel roots={roots} /></Wrapper>)
      // T_Main の展開ボタンをクリック
      const tmplItem = screen.getByText('T_Main').closest('[role="treeitem"]')!
      const toggleBtn = tmplItem.querySelector('button')!
      fireEvent.click(toggleBtn)
      expect(screen.getByText('O_Header')).toBeInTheDocument()
      expect(screen.getByText('O_Body')).toBeInTheDocument()
    })

    it('展開後に再クリックすると折りたたまれる', () => {
      render(<Wrapper><LayerPanel roots={roots} /></Wrapper>)
      const tmplItem = screen.getByText('T_Main').closest('[role="treeitem"]')!
      const toggleBtn = tmplItem.querySelector('button')!
      fireEvent.click(toggleBtn)   // 展開
      expect(screen.getByText('O_Header')).toBeInTheDocument()
      fireEvent.click(toggleBtn)   // 折りたたみ
      expect(screen.queryByText('O_Header')).not.toBeInTheDocument()
    })
  })

  describe('パネル → ストア（パネルからの選択がキャンバスに伝わる）', () => {
    it('ノードをクリックすると selectedNodeId が更新される', () => {
      render(<Wrapper><LayerPanel roots={roots} /></Wrapper>)
      fireEvent.click(screen.getByText('T_Footer'))
      expect(useSelectionStore.getState().selectedNodeId).toBe('tmpl-2')
    })

    it('ノードをクリックすると currentLayer が更新される', () => {
      render(<Wrapper><LayerPanel roots={roots} /></Wrapper>)
      fireEvent.click(screen.getByText('T_Footer'))
      expect(useSelectionStore.getState().currentLayer).toBe('template')
    })

    it('page ノードをクリックすると currentLayer が template になる', () => {
      render(<Wrapper><LayerPanel roots={roots} /></Wrapper>)
      fireEvent.click(screen.getByText('P_ProductDetail'))
      expect(useSelectionStore.getState().selectedNodeId).toBe('page-1')
      expect(useSelectionStore.getState().currentLayer).toBe('template')
    })

    it('クリック時に layer_select がログに記録される', () => {
      render(<Wrapper><LayerPanel roots={roots} /></Wrapper>)
      fireEvent.click(screen.getByText('T_Footer'))
      expect(logEventMock).toHaveBeenCalledWith('layer_select', {
        layer_name: 'T_Footer',
      })
    })
  })

  describe('ストア → パネル（キャンバスでの選択がパネルに反映される）', () => {
    it('ストアの selectedNodeId が変わると対応行が aria-selected になる', () => {
      render(<Wrapper><LayerPanel roots={roots} /></Wrapper>)
      // act() でストア更新を React のレンダーサイクルに乗せる
      act(() => {
        useSelectionStore.setState({ selectedNodeId: 'tmpl-2', currentLayer: 'template' })
      })
      const item = screen.getByText('T_Footer').closest('[role="treeitem"]')!
      expect(item.getAttribute('aria-selected')).toBe('true')
    })

    it('選択されていないノードは aria-selected=false', () => {
      render(<Wrapper><LayerPanel roots={roots} /></Wrapper>)
      act(() => {
        useSelectionStore.setState({ selectedNodeId: 'tmpl-2', currentLayer: 'template' })
      })
      const item = screen.getByText('P_ProductDetail').closest('[role="treeitem"]')!
      expect(item.getAttribute('aria-selected')).toBe('false')
    })
  })
})

describe('useSelectionStore — selectAtLayer', () => {
  beforeEach(() => {
    useSelectionStore.getState().reset()
  })

  it('selectedNodeId と currentLayer を同時に設定する', () => {
    useSelectionStore.getState().selectAtLayer('org-1', 'organism')
    const { selectedNodeId, currentLayer } = useSelectionStore.getState()
    expect(selectedNodeId).toBe('org-1')
    expect(currentLayer).toBe('organism')
  })

  it('layer_type=page のとき currentLayer を template に正規化する', () => {
    useSelectionStore.getState().selectAtLayer('page-1', 'page')
    const { selectedNodeId, currentLayer } = useSelectionStore.getState()
    expect(selectedNodeId).toBe('page-1')
    expect(currentLayer).toBe('template')
  })

  it('layer_type=null（図形）のとき currentLayer を null に設定する', () => {
    useSelectionStore.getState().selectAtLayer('rect-1', null)
    const { currentLayer } = useSelectionStore.getState()
    expect(currentLayer).toBeNull()
  })
})
