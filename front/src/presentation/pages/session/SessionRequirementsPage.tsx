import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useRepositories } from '../../providers/useRepositories'
import { RequirementsTable } from '../../features/requirements/RequirementsTable'
import { useLogEvent } from '../../../application/logging/useLogEvent'
import { supabase } from '../../../infrastructure/supabase/client'
import type { AppError } from '../../../application/AppError'

function isAppError(v: unknown): v is AppError {
  return typeof v === 'object' && v !== null && 'code' in v
}

export function SessionRequirementsPage() {
  const { session_id } = useParams<{ session_id: string }>()
  const repos = useRepositories()
  const { logEvent } = useLogEvent()

  // セッションからプロジェクト ID を取得（#30 でセッションリポジトリが実装されたら置き換える）
  const { data: projectId, isLoading: sessionLoading } = useQuery({
    queryKey: ['session-project', session_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('project_id')
        .eq('id', session_id!)
        .single()
      if (error) throw new Error(error.message)
      return data.project_id as string
    },
    enabled: !!session_id,
  })

  const { data: docs, isLoading: docsLoading } = useQuery({
    queryKey: ['requirementDocuments', projectId],
    queryFn: async () => {
      const result = await repos.requirementDocument.listByProject(projectId!)
      if (isAppError(result)) throw new Error(result.message)
      return result
    },
    enabled: !!projectId,
  })

  useEffect(() => {
    if (!projectId) return
    logEvent('requirements_view', { project_id: projectId })
  }, [projectId, logEvent])

  const isLoading = sessionLoading || docsLoading

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h1 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
        要件定義書
      </h1>
      {isLoading ? (
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          読み込み中…
        </p>
      ) : (
        <RequirementsTable
          projectId={projectId ?? ''}
          docs={docs ?? []}
          readOnly={true}
          saving={false}
          onCreate={() => {}}
          onUpdate={() => {}}
          onDelete={() => {}}
          onReorder={() => {}}
        />
      )}
    </div>
  )
}
