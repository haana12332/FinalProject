/**
 * 要件定義書のリポジトリ（Issue #21）
 * api.md §7.6
 */
import type { RequirementDocument } from '../../domain/entities'
import type { AppError } from '../AppError'

export type CreateRequirementDocumentPayload = {
  project_id: string
  name: string
  summary?: string | null
  todo?: string[]
  notodo?: string[]
  dod?: string | null
  comment?: string | null
}

export type UpdateRequirementDocumentPayload = {
  name?: string
  summary?: string | null
  todo?: string[]
  notodo?: string[]
  dod?: string | null
  comment?: string | null
}

export interface RequirementDocumentRepository {
  listByProject(projectId: string): Promise<RequirementDocument[] | AppError>
  get(id: string): Promise<RequirementDocument | AppError>
  create(data: CreateRequirementDocumentPayload): Promise<RequirementDocument | AppError>
  update(id: string, data: UpdateRequirementDocumentPayload): Promise<RequirementDocument | AppError>
  delete(id: string): Promise<void | AppError>
}
