import { DesignWorkspace } from '../../features'

/**
 * 研究者用デザイン画面。
 * SVG 取り込み・キャンバス・レイヤーパネルは DesignWorkspace が提供する。
 * 編集パネル（#24/#27）は editPanel スロットで追加予定。
 */
export function AdminDesignPage() {
  return <DesignWorkspace mode="researcher" />
}
