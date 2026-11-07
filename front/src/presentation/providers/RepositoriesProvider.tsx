import { useMemo } from 'react'
import { type Repositories, RepositoriesContext } from './RepositoriesContext'
import { supabase } from '../../infrastructure/supabase/client'
import { keepaliveSupabase } from '../../infrastructure/supabase/keepaliveClient'
import { SupabaseOperationLogRepository } from '../../infrastructure/supabase/repositories/SupabaseOperationLogRepository'
import { SupabaseProjectRepository } from '../../infrastructure/supabase/repositories/SupabaseProjectRepository'
import { SupabaseGuiRepository } from '../../infrastructure/supabase/repositories/SupabaseGuiRepository'
import { SupabaseGuiTreeRepository } from '../../infrastructure/supabase/repositories/SupabaseGuiTreeRepository'
import { SupabaseLinkRepository } from '../../infrastructure/supabase/repositories/SupabaseLinkRepository'
import { SupabaseAttributeRepository } from '../../infrastructure/supabase/repositories/SupabaseAttributeRepository'

export function RepositoriesProvider({ children }: { children: React.ReactNode }) {
  const value: Repositories = useMemo<Repositories>(() => ({
    operationLog: new SupabaseOperationLogRepository(supabase, keepaliveSupabase),
    project: new SupabaseProjectRepository(supabase),
    gui: new SupabaseGuiRepository(supabase),
    guiTree: new SupabaseGuiTreeRepository(supabase),
    link: new SupabaseLinkRepository(supabase),
    attribute: new SupabaseAttributeRepository(supabase),
  }), [])

  return <RepositoriesContext.Provider value={value}>{children}</RepositoriesContext.Provider>
}
