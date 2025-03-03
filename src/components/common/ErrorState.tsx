import React from 'react'
import { Box, VStack, Text, Button } from '@chakra-ui/react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ 
  title = 'Something went wrong',
  message,
  onRetry 
}: ErrorStateProps) {
  return (
    <Box
      p={8}
      textAlign="center"
      borderRadius="lg"
      bg="gray.800"
      borderWidth="1px"
      borderColor="gray.700"
      boxShadow="sm"
    >
      <VStack spacing={4}>
        <Text fontSize="2xl" mb={2}>
          😕
        </Text>
        <Text fontSize="lg" fontWeight="medium" color="white">
          {title}
        </Text>
        {message && (
          <Text color="gray.400" fontSize="sm">
            {message}
          </Text>
        )}
        {onRetry && (
          <Button
            size="sm"
            colorScheme="blue"
            onClick={onRetry}
            mt={2}
          >
            Try Again
          </Button>
        )}
      </VStack>
    </Box>
  )
} 