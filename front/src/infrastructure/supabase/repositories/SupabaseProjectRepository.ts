import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'
import type { ProjectRepository } from '../../../application/repositories/ProjectRepository'
import type { Project } from '../../../domain'
import type { AppError } from '../../../application/AppError'
import { toAppError } from '../toAppError'

export class SupabaseProjectRepository implements ProjectRepository {
  private readonly db: SupabaseClient<Database>

  constructor(db: SupabaseClient<Database>) {
    this.db = db
  }

  async list(): Promise<Project[] | AppError> {
    const { data, error } = await this.db
      .from('projects')
      .select()
      .order('created_at', { ascending: false })
    if (error) return toAppError(error)
    return data as Project[]
  }

  async get(id: string): Promise<Project | AppError> {
    const { data, error } = await this.db
      .from('projects')
      .select()
      .eq('id', id)
      .single()
    if (error) return toAppError(error)
    return data as Project
  }

  async create(input: { name: string }): Promise<Project | AppError> {
    // 認証なし（研究用ツール）のため、最初の researcher ユーザーを使用する
    const { data: user, error: userError } = await this.db
      .from('users')
      .select('id')
      .eq('role', 'researcher')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    if (userError) return toAppError(userError)

    const { data, error } = await this.db
      .from('projects')
      .insert({ name: input.name, user_id: user.id })
      .select()
      .single()
    if (error) return toAppError(error)
    return data as Project
  }

  async update(id: string, input: { name: string }): Promise<Project | AppError> {
    const { data, error } = await this.db
      .from('projects')
      .update({ name: input.name })
      .eq('id', id)
      .select()
      .single()
    if (error) return toAppError(error)
    return data as Project
  }

  async delete(id: string): Promise<void | AppError> {
    const { error } = await this.db
      .from('projects')
      .delete()
      .eq('id', id)
    if (error) return toAppError(error)
  }
}
