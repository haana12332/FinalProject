import { useParams } from 'react-router'

export function GuiListPage() {
  const { project_id } = useParams<{ project_id: string }>()
  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h1 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>
        GUI 一覧
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        プロジェクト ID: {project_id} (#17 で実装)
      </p>
    </div>
  )
}
