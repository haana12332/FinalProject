import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'
import type { RequirementDocumentRepository, CreateRequirementDocumentPayload, UpdateRequirementDocumentPayload } from '../../../application/repositories/RequirementDocumentRepository'
import type { RequirementDocument } from '../../../domain'
import type { AppError } from '../../../application/AppError'
import { toAppError } from '../toAppError'

export class SupabaseRequirementDocumentRepository implements RequirementDocumentRepository {
  private readonly db: SupabaseClient<Database>

  constructor(db: SupabaseClient<Database>) {
    this.db = db
  }

  async listByProject(projectId: string): Promise<RequirementDocument[] | AppError> {
    const { data, error } = await this.db
      .from('requirement_documents')
      .select()
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    if (error) return toAppError(error)
    return data as RequirementDocument[]
  }

  async get(id: string): Promise<RequirementDocument | AppError> {
    const { data, error } = await this.db
      .from('requirement_documents')
      .select()
      .eq('id', id)
      .single()
    if (error) return toAppError(error)
    return data as RequirementDocument
  }

  async create(payload: CreateRequirementDocumentPayload): Promise<RequirementDocument | AppError> {
    const { data, error } = await this.db
      .from('requirement_documents')
      .insert({
        project_id: payload.project_id,
        name: payload.name,
        summary: payload.summary ?? null,
        todo: payload.todo ?? [],
        notodo: payload.notodo ?? [],
        dod: payload.dod ?? null,
        comment: payload.comment ?? null,
      })
      .select()
      .single()
    if (error) return toAppError(error)
    return data as RequirementDocument
  }

  async update(id: string, payload: UpdateRequirementDocumentPayload): Promise<RequirementDocument | AppError> {
    const { data, error } = await this.db
      .from('requirement_documents')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) return toAppError(error)
    return data as RequirementDocument
  }

  async delete(id: string): Promise<void | AppError> {
    const { error } = await this.db
      .from('requirement_documents')
      .delete()
      .eq('id', id)
    if (error) return toAppError(error)
  }
}
