'use client'

import React from 'react'
import { Box } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { SimpleLayout } from '@/components/layout'
import { ErrorState } from '@/components/common'

export default function NotFound() {
  const router = useRouter()

  return (
    <SimpleLayout>
      <Box py={8}>
        <ErrorState
          title="Page not found"
          message="We couldn't find the page you're looking for. It might have been moved or deleted."
          onRetry={() => router.push('/')}
        />
      </Box>
    </SimpleLayout>
  )
} 