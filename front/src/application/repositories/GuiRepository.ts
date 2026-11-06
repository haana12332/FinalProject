import type { AppError } from '../AppError'
import type { GUI } from '../../domain'

/** GUI 一覧取得用の型（page ノードを含む） */
export type GuiListItem = GUI & {
  nodes: Array<{ id: string; layer_name: string }>
}

export interface GuiRepository {
  /** プロジェクトの GUI 一覧を取得する（page ノード付き） */
  listByProject(projectId: string): Promise<GuiListItem[] | AppError>
  /** GUI を作成する */
  create(input: { project_id: string; name: string; description?: string | null }): Promise<GUI | AppError>
  /** GUI を更新する */
  update(id: string, input: { name?: string; description?: string | null }): Promise<GUI | AppError>
  /** GUI を削除する */
  delete(id: string): Promise<void | AppError>
  /** ページノード（layer_type = 'page'）を削除する */
  deletePage(pageNodeId: string): Promise<void | AppError>
}
