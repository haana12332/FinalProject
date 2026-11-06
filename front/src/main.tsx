import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RepositoriesProvider } from './presentation/providers/RepositoriesProvider'
import { SessionProvider } from './application/session/SessionProvider'
import { LoggingProvider } from './presentation/providers/LoggingProvider'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RepositoriesProvider>
        <SessionProvider>
          <LoggingProvider>
            <App />
          </LoggingProvider>
        </SessionProvider>
      </RepositoriesProvider>
    </QueryClientProvider>
  </StrictMode>,
)
