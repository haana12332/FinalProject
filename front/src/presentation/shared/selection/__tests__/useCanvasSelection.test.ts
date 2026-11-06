// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { useCanvasSelection } from '../useCanvasSelection'
import { useSelectionStore } from '../useSelectionStore'
import { LoggingContext } from '../../../../application/logging/LoggingContext'
import type { RenderNode } from '../../canvas/types'

// ---- テスト用ツリー ----
// page → template → organism → molecule → atom → rect(shape)

function makeRenderNode(
  id: string,
  parentId: string | null,
  layerType: RenderNode['layerType'],
): RenderNode {
  return {
    id,
    parentId,
    layerType,
    nodeKind: 'rectangle',
    sortOrder: 0,
    layerName: id,
    absX: 0,
    absY: 0,
    width: 100,
    height: 100,
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
    children: [],
  }
}

const flatMap = new Map<string, RenderNode>([
  ['page-1',  makeRenderNode('page-1',  null,       'page')],
  ['tmpl-1',  makeRenderNode('tmpl-1',  'page-1',   'template')],
  ['org-1',   makeRenderNode('org-1',   'tmpl-1',   'organism')],
  ['mol-1',   makeRenderNode('mol-1',   'org-1',    'molecule')],
  ['atom-1',  makeRenderNode('atom-1',  'mol-1',    'atom')],
  ['rect-1',  makeRenderNode('rect-1',  'atom-1',   null)],
  ['tmpl-2',  makeRenderNode('tmpl-2',  'page-1',   'template')],
])

// ---- ラッパー ----

const logEventMock = vi.fn()
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    LoggingContext.Provider,
    { value: { logEvent: logEventMock } },
    children,
  )

beforeEach(() => {
  useSelectionStore.getState().reset()
  logEventMock.mockClear()
})

// ---- テスト ----

describe('useCanvasSelection', () => {
  describe('クリック: 同じ層のノードを選択', () => {
    it('template 層でテンプレートノードをクリック → 選択', () => {
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeClick('tmpl-1') })
      expect(result.current.selectedNodeId).toBe('tmpl-1')
      expect(result.current.currentLayer).toBe('template')
    })

    it('organism 層で孫ノード（rect-1）をクリック → 祖先の organism を選択', () => {
      useSelectionStore.setState({ currentLayer: 'organism', selectedNodeId: null })
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeClick('rect-1') })
      expect(result.current.selectedNodeId).toBe('org-1')
    })

    it('同じノードを再クリックしても変化しない', () => {
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeClick('tmpl-1') })
      logEventMock.mockClear()
      act(() => { result.current.handleNodeClick('tmpl-1') })
      // 同じノードなので select は呼ばれない
      expect(logEventMock).not.toHaveBeenCalled()
    })

    it('選択時に object_select がログに記録される', () => {
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeClick('tmpl-1') })
      expect(logEventMock).toHaveBeenCalledWith(
        'object_select',
        { layer_type: 'template' },
      )
    })
  })

  describe('空白クリック: 選択解除', () => {
    it('nodeId=null でクリック → 選択解除', () => {
      useSelectionStore.setState({ selectedNodeId: 'tmpl-1', currentLayer: 'template' })
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeClick(null) })
      expect(result.current.selectedNodeId).toBeNull()
    })

    it('選択解除時に object_deselect がログに記録される', () => {
      useSelectionStore.setState({ selectedNodeId: 'tmpl-1', currentLayer: 'template' })
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeClick(null) })
      expect(logEventMock).toHaveBeenCalledWith('object_deselect', {})
    })

    it('何も選択されていない状態で空白クリック → ログなし', () => {
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeClick(null) })
      expect(logEventMock).not.toHaveBeenCalled()
    })
  })

  describe('層外クリック: 1 層上へ', () => {
    it('organism 層で template ノードをクリック → drillUp', () => {
      useSelectionStore.setState({ currentLayer: 'organism', selectedNodeId: null })
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      // tmpl-1 は organism 層にいるときの "層外"（template 層）
      act(() => { result.current.handleNodeClick('tmpl-1') })
      expect(result.current.currentLayer).toBe('template')
    })

    it('drillUp 時に layer_change がログに記録される', () => {
      useSelectionStore.setState({ currentLayer: 'organism', selectedNodeId: null })
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeClick('tmpl-1') })
      expect(logEventMock).toHaveBeenCalledWith('layer_change', {
        from: 'organism',
        to: 'template',
      })
    })

    it('template 層（最上層）では drillUp しない → 選択解除', () => {
      useSelectionStore.setState({ currentLayer: 'template', selectedNodeId: 'tmpl-1' })
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      // page-1 は template 層にはない
      act(() => { result.current.handleNodeClick('page-1') })
      expect(result.current.currentLayer).toBe('template')
      expect(result.current.selectedNodeId).toBeNull()
      expect(logEventMock).toHaveBeenCalledWith('object_deselect', {})
    })
  })

  describe('ダブルクリック: 1 層下へ', () => {
    it('選択済みノードのダブルクリック → drillDown', () => {
      useSelectionStore.setState({ selectedNodeId: 'tmpl-1', currentLayer: 'template' })
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeDoubleClick('tmpl-1') })
      expect(result.current.currentLayer).toBe('organism')
      expect(result.current.selectedNodeId).toBeNull()
    })

    it('選択済みノードの子孫をダブルクリック → drillDown', () => {
      useSelectionStore.setState({ selectedNodeId: 'tmpl-1', currentLayer: 'template' })
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeDoubleClick('rect-1') })
      expect(result.current.currentLayer).toBe('organism')
    })

    it('drillDown 時に layer_change がログに記録される', () => {
      useSelectionStore.setState({ selectedNodeId: 'tmpl-1', currentLayer: 'template' })
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeDoubleClick('tmpl-1') })
      expect(logEventMock).toHaveBeenCalledWith('layer_change', {
        from: 'template',
        to: 'organism',
      })
    })

    it('選択外のノードをダブルクリックしても何もしない', () => {
      useSelectionStore.setState({ selectedNodeId: 'tmpl-1', currentLayer: 'template' })
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeDoubleClick('tmpl-2') })
      // drillDown しない
      expect(result.current.currentLayer).toBe('template')
      expect(logEventMock).not.toHaveBeenCalled()
    })

    it('何も選択されていない状態でダブルクリック → 何もしない', () => {
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeDoubleClick('tmpl-1') })
      expect(result.current.currentLayer).toBe('template')
      expect(logEventMock).not.toHaveBeenCalled()
    })

    it('最下層（null）ではドリルダウンできない', () => {
      useSelectionStore.setState({ selectedNodeId: 'rect-1', currentLayer: null })
      const { result } = renderHook(() => useCanvasSelection(flatMap), { wrapper })
      act(() => { result.current.handleNodeDoubleClick('rect-1') })
      expect(result.current.currentLayer).toBeNull()
      expect(logEventMock).not.toHaveBeenCalled()
    })
  })
})
