'use client'

import React from 'react'
import { Box } from '@chakra-ui/react'
import { AppLayout } from '@/components/layout'
import { ErrorState } from '@/components/common'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <AppLayout>
      <Box py={8}>
        <ErrorState
          title="Something went wrong"
          message={process.env.NODE_ENV === 'development' ? error.message : "An error occurred while loading this page. We've been notified and are looking into it."}
          onRetry={reset}
        />
      </Box>
    </AppLayout>
  )
} 