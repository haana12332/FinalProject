import { useParams } from 'react-router'

export function ParticipantsPage() {
  const { project_id } = useParams<{ project_id: string }>()
  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h1 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>
        被験者管理
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        プロジェクト ID: {project_id} (#30 で実装)
      </p>
    </div>
  )
}
