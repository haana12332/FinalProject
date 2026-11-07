import { DesignWorkspace } from '../../features'

/**
 * 被験者用デザイン閲覧画面。
 * GUI ツリーのロードはセッション初期化（#30）と連携する。
 * 設計根拠パネル（#26）は reasonPanel スロットで追加予定。
 */
export function SessionDesignPage() {
  return <DesignWorkspace mode="participant" />
}
