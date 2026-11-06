import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'
import type { GuiRepository, GuiListItem } from '../../../application/repositories/GuiRepository'
import type { GUI } from '../../../domain'
import type { AppError } from '../../../application/AppError'
import { toAppError } from '../toAppError'

export class SupabaseGuiRepository implements GuiRepository {
  private readonly db: SupabaseClient<Database>

  constructor(db: SupabaseClient<Database>) {
    this.db = db
  }

  async listByProject(projectId: string): Promise<GuiListItem[] | AppError> {
    const { data, error } = await this.db
      .from('guis')
      .select('*, nodes(id, layer_name)')
      .eq('project_id', projectId)
      .eq('nodes.layer_type', 'page')
      .order('created_at', { ascending: false })
    if (error) return toAppError(error)
    return data as GuiListItem[]
  }

  async create(input: {
    project_id: string
    name: string
    description?: string | null
  }): Promise<GUI | AppError> {
    const { data, error } = await this.db
      .from('guis')
      .insert({
        project_id: input.project_id,
        name: input.name,
        description: input.description ?? null,
      })
      .select()
      .single()
    if (error) return toAppError(error)
    return data as GUI
  }

  async update(
    id: string,
    input: { name?: string; description?: string | null },
  ): Promise<GUI | AppError> {
    const { data, error } = await this.db
      .from('guis')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    if (error) return toAppError(error)
    return data as GUI
  }

  async delete(id: string): Promise<void | AppError> {
    const { error } = await this.db
      .from('guis')
      .delete()
      .eq('id', id)
    if (error) return toAppError(error)
  }

  async deletePage(pageNodeId: string): Promise<void | AppError> {
    const { error } = await this.db
      .from('nodes')
      .delete()
      .eq('id', pageNodeId)
      .eq('layer_type', 'page')
    if (error) return toAppError(error)
  }
}
