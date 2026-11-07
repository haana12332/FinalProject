/**
 * デザイン閲覧ワークスペース（Issue #20 / #24）
 *
 * - 左: サイドバー（researcher: ナビ + 取り込みボタン + リンク作成 + LayerPanel）
 *       （participant: LayerPanel のみ）
 * - 中: ページ切り替えタブ + Canvas（researcher は矢印も表示）
 * - 右: オプション右パネルスロット（#26/#27 で中身を追加）
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { NavLink, useParams } from 'react-router'
import { paths } from '../../../routes'
import { useGuiTreeStore } from '../../shared/design/useGuiTreeStore'
import { useLinkCreationStore } from '../../shared/design/useLinkCreationStore'
import { useInteractionModeStore } from '../../shared/design/useInteractionModeStore'
import { useSelectionStore } from '../../shared/selection/useSelectionStore'
import { useCanvasSelection } from '../../shared/selection/useCanvasSelection'
import { useRepositories } from '../../providers/useRepositories'
import { useLogEvent } from '../../../application/logging/useLogEvent'
import { parseSvg } from '../../../application/import/parseSvg'
import { LayerPanel } from '../../shared/layerPanel/LayerPanel'
import { Canvas } from '../../shared/canvas/Canvas'
import { flattenNodes } from '../../shared/canvas/buildRenderTree'
import type { Link } from '../../../domain/entities'
import styles from './DesignWorkspace.module.css'

export type DesignMode = 'researcher' | 'participant'

type Props = {
  mode: DesignMode
  editPanel?: React.ReactNode
  reasonPanel?: React.ReactNode
}

type TriggerValue = 'click' | 'hover'

export function DesignWorkspace({ mode, editPanel, reasonPanel }: Props) {
  const { project_id, gui_id } = useParams<{ project_id?: string; gui_id?: string }>()

  const { guiTree: repo, link: linkRepo } = useRepositories()
  const { logEvent } = useLogEvent()

  // ---- ツリーストア ----
  const roots          = useGuiTreeStore(s => s.roots)
  const pageNodeId     = useGuiTreeStore(s => s.pageNodeId)
  const links          = useGuiTreeStore(s => s.links)
  const linkAttributes = useGuiTreeStore(s => s.linkAttributes)
  const setTree        = useGuiTreeStore(s => s.setTree)
  const clearTree      = useGuiTreeStore(s => s.clearTree)

  // ---- 選択ストア（highlights 用） ----
  const selectedNodeId = useSelectionStore(s => s.selectedNodeId)

  // ---- インタラクションモードストア（#25） ----
  const interactionMode = useInteractionModeStore(s => s.mode)
  const setInteractionMode = useInteractionModeStore(s => s.setMode)

  // ---- リンク作成ストア ----
  const lcMode         = useLinkCreationStore(s => s.mode)
  const lcSourceId     = useLinkCreationStore(s => s.sourceNodeId)
  const lcSourceName   = useLinkCreationStore(s => s.sourceNodeName)
  const startCreation  = useLinkCreationStore(s => s.startCreation)
  const setLcSource    = useLinkCreationStore(s => s.setSource)
  const cancelCreation = useLinkCreationStore(s => s.cancel)

  // ---- ページ切り替え ----
  const [selectedPageIdx, setSelectedPageIdx] = useState(0)

  // ---- インポート状態 ----
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading]         = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  // ---- リンク作成フォーム状態 ----
  const [linkTargetId,   setLinkTargetId]   = useState<string | null>(null)
  const [linkTargetName, setLinkTargetName] = useState('')
  const [linkName,       setLinkName]       = useState('')
  const [linkTrigger,    setLinkTrigger]    = useState<TriggerValue>('click')
  const [linkSaving,     setLinkSaving]     = useState(false)

  // ---- 選択中のリンク（編集・削除用） ----
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)
  const selectedLink = useMemo(
    () => links.find(l => l.id === selectedLinkId) ?? null,
    [links, selectedLinkId],
  )

  // ---- リンク名の編集状態 ----
  const [editLinkName, setEditLinkName] = useState('')

  // ---- プレビューモード: ホバー中のソースノード → ハイライトするターゲット（#25） ----
  const [previewHoverTargetIds, setPreviewHoverTargetIds] = useState<string[]>([])

  // ---- ヘルパー: ツリーを再取得してストアを更新 ----
  const refreshTree = useCallback(async () => {
    if (!gui_id) return
    const tree = await repo.getTree(gui_id)
    if ('code' in tree) {
      setImportError(tree.message)
    } else {
      setTree(tree.gui_id, tree.nodes, tree.attributes, tree.links)
    }
  }, [gui_id, repo, setTree])

  // ---- GUI 切り替え時にツリーをロード（researcher） ----
  useEffect(() => {
    if (mode !== 'researcher' || !gui_id) return
    clearTree()
    setSelectedPageIdx(0)
    setImportError(null)
    setSelectedLinkId(null)
    cancelCreation()
    setLoading(true)
    repo.getTree(gui_id).then(result => {
      if ('code' in result) {
        setImportError(result.message)
      } else if (result.nodes.length > 0) {
        setTree(result.gui_id, result.nodes, result.attributes, result.links)
      }
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gui_id])

  // ---- page_view ログ ----
  const prevPageIdRef = useRef<string | null>(null)
  useEffect(() => {
    const page = roots[selectedPageIdx]
    if (!page || page.id === prevPageIdRef.current) return
    prevPageIdRef.current = page.id
    logEvent('page_view', { page_name: page.layerName })
  }, [selectedPageIdx, roots, logEvent])

  // ---- 選択ストアをリセット（ページ切り替え時） ----
  const reset = useSelectionStore(s => s.reset)
  useEffect(() => {
    reset()
  }, [selectedPageIdx, reset])

  // ---- Canvas 選択ハンドラ ----
  const currentRoot = roots[selectedPageIdx] ?? null
  const flatMap     = currentRoot ? flattenNodes([currentRoot]) : new Map()

  // 全ページのノード → ページインデックスのマップ（プレビューモードのクロスページ遷移用）
  const allPagesFlat = useMemo(() => {
    const map = new Map<string, number>()
    roots.forEach((root, idx) => {
      flattenNodes([root]).forEach((_, nodeId) => map.set(nodeId, idx))
    })
    return map
  }, [roots])
  const { handleNodeClick, handleNodeDoubleClick } = useCanvasSelection(flatMap)

  // ---- ページ名マップ（クロスページリンクのラベル） ----
  const pageNames = useMemo(
    () => new Map(roots.map(r => [r.id, r.layerName])),
    [roots],
  )

  // ---- リンク作成モード中のクリックハンドラ ----
  const handleNodeClickForLinkCreation = useCallback(
    (nodeId: string | null) => {
      if (!nodeId) return
      const node = flatMap.get(nodeId)
      const nodeName = node?.layerName ?? nodeId

      if (lcMode === 'pick-source') {
        setLcSource(nodeId, nodeName)
        return
      }
      if (lcMode === 'pick-target') {
        setLinkTargetId(nodeId)
        setLinkTargetName(nodeName)
        setLinkName(`${lcSourceName} → ${nodeName}`)
        return
      }
    },
    [lcMode, flatMap, lcSourceName, setLcSource],
  )

  // ---- プレビューモード: リンク検索ヘルパー ----
  const findLinksFrom = useCallback(
    (nodeId: string, trigger: string) =>
      links.filter(l => {
        if (l.source_node_id !== nodeId) return false
        const triggerAttr = linkAttributes.find(
          a => a.link_id === l.id && a.attribute_type === 'trigger',
        )
        return triggerAttr?.value === trigger
      }),
    [links, linkAttributes],
  )

  // ---- プレビューモード: クリックで遷移 ----
  const handlePreviewClick = useCallback(
    (nodeId: string | null) => {
      if (!nodeId) return
      const clickLinks = findLinksFrom(nodeId, 'click')
      if (clickLinks.length === 0) return

      const link = clickLinks[0]
      const targetId = link.target_node_id
      const targetPageIdx = allPagesFlat.get(targetId)

      logEvent('transition_fire', {
        link_name: link.name,
        from_node_id: nodeId,
        to_node_id: targetId,
      })

      if (targetPageIdx !== undefined && targetPageIdx !== selectedPageIdx) {
        setSelectedPageIdx(targetPageIdx)
      }
    },
    [findLinksFrom, allPagesFlat, selectedPageIdx, logEvent],
  )

  // ---- プレビューモード: ホバーで状態切り替え ----
  const handlePreviewHover = useCallback(
    (nodeId: string | null) => {
      if (!nodeId) {
        setPreviewHoverTargetIds([])
        return
      }
      const hoverLinks = findLinksFrom(nodeId, 'hover')
      const targetIds = hoverLinks.map(l => l.target_node_id)
      setPreviewHoverTargetIds(targetIds)

      if (hoverLinks.length > 0) {
        const node = flatMap.get(nodeId)
        logEvent('hover', { node_id: nodeId, node_name: node?.layerName ?? nodeId })
      }
    },
    [findLinksFrom, flatMap, logEvent],
  )

  // ---- モード切替（選択 ↔ プレビュー）ハンドラ ----
  const handleToggleMode = useCallback(() => {
    const nextMode = interactionMode === 'select' ? 'preview' : 'select'
    logEvent('mode_change', { from: interactionMode, to: nextMode })
    if (nextMode === 'preview') {
      logEvent('prototype_start', {})
      cancelCreation()
      setSelectedLinkId(null)
    } else {
      logEvent('prototype_stop', {})
      setPreviewHoverTargetIds([])
    }
    setInteractionMode(nextMode)
  }, [interactionMode, setInteractionMode, logEvent, cancelCreation])

  const effectiveOnNodeClick = interactionMode === 'preview'
    ? handlePreviewClick
    : lcMode !== 'idle'
      ? handleNodeClickForLinkCreation
      : handleNodeClick

  // ---- リンク保存 ----
  const handleSaveLink = useCallback(async () => {
    if (!lcSourceId || !linkTargetId || !linkName.trim()) return
    setLinkSaving(true)
    const result = await linkRepo.create({
      source_node_id: lcSourceId,
      target_node_id: linkTargetId,
      name: linkName.trim(),
      attributes: [{ attribute_type: 'trigger', value: linkTrigger }],
    })
    setLinkSaving(false)
    if ('code' in result) {
      setImportError(result.message)
      return
    }
    // リセット
    cancelCreation()
    setLinkTargetId(null)
    setLinkTargetName('')
    setLinkName('')
    setLinkTrigger('click')
    await refreshTree()
  }, [lcSourceId, linkTargetId, linkName, linkTrigger, linkRepo, cancelCreation, refreshTree])

  // ---- リンク名編集保存 ----
  const handleUpdateLink = useCallback(async () => {
    if (!selectedLinkId || !editLinkName.trim()) return
    const result = await linkRepo.update(selectedLinkId, editLinkName.trim())
    if (result && 'code' in result) {
      setImportError(result.message)
      return
    }
    await refreshTree()
  }, [selectedLinkId, editLinkName, linkRepo, refreshTree])

  // ---- リンク削除 ----
  const handleDeleteLink = useCallback(async () => {
    if (!selectedLinkId) return
    const result = await linkRepo.delete(selectedLinkId)
    if (result && 'code' in result) {
      setImportError(result.message)
      return
    }
    setSelectedLinkId(null)
    await refreshTree()
  }, [selectedLinkId, linkRepo, refreshTree])

  // 選択リンクが変わったら編集名をセット
  useEffect(() => {
    setEditLinkName(selectedLink?.name ?? '')
  }, [selectedLink])

  // ---- ページ移動ハンドラ（researcher のみ、Issue #23） ----
  const handlePageDragEnd = useCallback(
    async (pageId: string, newX: number, newY: number) => {
      if (!gui_id) return
      const result = await repo.updatePagePosition(pageId, newX, newY)
      if (result && 'code' in result) {
        setImportError(result.message)
        return
      }
      await refreshTree()
    },
    [gui_id, repo, refreshTree],
  )

  const draggablePageIds = mode === 'researcher' && currentRoot && lcMode === 'idle' && interactionMode === 'select'
    ? new Set([currentRoot.id])
    : undefined

  // ---- インポートハンドラ（researcher のみ） ----
  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !gui_id) return
      e.target.value = ''
      setImportError(null)
      setLoading(true)
      try {
        const svgText = await file.text()
        const parsed  = await parseSvg(svgText)
        if (!parsed.ok) {
          setImportError(parsed.violations.map(v => v.message).join('\n'))
          setLoading(false)
          return
        }
        const result = pageNodeId
          ? await repo.reimportPage(pageNodeId, parsed.payload)
          : await repo.importPage(gui_id, parsed.payload)
        if ('code' in result) {
          setImportError(result.message)
        } else {
          setTree(result.gui_id, result.nodes, result.attributes, result.links)
          setSelectedPageIdx(0)
        }
      } catch (err) {
        setImportError(String(err))
      } finally {
        setLoading(false)
      }
    },
    [gui_id, pageNodeId, repo, setTree],
  )

  // ---- ハイライト（選択ノード + リンク作成の起点 + プレビューホバーターゲット） ----
  const highlights = useMemo(() => {
    const h = []
    if (selectedNodeId) h.push({ nodeId: selectedNodeId, style: 'selection' as const })
    if (lcSourceId) h.push({ nodeId: lcSourceId, style: 'constraint' as const })
    if (linkTargetId) h.push({ nodeId: linkTargetId, style: 'hover' as const })
    for (const id of previewHoverTargetIds) {
      h.push({ nodeId: id, style: 'hover' as const })
    }
    return h
  }, [selectedNodeId, lcSourceId, linkTargetId, previewHoverTargetIds])

  const hasTree  = roots.length > 0
  const rightPanel = mode === 'researcher' ? editPanel : reasonPanel

  // リンク作成中のキャンセルは Escape キーでも
  useEffect(() => {
    if (lcMode === 'idle') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelCreation()
        setLinkTargetId(null)
        setLinkTargetName('')
        setLinkName('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lcMode, cancelCreation])

  return (
    <div className={styles.root}>
      {/* ---- 左サイドバー ---- */}
      <aside className={styles.sidebar}>
        {mode === 'researcher' && (
          <>
            <div className={styles.sidebarHeader}>
              <span className={styles.appName}>研究補助ツール</span>
            </div>
            <nav className={styles.nav}>
              <NavLink to={paths.adminProjects()} className={styles.navItem}>
                ← プロジェクト一覧
              </NavLink>
              {project_id && (
                <NavLink to={paths.adminProject(project_id)} className={styles.navItem}>
                  GUI 一覧
                </NavLink>
              )}
            </nav>

            {/* SVG 取り込み */}
            <div className={styles.importArea}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                style={{ display: 'none' }}
                onChange={handleFileSelected}
              />
              {hasTree ? (
                <button
                  className={styles.reimportBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {loading ? '処理中…' : '再取り込み'}
                </button>
              ) : (
                <button
                  className={styles.importBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {loading ? '読み込み中…' : 'SVG を取り込む'}
                </button>
              )}
            </div>

            {/* リンク作成 UI（Issue #24） */}
            {hasTree && (
              <div className={styles.linkSection}>
                <div className={styles.linkSectionTitle}>状態遷移リンク</div>

                {lcMode === 'idle' && !linkTargetId && (
                  <button
                    className={styles.linkAddBtn}
                    onClick={startCreation}
                  >
                    ＋ リンクを追加
                  </button>
                )}

                {lcMode === 'pick-source' && (
                  <div className={styles.linkHint}>
                    <span>起点ノードをクリック</span>
                    <button className={styles.linkCancelBtn} onClick={cancelCreation}>キャンセル</button>
                  </div>
                )}

                {lcMode === 'pick-target' && !linkTargetId && (
                  <div className={styles.linkHint}>
                    <div className={styles.linkSourceChip}>{lcSourceName}</div>
                    <span>→ 遷移先をクリック</span>
                    <button className={styles.linkCancelBtn} onClick={cancelCreation}>キャンセル</button>
                  </div>
                )}

                {/* 両端が揃ったら保存フォーム */}
                {lcSourceId && linkTargetId && (
                  <div className={styles.linkForm}>
                    <div className={styles.linkFormRow}>
                      <span className={styles.linkSourceChip}>{lcSourceName}</span>
                      <span className={styles.linkArrow}>→</span>
                      <span className={styles.linkTargetChip}>{linkTargetName}</span>
                    </div>
                    <input
                      className={styles.linkNameInput}
                      placeholder="リンク名"
                      value={linkName}
                      onChange={e => setLinkName(e.target.value)}
                    />
                    <select
                      className={styles.linkTriggerSelect}
                      value={linkTrigger}
                      onChange={e => setLinkTrigger(e.target.value as TriggerValue)}
                    >
                      <option value="click">クリック</option>
                      <option value="hover">ホバー</option>
                    </select>
                    <div className={styles.linkFormActions}>
                      <button
                        className={styles.linkSaveBtn}
                        onClick={handleSaveLink}
                        disabled={linkSaving || !linkName.trim()}
                      >
                        {linkSaving ? '保存中…' : '保存'}
                      </button>
                      <button
                        className={styles.linkCancelBtn}
                        onClick={() => {
                          cancelCreation()
                          setLinkTargetId(null)
                          setLinkTargetName('')
                          setLinkName('')
                        }}
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}

                {/* 既存リンク一覧 */}
                {links.length > 0 && (
                  <ul className={styles.linkList}>
                    {links.map((l: Link) => (
                      <li
                        key={l.id}
                        className={`${styles.linkItem} ${l.id === selectedLinkId ? styles.linkItemSelected : ''}`}
                        onClick={() => {
                          setSelectedLinkId(prev => prev === l.id ? null : l.id)
                        }}
                      >
                        {l.name}
                      </li>
                    ))}
                  </ul>
                )}

                {/* 選択中リンクの編集・削除 */}
                {selectedLink && (
                  <div className={styles.linkEditBox}>
                    <input
                      className={styles.linkNameInput}
                      value={editLinkName}
                      onChange={e => setEditLinkName(e.target.value)}
                    />
                    <div className={styles.linkFormActions}>
                      <button
                        className={styles.linkSaveBtn}
                        onClick={handleUpdateLink}
                        disabled={!editLinkName.trim()}
                      >
                        更新
                      </button>
                      <button
                        className={styles.linkDeleteBtn}
                        onClick={handleDeleteLink}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* LayerPanel（両モード） */}
        {hasTree ? (
          <div className={styles.layerPanelArea}>
            <LayerPanel roots={roots} />
          </div>
        ) : (
          <div className={styles.sidebarEmpty}>
            <span className={styles.sidebarEmptyText}>レイヤーなし</span>
          </div>
        )}
      </aside>

      {/* ---- 中央キャンバス領域 ---- */}
      <div className={styles.canvasArea}>
        <div className={styles.canvasToolbar}>
          {roots.length > 1 && (
            <div className={styles.pageSwitcher}>
              {roots.map((root, i) => (
                <button
                  key={root.id}
                  className={`${styles.pageTab} ${i === selectedPageIdx ? styles.pageTabActive : ''}`}
                  onClick={() => setSelectedPageIdx(i)}
                >
                  {root.layerName}
                </button>
              ))}
            </div>
          )}

          {/* モード切替ボタン（#25）: ツリーがある場合のみ表示 */}
          {hasTree && (
            <button
              className={`${styles.modeToggleBtn} ${interactionMode === 'preview' ? styles.modeToggleBtnActive : ''}`}
              onClick={handleToggleMode}
              title={interactionMode === 'select' ? 'プレビューモードに切り替え' : '選択モードに戻る'}
            >
              {interactionMode === 'preview' ? '▶ プレビュー中' : '▶ プレビュー'}
            </button>
          )}
        </div>

        {/* リンク作成モードのオーバーレイバナー */}
        {lcMode !== 'idle' && (
          <div className={styles.linkModeBanner}>
            {lcMode === 'pick-source' ? '起点ノードをクリックしてください' : '遷移先ノードをクリックしてください'}
          </div>
        )}

        {/* プレビューモードのバナー */}
        {interactionMode === 'preview' && hasTree && (
          <div className={styles.previewModeBanner}>
            プレビューモード — クリックでページ遷移、ホバーで状態切り替え
          </div>
        )}

        {hasTree && currentRoot ? (
          <Canvas
            roots={[currentRoot]}
            highlights={highlights}
            onNodeClick={effectiveOnNodeClick}
            onNodeDoubleClick={interactionMode === 'select' && lcMode === 'idle' ? handleNodeDoubleClick : undefined}
            draggablePageIds={draggablePageIds}
            onPageDragEnd={mode === 'researcher' ? handlePageDragEnd : undefined}
            links={mode === 'researcher' && interactionMode === 'select' ? links : []}
            linkAttributes={linkAttributes}
            pageNames={pageNames}
            onLinkClick={mode === 'researcher' && interactionMode === 'select' ? setSelectedLinkId : undefined}
            selectedLinkId={interactionMode === 'select' ? selectedLinkId : null}
            onNodeHover={interactionMode === 'preview' ? handlePreviewHover : undefined}
          />
        ) : (
          <div className={styles.placeholder}>
            {loading ? (
              <span className={styles.placeholderHint}>読み込み中…</span>
            ) : (
              <>
                <span className={styles.placeholderTitle}>
                  {mode === 'researcher'
                    ? 'SVG を取り込んでください'
                    : 'デザインが読み込まれていません'}
                </span>
                {mode === 'researcher' && (
                  <span className={styles.placeholderHint}>
                    左サイドバーの「SVG を取り込む」ボタンを押してください
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ---- 右パネルスロット ---- */}
      {rightPanel && <aside className={styles.rightPanel}>{rightPanel}</aside>}

      {/* ---- エラートースト ---- */}
      {importError && (
        <div
          role="alert"
          className={styles.errorToast}
          onClick={() => setImportError(null)}
        >
          {importError}
        </div>
      )}
    </div>
  )
}
