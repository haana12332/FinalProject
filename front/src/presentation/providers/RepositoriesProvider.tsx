import { useMemo } from 'react'
import { type Repositories, RepositoriesContext } from './RepositoriesContext'
import { supabase } from '../../infrastructure/supabase/client'
import { keepaliveSupabase } from '../../infrastructure/supabase/keepaliveClient'
import { SupabaseOperationLogRepository } from '../../infrastructure/supabase/repositories/SupabaseOperationLogRepository'

export function RepositoriesProvider({ children }: { children: React.ReactNode }) {
  const value: Repositories = useMemo<Repositories>(() => ({
    operationLog: new SupabaseOperationLogRepository(supabase, keepaliveSupabase),
  }), [])

  return <RepositoriesContext.Provider value={value}>{children}</RepositoriesContext.Provider>
}
