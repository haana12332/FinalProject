import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'
import type { GuiTreeRepository, GuiTree } from '../../../application/repositories/GuiTreeRepository'
import type { ImportPayload } from '../../../application/import/types'
import type { Node, Attribute } from '../../../domain/entities'
import type { AppError } from '../../../application/AppError'
import { toAppError } from '../toAppError'

type RpcResult = {
  gui_id: string
  nodes: Node[]
  attributes: Attribute[]
} | null

export class SupabaseGuiTreeRepository implements GuiTreeRepository {
  private readonly db: SupabaseClient<Database>

  constructor(db: SupabaseClient<Database>) {
    this.db = db
  }

  async importPage(guiId: string, payload: ImportPayload): Promise<GuiTree | AppError> {
    const { data, error } = await this.db.rpc('import_page', {
      p_gui_id: guiId,
      p_nodes: payload.nodes as unknown as import('../types').Json,
    })
    if (error) return toAppError(error)
    const result = data as RpcResult
    return {
      gui_id: guiId,
      nodes: result?.nodes ?? [],
      attributes: result?.attributes ?? [],
    }
  }

  async reimportPage(pageNodeId: string, payload: ImportPayload): Promise<GuiTree | AppError> {
    const { data, error } = await this.db.rpc('reimport_page', {
      p_page_node_id: pageNodeId,
      p_nodes: payload.nodes as unknown as import('../types').Json,
    })
    if (error) return toAppError(error)
    const result = data as RpcResult
    return {
      gui_id: result?.gui_id ?? '',
      nodes: result?.nodes ?? [],
      attributes: result?.attributes ?? [],
    }
  }

  async getTree(guiId: string): Promise<GuiTree | AppError> {
    const { data, error } = await this.db.rpc('get_gui_tree', {
      p_gui_id: guiId,
    })
    if (error) return toAppError(error)
    const result = data as RpcResult
    return {
      gui_id: guiId,
      nodes: result?.nodes ?? [],
      attributes: result?.attributes ?? [],
    }
  }
}
