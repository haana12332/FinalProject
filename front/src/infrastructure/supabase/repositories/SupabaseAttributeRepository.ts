import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'
import type { AttributeRepository, CreateAttributePayload } from '../../../application/repositories/AttributeRepository'
import type { Attribute } from '../../../domain'
import type { AppError } from '../../../application/AppError'
import { toAppError } from '../toAppError'

export class SupabaseAttributeRepository implements AttributeRepository {
  private readonly db: SupabaseClient<Database>

  constructor(db: SupabaseClient<Database>) {
    this.db = db
  }

  async create(payload: CreateAttributePayload): Promise<Attribute | AppError> {
    const { data, error } = await this.db
      .from('attributes')
      .insert({
        node_id:        payload.node_id    ?? null,
        link_id:        payload.link_id    ?? null,
        attribute_type: payload.attribute_type as Database['public']['Enums']['attribute_types'],
        value:          payload.value      as import('../types').Json | null,
        source:         'manual',
      })
      .select()
      .single()
    if (error) return toAppError(error)
    return data as unknown as Attribute
  }

  async update(id: string, value: import('../../../domain').JsonValue | null): Promise<void | AppError> {
    const { error } = await this.db
      .from('attributes')
      .update({ value: value as import('../types').Json | null })
      .eq('id', id)
    if (error) return toAppError(error)
  }

  async delete(id: string): Promise<void | AppError> {
    const { error } = await this.db
      .from('attributes')
      .delete()
      .eq('id', id)
    if (error) return toAppError(error)
  }
}
