import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'
import type {
  OperationLogRepository,
  InsertableLog,
} from '../../../application/repositories/OperationLogRepository'
import { toAppError } from '../toAppError'

type OperationLogInsert = Database['public']['Tables']['operation_logs']['Insert']

export class SupabaseOperationLogRepository implements OperationLogRepository {
  private readonly db: SupabaseClient<Database>
  private readonly keepaliveDb: SupabaseClient<Database>

  constructor(db: SupabaseClient<Database>, keepaliveDb: SupabaseClient<Database>) {
    this.db = db
    this.keepaliveDb = keepaliveDb
  }

  async insertMany(
    logs: InsertableLog[],
    options?: { keepalive?: boolean },
  ) {
    if (logs.length === 0) return

    const client = options?.keepalive ? this.keepaliveDb : this.db
    const rows: OperationLogInsert[] = logs.map(l => ({
      session_id: l.session_id,
      event_type: l.event_type,
      target_node_id: l.target_node_id ?? null,
      payload: l.payload as Database['public']['Tables']['operation_logs']['Insert']['payload'],
      occurred_at: l.occurred_at,
    }))

    const { error } = await client.from('operation_logs').insert(rows)
    if (error) return toAppError(error)
  }
}
