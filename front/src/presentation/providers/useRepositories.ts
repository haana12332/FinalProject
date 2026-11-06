import { useContext } from 'react'
import { RepositoriesContext, type Repositories } from './RepositoriesContext'

export function useRepositories(): Repositories {
  const ctx = useContext(RepositoriesContext)
  if (!ctx) throw new Error('useRepositories must be used inside <RepositoriesProvider>')
  return ctx
}
