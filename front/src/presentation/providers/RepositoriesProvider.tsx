import { type Repositories, RepositoriesContext } from './RepositoriesContext'

export function RepositoriesProvider({ children }: { children: React.ReactNode }) {
  const value: Repositories = {}
  return <RepositoriesContext.Provider value={value}>{children}</RepositoriesContext.Provider>
}
