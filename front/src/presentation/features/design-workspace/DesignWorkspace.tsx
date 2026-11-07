/**
 * デザイン閲覧ワークスペース（Issue #20）
 *
 * 研究者・被験者どちらのルートでも使える統合コンポーネント。
 * - 左: サイドバー（researcher: ナビ + 取り込みボタン + LayerPanel）
 *       （participant: LayerPanel のみ）
 * - 中: ページ切り替えタブ + Canvas
 * - 右: オプション右パネルスロット（#24/#26/#27 で中身を追加）
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { NavLink, useParams } from 'react-router'
import { paths } from '../../../routes'
import { useGuiTreeStore } from '../../shared/design/useGuiTreeStore'
import { useSelectionStore } from '../../shared/selection/useSelectionStore'
import { useCanvasSelection } from '../../shared/selection/useCanvasSelection'
import { useRepositories } from '../../providers/useRepositories'
import { useLogEvent } from '../../../application/logging/useLogEvent'
import { parseSvg } from '../../../application/import/parseSvg'
import { LayerPanel } from '../../shared/layerPanel/LayerPanel'
import { Canvas } from '../../shared/canvas/Canvas'
import { flattenNodes } from '../../shared/canvas/buildRenderTree'
import styles from './DesignWorkspace.module.css'

export type DesignMode = 'researcher' | 'participant'

type Props = {
  mode: DesignMode
  /**
   * 研究者用の編集パネル（#24/#27 で実装）。
   * researcher モードでのみ右パネルに表示する。
   */
  editPanel?: React.ReactNode
  /**
   * 被験者用の設計根拠パネル（#26 で実装）。
   * participant モードでのみ右パネルに表示する。
   */
  reasonPanel?: React.ReactNode
}

export function DesignWorkspace({ mode, editPanel, reasonPanel }: Props) {
  const { project_id, gui_id } = useParams<{ project_id?: string; gui_id?: string }>()

  const { guiTree: repo } = useRepositories()
  const { logEvent } = useLogEvent()

  // ---- ツリーストア ----
  const roots      = useGuiTreeStore(s => s.roots)
  const pageNodeId = useGuiTreeStore(s => s.pageNodeId)
  const setTree    = useGuiTreeStore(s => s.setTree)
  const clearTree  = useGuiTreeStore(s => s.clearTree)

  // ---- 選択ストア（highlights 用） ----
  const selectedNodeId = useSelectionStore(s => s.selectedNodeId)

  // ---- ページ切り替え ----
  const [selectedPageIdx, setSelectedPageIdx] = useState(0)

  // ---- インポート状態（researcher のみ） ----
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading]       = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  // ---- GUI 切り替え時にツリーをロード（researcher） ----
  useEffect(() => {
    if (mode !== 'researcher' || !gui_id) return
    clearTree()
    setSelectedPageIdx(0)
    setImportError(null)
    setLoading(true)
    repo.getTree(gui_id).then(result => {
      if ('code' in result) {
        setImportError(result.message)
      } else if (result.nodes.length > 0) {
        setTree(result.gui_id, result.nodes, result.attributes)
      }
      setLoading(false)
    })
  // gui_id が変わったときだけ再実行
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
  const flatMap = currentRoot ? flattenNodes([currentRoot]) : new Map()
  const { handleNodeClick, handleNodeDoubleClick } = useCanvasSelection(flatMap)

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
          setTree(result.gui_id, result.nodes, result.attributes)
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

  const hasTree = roots.length > 0
  const highlights = selectedNodeId ? [{ nodeId: selectedNodeId, style: 'selection' as const }] : []
  const rightPanel = mode === 'researcher' ? editPanel : reasonPanel

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
        {/* ページ切り替えタブ（複数ページがある場合のみ） */}
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

        {hasTree && currentRoot ? (
          <Canvas
            roots={[currentRoot]}
            highlights={highlights}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
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

      {/* ---- 右パネルスロット（#24/#26/#27 で中身を渡す） ---- */}
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
