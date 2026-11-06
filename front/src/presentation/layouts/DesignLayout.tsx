import { NavLink, Outlet, useParams } from 'react-router'
import { paths } from '../../routes'
import styles from './DesignLayout.module.css'

type Props = {
  /**
   * サイドバーのレイヤーパネル領域に挿し込むコンテンツ。
   * ページ側で <LayerPanel roots={...} /> を渡す。
   * 省略時は空欄。
   */
  layerPanel?: React.ReactNode
}

/**
 * デザイン画面用レイアウト。
 * サイドバーがキャンバスに重なる（fixed）ため、
 * canvas 領域は full-width になる。
 * GUI の左右に設計根拠パネルを配置する予定（#20）。
 */
export function DesignLayout({ layerPanel }: Props) {
  const { project_id } = useParams<{ project_id: string }>()

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
        {/* レイヤーパネル（#16）: ページ側から roots を受け取って表示 */}
        <div className={styles.layerPanelArea}>
          {layerPanel}
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
