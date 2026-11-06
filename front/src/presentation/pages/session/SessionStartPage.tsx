export function SessionStartPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 'var(--space-4)',
      }}
    >
      <h1 style={{ fontSize: 'var(--font-size-lg)' }}>実験開始</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        被験者 ID の入力と実験開始は #30・#33 で実装します。
      </p>
    </div>
  )
}
