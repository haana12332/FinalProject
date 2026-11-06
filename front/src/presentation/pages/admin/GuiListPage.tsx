import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRepositories } from '../../providers/useRepositories'
import { paths } from '../../../routes'
import type { AppError } from '../../../application/AppError'
import styles from './GuiListPage.module.css'

function isAppError(v: unknown): v is AppError {
  return typeof v === 'object' && v !== null && 'code' in v
}

export function GuiListPage() {
  const { project_id } = useParams<{ project_id: string }>()
  const repos = useRepositories()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [mutationError, setMutationError] = useState<string | null>(null)

  const { data: project, error: projectError } = useQuery({
    queryKey: ['project', project_id],
    queryFn: async () => {
      const result = await repos.project.get(project_id!)
      if (isAppError(result)) throw new Error(result.message)
      return result
    },
    enabled: !!project_id,
  })

  const { data: guis, isLoading, error: guisError } = useQuery({
    queryKey: ['guis', project_id],
    queryFn: async () => {
      const result = await repos.gui.listByProject(project_id!)
      if (isAppError(result)) throw new Error(result.message)
      return result
    },
    enabled: !!project_id,
  })

  const createMutation = useMutation({
    mutationFn: async (guiName: string) => {
      const result = await repos.gui.create({ project_id: project_id!, name: guiName })
      if (isAppError(result)) throw new Error(result.message)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guis', project_id] })
      setName('')
      setMutationError(null)
    },
    onError: (err: Error) => {
      setMutationError(err.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await repos.gui.delete(id)
      if (isAppError(result)) throw new Error(result.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guis', project_id] })
      setMutationError(null)
    },
    onError: (err: Error) => {
      setMutationError(err.message)
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    createMutation.mutate(trimmed)
  }

  const handleDelete = (id: string, guiName: string) => {
    if (!confirm(`「${guiName}」を削除しますか？この操作は元に戻せません。`)) return
    deleteMutation.mutate(id)
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to={paths.adminProjects()} className={styles.breadcrumbLink}>
          プロジェクト一覧
        </Link>
        <span>›</span>
        <span>{project?.name ?? '…'}</span>
      </div>

      <h1 className={styles.title}>
        {project?.name ?? '…'} — GUI 一覧
      </h1>

      <form className={styles.createForm} onSubmit={handleCreate}>
        <input
          className={styles.input}
          type="text"
          placeholder="GUI 名を入力（例: 大学生協 EC サイト）"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={!name.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? '作成中…' : '新規 GUI'}
        </button>
      </form>

      {mutationError && (
        <div className={styles.error}>{mutationError}</div>
      )}

      {(projectError || guisError) && (
        <div className={styles.error}>
          {((projectError ?? guisError) as Error).message}
        </div>
      )}

      {isLoading && <div className={styles.empty}>読み込み中…</div>}

      {guis && (
        <div className={styles.list}>
          {guis.length === 0 ? (
            <div className={styles.empty}>
              GUI がありません。上のフォームから作成してください。
            </div>
          ) : (
            guis.map(gui => (
              <div key={gui.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardName}>{gui.name}</span>
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => handleDelete(gui.id, gui.name)}
                    disabled={deleteMutation.isPending}
                  >
                    削除
                  </button>
                </div>
                <div className={styles.pages}>
                  {gui.nodes.length === 0 ? (
                    <span className={styles.noPages}>ページなし（取り込み後に表示）</span>
                  ) : (
                    gui.nodes.map(node => (
                      <Link
                        key={node.id}
                        to={paths.adminDesign(project_id!, gui.id)}
                        className={styles.pageTag}
                        title={node.layer_name}
                      >
                        P {node.layer_name}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
