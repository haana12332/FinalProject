import { createContext } from 'react'

// 各 Issue がリポジトリを追加するたびに下記 2 箇所を更新する:
//   1. Repositories 型にプロパティを追加
//   2. RepositoriesProvider の value に実装を渡す
//
// 例（#17 追加後）:
//   import type { ProjectRepository } from '../../application/repositories/ProjectRepository'
//   import { SupabaseProjectRepository } from '../../infrastructure/supabase/repositories/SupabaseProjectRepository'
//   import { supabase } from '../../infrastructure/supabase/client'
//
//   type Repositories = {
//     project: ProjectRepository
//   }
//   const value: Repositories = { project: new SupabaseProjectRepository(supabase) }

export type Repositories = Record<string, never>

export const RepositoriesContext = createContext<Repositories | null>(null)
