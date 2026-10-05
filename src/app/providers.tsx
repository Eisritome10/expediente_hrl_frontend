import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/hooks/useAuth'
import { useTheme } from '@/lib/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster
        position="top-right"
        theme={theme}
        closeButton
        richColors
        mobileOffset={12}
        duration={4500}
        toastOptions={{
          classNames: {
            toast: 'rounded-lg border border-border bg-surface shadow-lg shadow-black/5 font-sans',
            title: 'text-text text-sm font-medium',
            description: 'text-text-muted text-sm',
          },
        }}
      />
    </QueryClientProvider>
  )
}
