import React from 'react'
import { VStack, Spinner, Text } from '@chakra-ui/react'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <VStack py={12} spacing={4}>
      <Spinner 
        size="xl" 
        thickness="4px"
        color="blue.400"
        emptyColor="gray.700"
        speed="0.8s"
      />
      <Text color="gray.400">{message}</Text>
    </VStack>
  )
} 