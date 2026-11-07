import { NavLink, Outlet, useParams } from 'react-router'
import { paths } from '../../routes'
import { useGuiTreeStore } from '../shared/design/useGuiTreeStore'
import { LayerPanel } from '../shared/layerPanel/LayerPanel'
import styles from './DesignLayout.module.css'

/**
 * デザイン画面用レイアウト。
 * サイドバーがキャンバスに重なる（fixed）ため、
 * canvas 領域は full-width になる。
 * GUI の左右に設計根拠パネルを配置する予定（#20）。
 */
export function DesignLayout() {
  const { project_id } = useParams<{ project_id: string }>()
  const roots = useGuiTreeStore(s => s.roots)

  return (
    <div className={styles.root}>
      {/* 固定サイドバー（キャンバスに重なる） */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.appName}>研究補助ツール</span>
        </div>
        <nav className={styles.nav}>
          <NavLink
            to={paths.adminProjects()}
            className={styles.navItem}
          >
            ← プロジェクト一覧
          </NavLink>
          {project_id && (
            <NavLink
              to={paths.adminProject(project_id)}
              className={styles.navItem}
            >
              GUI 一覧
            </NavLink>
          )}
        </nav>
        {/* レイヤーパネル（#16 / #18）: guiTreeStore から roots を読む */}
        <div className={styles.layerPanelArea}>
          {roots.length > 0 && <LayerPanel roots={roots} />}
        </div>
      </aside>

      {/* キャンバス領域（full-width・サイドバーが上に重なる） */}
      <div className={styles.canvasArea}>
        {/* 左右の設計根拠パネルは #20 で追加する */}
        <Outlet />
      </div>
    </div>
  )
}
