import { useCallback } from 'react'
import { useSelectionStore, LAYER_DRILL_ORDER } from './useSelectionStore'
import { useLogEvent } from '../../../application/logging/useLogEvent'
import type { RenderNode } from '../canvas/types'

/**
 * Canvas のクリック・ダブルクリックイベントと選択ストアをつなぐフック。
 *
 * Canvas の onNodeClick / onNodeDoubleClick に返り値のハンドラを渡すことで
 * 選択状態と Atomic Design 層ナビゲーションを実現する。
 *
 * 動作仕様:
 * - クリック         → 同じ層のノードを選択
 * - ダブルクリック   → 1 層下へドリルダウン
 * - 層外クリック     → 1 層上へドリルアップ
 * - 空白クリック     → 選択解除
 *
 * ログイベント: object_select / object_deselect / layer_change
 */
export function useCanvasSelection(flatMap: Map<string, RenderNode>) {
  const { selectedNodeId, currentLayer, select, deselect, drillDown, drillUp } =
    useSelectionStore()
  const { logEvent } = useLogEvent()

  /**
   * nodeId から辿って currentLayer に一致するノード（自身 or 祖先）を返す。
   * どこにも一致しない場合は null。
   */
  const findNodeAtCurrentLayer = useCallback(
    (nodeId: string): string | null => {
      let id: string | null = nodeId
      while (id !== null) {
        const node = flatMap.get(id)
        if (!node) return null
        if (node.layerType === currentLayer) return id
        id = node.parentId
      }
      return null
    },
    [flatMap, currentLayer],
  )

  /**
   * Canvas の onNodeClick に渡すハンドラ。
   * nodeId: hitTest が返したノード ID（背景クリック = null）
   */
  const handleNodeClick = useCallback(
    (nodeId: string | null) => {
      // --- 空白クリック ---
      if (nodeId === null) {
        if (selectedNodeId !== null) {
          deselect()
          logEvent('object_deselect', {})
        }
        return
      }

      const nodeAtLayer = findNodeAtCurrentLayer(nodeId)

      if (nodeAtLayer !== null) {
        // --- 同じ層のノードを選択 ---
        if (nodeAtLayer !== selectedNodeId) {
          select(nodeAtLayer)
          const node = flatMap.get(nodeAtLayer)
          logEvent('object_select', { layer_type: node?.layerType ?? null })
        }
      } else {
        // --- 現在の層に該当ノードなし → 1 層上へ ---
        const idx = LAYER_DRILL_ORDER.indexOf(currentLayer)
        if (idx > 0) {
          drillUp()
          logEvent('layer_change', {
            from: currentLayer,
            to: LAYER_DRILL_ORDER[idx - 1],
          })
        } else {
          // 最上位（template 層）では上に行けない → 選択解除
          if (selectedNodeId !== null) {
            deselect()
            logEvent('object_deselect', {})
          }
        }
      }
    },
    [
      selectedNodeId,
      currentLayer,
      flatMap,
      select,
      deselect,
      drillUp,
      findNodeAtCurrentLayer,
      logEvent,
    ],
  )

  /**
   * Canvas の onNodeDoubleClick に渡すハンドラ。
   * nodeId: hitTest が返したノード ID（背景ダブルクリック = null）
   */
  const handleNodeDoubleClick = useCallback(
    (nodeId: string | null) => {
      // 何も選択されていない、または背景をダブルクリックした場合は無視
      if (nodeId === null || selectedNodeId === null) return

      // ダブルクリックしたノードが selectedNodeId の子孫（または自身）か確認
      let id: string | null = nodeId
      let isInsideSelected = false
      while (id !== null) {
        if (id === selectedNodeId) {
          isInsideSelected = true
          break
        }
        id = flatMap.get(id)?.parentId ?? null
      }
      if (!isInsideSelected) return

      // 1 層下へドリルダウン可能か確認
      const idx = LAYER_DRILL_ORDER.indexOf(currentLayer)
      if (idx < 0 || idx >= LAYER_DRILL_ORDER.length - 1) return

      drillDown()
      logEvent('layer_change', {
        from: currentLayer,
        to: LAYER_DRILL_ORDER[idx + 1],
      })
    },
    [selectedNodeId, currentLayer, flatMap, drillDown, logEvent],
  )

  return {
    selectedNodeId,
    currentLayer,
    handleNodeClick,
    handleNodeDoubleClick,
  }
}
