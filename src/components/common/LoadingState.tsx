import React from 'react'
import { VStack, Spinner, Text } from '@chakra-ui/react'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <VStack py={12} spacing={4}>
      <Spinner size="xl" color="primary.500" />
      <Text color="gray.600">{message}</Text>
    </VStack>
  )
} 