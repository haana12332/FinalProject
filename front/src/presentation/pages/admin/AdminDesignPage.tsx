import { useRef, useState, useCallback, useEffect } from 'react'
import { useParams } from 'react-router'
import { useRepositories } from '../../providers/useRepositories'
import { useGuiTreeStore } from '../../shared/design/useGuiTreeStore'
import { parseSvg } from '../../../application/import/parseSvg'
import { Canvas } from '../../shared/canvas/Canvas'
import type { ImportViolation } from '../../../application/import/types'
import styles from './AdminDesignPage.module.css'

type ImportError =
  | { kind: 'violations'; violations: ImportViolation[] }
  | { kind: 'server'; message: string }

export function AdminDesignPage() {
  const { gui_id } = useParams<{ project_id: string; gui_id: string }>()
  const { guiTree: repo } = useRepositories()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const roots       = useGuiTreeStore(s => s.roots)
  const pageNodeId  = useGuiTreeStore(s => s.pageNodeId)
  const setTree     = useGuiTreeStore(s => s.setTree)
  const clearTree   = useGuiTreeStore(s => s.clearTree)

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<ImportError | null>(null)

  // GUI が切り替わったらツリーをロード
  useEffect(() => {
    if (!gui_id) return
    clearTree()
    setError(null)
    setLoading(true)
    repo.getTree(gui_id).then(result => {
      if ('code' in result) {
        setError({ kind: 'server', message: result.message })
      } else if (result.nodes.length > 0) {
        setTree(result.gui_id, result.nodes, result.attributes)
      }
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gui_id])

  const handleFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !gui_id) return
    // input をリセット（同じファイルを再選択できるように）
    e.target.value = ''

    setError(null)
    setLoading(true)

    try {
      const svgText = await file.text()
      const parsed  = await parseSvg(svgText)

      if (!parsed.ok) {
        setError({ kind: 'violations', violations: parsed.violations })
        setLoading(false)
        return
      }

      const result = pageNodeId
        ? await repo.reimportPage(pageNodeId, parsed.payload)
        : await repo.importPage(gui_id, parsed.payload)

      if ('code' in result) {
        setError({ kind: 'server', message: result.message })
      } else {
        setTree(result.gui_id, result.nodes, result.attributes)
      }
    } catch (err) {
      setError({ kind: 'server', message: String(err) })
    } finally {
      setLoading(false)
    }
  }, [gui_id, pageNodeId, repo, setTree])

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const hasTree = roots.length > 0

  return (
    <div className={styles.root}>
      {/* 隠しファイル入力（SVG のみ受け付ける） */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      {/* 取り込み済み: ツールバー + キャンバス */}
      {hasTree ? (
        <>
          <div className={styles.toolbar}>
            <button
              className={styles.reimportBtn}
              onClick={openFilePicker}
              disabled={loading}
            >
              {loading ? '処理中…' : '再取り込み'}
            </button>
          </div>
          <Canvas roots={roots} />
        </>
      ) : (
        /* 未取り込み: プレースホルダー */
        <div className={styles.placeholder}>
          {loading ? (
            <span className={styles.placeholderHint}>読み込み中…</span>
          ) : (
            <>
              <span className={styles.placeholderTitle}>SVG を取り込む</span>
              <span className={styles.placeholderHint}>
                Figma からエクスポートした SVG ファイルを選択してください
              </span>
              <button
                className={styles.importBtn}
                onClick={openFilePicker}
              >
                SVG ファイルを選択
              </button>
            </>
          )}
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className={styles.errorBox}>
          {error.kind === 'violations' ? (
            <>
              <div className={styles.errorTitle}>命名規則エラー</div>
              <ul className={styles.violationList}>
                {error.violations.map((v, i) => (
                  <li key={i}>{v.message}</li>
                ))}
              </ul>
            </>
          ) : (
            <div>{error.message}</div>
          )}
        </div>
      )}
    </div>
  )
}
