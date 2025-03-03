'use client'

import React from 'react'
import { Box } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { Providers } from '@/app/providers'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
})

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Providers>
          <Box minH="100vh" bg="gray.900">
            {children}
          </Box>
        </Providers>
      </AuthProvider>
    </QueryClientProvider>
  )
} 