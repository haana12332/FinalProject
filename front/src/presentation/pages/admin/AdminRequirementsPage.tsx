import { Link, useParams } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRepositories } from '../../providers/useRepositories'
import { paths } from '../../../routes'
import { RequirementsTable } from '../../features/requirements/RequirementsTable'
import type { AppError } from '../../../application/AppError'
import styles from './AdminRequirementsPage.module.css'

function isAppError(v: unknown): v is AppError {
  return typeof v === 'object' && v !== null && 'code' in v
}

export function AdminRequirementsPage() {
  const { project_id } = useParams<{ project_id: string }>()
  const repos = useRepositories()
  const queryClient = useQueryClient()

  const { data: project } = useQuery({
    queryKey: ['project', project_id],
    queryFn: async () => {
      const result = await repos.project.get(project_id!)
      if (isAppError(result)) throw new Error(result.message)
      return result
    },
    enabled: !!project_id,
  })

  const { data: docs, isLoading, error } = useQuery({
    queryKey: ['requirementDocuments', project_id],
    queryFn: async () => {
      const result = await repos.requirementDocument.listByProject(project_id!)
      if (isAppError(result)) throw new Error(result.message)
      return result
    },
    enabled: !!project_id,
  })

  const createMutation = useMutation({
    mutationFn: async (payload: Parameters<typeof repos.requirementDocument.create>[0]) => {
      const result = await repos.requirementDocument.create(payload)
      if (isAppError(result)) throw new Error(result.message)
      return result
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requirementDocuments', project_id] }),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Parameters<typeof repos.requirementDocument.update>[1] }) => {
      const result = await repos.requirementDocument.update(id, payload)
      if (isAppError(result)) throw new Error(result.message)
      return result
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requirementDocuments', project_id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await repos.requirementDocument.delete(id)
      if (isAppError(result)) throw new Error(result.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requirementDocuments', project_id] }),
  })

  const isSaving = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to={paths.adminProjects()} className={styles.breadcrumbLink}>
          プロジェクト一覧
        </Link>
        <span>›</span>
        <Link to={paths.adminProject(project_id!)} className={styles.breadcrumbLink}>
          {project?.name ?? '…'}
        </Link>
        <span>›</span>
        <span>要件定義書</span>
      </div>

      <h1 className={styles.title}>{project?.name ?? '…'} — 要件定義書</h1>

      {(error || mutationError) && (
        <div className={styles.error}>
          {((error ?? mutationError) as Error).message}
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>読み込み中…</div>
      ) : (
        <RequirementsTable
          projectId={project_id!}
          docs={docs ?? []}
          readOnly={false}
          saving={isSaving}
          onCreate={payload => createMutation.mutate({ project_id: project_id!, ...payload })}
          onUpdate={(id, payload) => updateMutation.mutate({ id, payload })}
          onDelete={id => deleteMutation.mutate(id)}
          onReorder={() => {/* client-side only */}}
        />
      )}
    </div>
  )
}
