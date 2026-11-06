import { NavLink, Outlet, useParams } from 'react-router'
import { paths } from '../../routes'
import styles from './AdminLayout.module.css'

export function AdminLayout() {
  const { project_id } = useParams<{ project_id?: string }>()

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.appName}>研究補助ツール</span>
        </div>
        <nav className={styles.nav}>
          <NavLink
            to={paths.adminProjects()}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
            end
          >
            プロジェクト
          </NavLink>
          {project_id && (
            <>
              <NavLink
                to={paths.adminProject(project_id)}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
                end
              >
                GUI 一覧
              </NavLink>
              <NavLink
                to={paths.adminParticipants(project_id)}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
              >
                被験者管理
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* サイドバーの幅分だけ右にオフセットして canvas が被らないようにする */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
