import type { AppError } from '../AppError'
import type { Project } from '../../domain'

export interface ProjectRepository {
  /** プロジェクト一覧を取得する */
  list(): Promise<Project[] | AppError>
  /** プロジェクトを1件取得する */
  get(id: string): Promise<Project | AppError>
  /** プロジェクトを作成する（user_id は最初の researcher ユーザーを使用） */
  create(input: { name: string }): Promise<Project | AppError>
  /** プロジェクトを更新する */
  update(id: string, input: { name: string }): Promise<Project | AppError>
  /** プロジェクトを削除する */
  delete(id: string): Promise<void | AppError>
}
