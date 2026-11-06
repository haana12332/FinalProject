import { useState, useCallback, memo } from 'react'
import { useSelectionStore } from '../selection/useSelectionStore'
import { useLogEvent } from '../../../application/logging/useLogEvent'
import type { RenderNode } from '../canvas/types'
import type { NodeKind } from '../../../domain'
import styles from './LayerPanel.module.css'

// ---- アイコン ----

type IconInfo = { letter: string; className: string }

function getIconInfo(layerType: RenderNode['layerType'], nodeKind: NodeKind): IconInfo {
  switch (layerType) {
    case 'page':     return { letter: 'P', className: styles.iconPage }
    case 'template': return { letter: 'T', className: styles.iconTemplate }
    case 'organism': return { letter: 'O', className: styles.iconOrganism }
    case 'molecule': return { letter: 'M', className: styles.iconMolecule }
    case 'atom':     return { letter: 'A', className: styles.iconAtom }
    default: {
      // 図形（layer_type = null）
      const letter = nodeKind === 'text' ? 'T'
        : nodeKind === 'image'   ? 'I'
        : nodeKind === 'ellipse' ? 'E'
        : nodeKind === 'vector'  ? 'V'
        : '□'
      return { letter, className: styles.iconShape }
    }
  }
}

// ---- ツリー行 ----

type TreeNodeProps = {
  node: RenderNode
  depth: number
  expandedIds: Set<string>
  onToggle: (id: string) => void
}

const TreeNode = memo(function TreeNode({
  node,
  depth,
  expandedIds,
  onToggle,
}: TreeNodeProps) {
  const selectedNodeId = useSelectionStore(s => s.selectedNodeId)
  const selectAtLayer  = useSelectionStore(s => s.selectAtLayer)
  const { logEvent }   = useLogEvent()

  const isExpanded  = expandedIds.has(node.id)
  const hasChildren = node.children.length > 0
  const isSelected  = selectedNodeId === node.id
  const { letter, className: iconClass } = getIconInfo(node.layerType, node.nodeKind)

  const handleClick = useCallback(() => {
    selectAtLayer(node.id, node.layerType)
    logEvent('layer_select', { layer_name: node.layerName })
  }, [node.id, node.layerType, node.layerName, selectAtLayer, logEvent])

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggle(node.id)
    },
    [node.id, onToggle],
  )

  return (
    <>
      <div
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-level={depth + 1}
        className={`${styles.item} ${isSelected ? styles.selected : ''}`}
        style={{ paddingLeft: 6 + depth * 14 }}
        onClick={handleClick}
        data-node-id={node.id}
      >
        {hasChildren ? (
          <button
            className={styles.toggle}
            onClick={handleToggle}
            aria-label={isExpanded ? '折りたたむ' : '展開する'}
            tabIndex={-1}
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className={styles.leafSpacer} aria-hidden />
        )}

        <span className={`${styles.icon} ${iconClass}`} aria-hidden>
          {letter}
        </span>

        <span className={styles.name} title={node.layerName}>
          {node.layerName}
        </span>
      </div>

      {isExpanded && hasChildren &&
        node.children.map(child => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            expandedIds={expandedIds}
            onToggle={onToggle}
          />
        ))}
    </>
  )
})

// ---- パネル本体 ----

type Props = {
  /** buildRenderTree の戻り値（ページ単位のルートノード配列） */
  roots: RenderNode[]
}

/**
 * Figma 風レイヤーパネル。
 *
 * - 接頭辞（P/T/O/M/A）アイコン付きの階層ツリーを表示
 * - 展開・折りたたみ可能
 * - useSelectionStore を通じてキャンバスと双方向に連動
 *   - パネルでクリック → selectedNodeId が更新され Canvas も反応
 *   - Canvas で選択 → selectedNodeId が変わり対応行がハイライト
 */
export function LayerPanel({ roots }: Props) {
  // 初期状態: ルートノード（ページ）を展開
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(roots.map(r => r.id)),
  )

  const onToggle = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <div className={styles.panel}>
      <div className={styles.header}>レイヤー</div>
      <div className={styles.tree} role="tree" aria-label="レイヤーパネル">
        {roots.map(root => (
          <TreeNode
            key={root.id}
            node={root}
            depth={0}
            expandedIds={expandedIds}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
