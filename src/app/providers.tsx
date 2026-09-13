import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/hooks/useAuth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          classNames: {
            toast: 'rounded-lg border border-border bg-white shadow-lg shadow-black/5 font-sans',
            title: 'text-text text-sm font-medium',
            description: 'text-text-muted text-sm',
          },
        }}
      />
    </QueryClientProvider>
  )
}
