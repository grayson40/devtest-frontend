'use client'

import React, { useState } from 'react'
import { Box, Flex, Heading, Button, Text, useToast, HStack, Badge } from '@chakra-ui/react'
import { AppLayout } from '@/components/layout'
import { TestList } from '@/components/test/TestList'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testsApi } from '@/api/tests'
import { ErrorState, LoadingState } from '@/components/common'

export default function TestsPage() {
  const router = useRouter()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [activeExecutions, setActiveExecutions] = useState<string[]>(['1']) // Mock active execution for now

  // Fetch tests
  const { data: tests, isLoading, error } = useQuery({
    queryKey: ['tests'],
    queryFn: testsApi.getTests
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: testsApi.deleteTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      toast({
        title: 'Test deleted',
        status: 'success',
        duration: 3000,
      })
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete test',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      })
    }
  })

  const handleTestClick = (testId: string) => {
    router.push(`/tests/${testId}`)
  }

  const handleRunTest = (testId: string) => {
    // Start test execution and navigate to execution page
    toast({
      title: 'Starting test execution...',
      description: `Initializing test ${testId}`,
      status: 'info',
      duration: 3000,
    })
    setActiveExecutions(prev => [...prev, testId])
    router.push(`/tests/${testId}/run`)
  }

  const handleViewExecution = (testId: string) => {
    router.push(`/tests/${testId}/run`)
  }

  const handleDeleteTest = async (testId: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      await deleteMutation.mutateAsync(testId)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <Box py={8}>
          <LoadingState message="Loading tests..." />
        </Box>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <Box p={8}>
          <ErrorState 
            title="Failed to load tests" 
            message={error instanceof Error ? error.message : 'Unknown error'} 
            onRetry={() => {
              queryClient.invalidateQueries({ queryKey: ['tests'] })
            }}
          />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box p={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" mb={2}>Test Cases</Heading>
            <HStack spacing={4}>
              <Text color="gray.600">Manage and organize your test cases</Text>
              {activeExecutions.length > 0 && (
                <Badge colorScheme="blue" px={2} py={1} borderRadius="full">
                  {activeExecutions.length} Active Run{activeExecutions.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </HStack>
          </Box>
          <HStack spacing={4}>
            {activeExecutions.length > 0 && (
              <Button
                variant="outline"
                colorScheme="blue"
                size="md"
                onClick={() => router.push('/tests/active')}
                leftIcon={<span>⚡</span>}
              >
                View Active Runs
              </Button>
            )}
            <Button
              colorScheme="primary"
              onClick={() => router.push('/import')}
            >
              New Test Case
            </Button>
          </HStack>
        </Flex>

        <TestList
          tests={tests || []}
          onTestClick={handleTestClick}
          onRunTest={handleRunTest}
          onViewExecution={handleViewExecution}
          onDeleteTest={handleDeleteTest}
          activeExecutions={activeExecutions}
        />
      </Box>
    </AppLayout>
  )
} 