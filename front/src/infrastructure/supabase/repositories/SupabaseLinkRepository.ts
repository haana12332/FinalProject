import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'
import type { LinkRepository, CreateLinkPayload } from '../../../application/repositories/LinkRepository'
import type { AppError } from '../../../application/AppError'
import { toAppError } from '../toAppError'

export class SupabaseLinkRepository implements LinkRepository {
  private readonly db: SupabaseClient<Database>

  constructor(db: SupabaseClient<Database>) {
    this.db = db
  }

  async create(payload: CreateLinkPayload): Promise<{ link_id: string } | AppError> {
    const { data, error } = await this.db.rpc('create_link', {
      p_source_node_id: payload.source_node_id,
      p_target_node_id: payload.target_node_id,
      p_name: payload.name,
      p_attributes: payload.attributes as unknown as import('../types').Json,
    })
    if (error) return toAppError(error)
    const result = data as { link_id: string } | null
    return { link_id: result?.link_id ?? '' }
  }

  async update(id: string, name: string): Promise<void | AppError> {
    const { error } = await this.db
      .from('links')
      .update({ name })
      .eq('id', id)
    if (error) return toAppError(error)
  }

  async delete(id: string): Promise<void | AppError> {
    const { error } = await this.db
      .from('links')
      .delete()
      .eq('id', id)
    if (error) return toAppError(error)
  }
}
