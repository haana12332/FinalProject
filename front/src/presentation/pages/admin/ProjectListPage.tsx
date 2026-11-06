import { useState } from 'react'
import { Link } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRepositories } from '../../providers/useRepositories'
import { paths } from '../../../routes'
import type { AppError } from '../../../application/AppError'
import styles from './ProjectListPage.module.css'

function isAppError(v: unknown): v is AppError {
  return typeof v === 'object' && v !== null && 'code' in v
}

export function ProjectListPage() {
  const repos = useRepositories()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [mutationError, setMutationError] = useState<string | null>(null)

  const { data: projects, isLoading, error: fetchError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const result = await repos.project.list()
      if (isAppError(result)) throw new Error(result.message)
      return result
    },
  })

  const createMutation = useMutation({
    mutationFn: async (projectName: string) => {
      const result = await repos.project.create({ name: projectName })
      if (isAppError(result)) throw new Error(result.message)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setName('')
      setMutationError(null)
    },
    onError: (err: Error) => {
      setMutationError(err.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await repos.project.delete(id)
      if (isAppError(result)) throw new Error(result.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
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

  const handleDelete = (id: string, projectName: string) => {
    if (!confirm(`「${projectName}」を削除しますか？この操作は元に戻せません。`)) return
    deleteMutation.mutate(id)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>プロジェクト一覧</h1>
      </div>

      <form className={styles.createForm} onSubmit={handleCreate}>
        <input
          className={styles.input}
          type="text"
          placeholder="プロジェクト名を入力"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={!name.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? '作成中…' : '新規作成'}
        </button>
      </form>

      {mutationError && (
        <div className={styles.error}>{mutationError}</div>
      )}

      {isLoading && <div className={styles.empty}>読み込み中…</div>}

      {fetchError && (
        <div className={styles.error}>{(fetchError as Error).message}</div>
      )}

      {projects && (
        <div className={styles.list}>
          {projects.length === 0 ? (
            <div className={styles.empty}>
              プロジェクトがありません。上のフォームから作成してください。
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} className={styles.card}>
                <Link
                  to={paths.adminProject(project.id)}
                  className={styles.cardLink}
                >
                  {project.name}
                </Link>
                <span className={styles.cardMeta}>
                  {new Date(project.created_at).toLocaleDateString('ja-JP')}
                </span>
                <button
                  type="button"
                  className={styles.btnDanger}
                  onClick={() => handleDelete(project.id, project.name)}
                  disabled={deleteMutation.isPending}
                >
                  削除
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
