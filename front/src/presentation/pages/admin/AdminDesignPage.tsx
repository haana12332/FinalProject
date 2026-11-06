import { useParams } from 'react-router'

export function AdminDesignPage() {
  const { project_id, gui_id } = useParams<{ project_id: string; gui_id: string }>()
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--color-text-disabled)',
        fontSize: 'var(--font-size-sm)',
        gap: 'var(--space-2)',
      }}
    >
      <span>
        キャンバス（#14）・デザイン画面（#20） project: {project_id} / gui: {gui_id}
      </span>
    </div>
  )
}
