import { useParams } from 'react-router'

export function SessionDesignPage() {
  const { session_id } = useParams<{ session_id: string }>()
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--color-text-disabled)',
        fontSize: 'var(--font-size-sm)',
      }}
    >
      被験者デザイン画面（#33） session: {session_id}
    </div>
  )
}
