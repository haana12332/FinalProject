import { Outlet } from 'react-router'

/**
 * デザイン画面用レイアウトシェル。
 * サイドバー・レイヤーパネル・キャンバスは DesignWorkspace（#20）が提供するため、
 * このレイアウトは Route のネストを保つだけの薄いラッパー。
 */
export function DesignLayout() {
  return <Outlet />
}
