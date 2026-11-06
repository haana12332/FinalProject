import { Outlet } from 'react-router'
import styles from './SessionLayout.module.css'

export function SessionLayout() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.appName}>研究補助ツール</span>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
