'use client'

import React, { useState } from 'react'
import { Box, Button, Heading, Text, HStack, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { TestList } from '@/components/test/TestList'
import { testsApi } from '@/api/tests'
import { ErrorState, LoadingState } from '@/components/common'
import NextLink from 'next/link'
import { AddIcon } from '@chakra-ui/icons'
import { FiFilter } from 'react-icons/fi'

export default function TestsPage() {
  const router = useRouter()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [activeExecutions, setActiveExecutions] = useState<string[]>(['1']) // Mock active execution for now
  const [showFilters, setShowFilters] = useState(false)

  // Fetch tests
  const { data: tests, isLoading, error } = useQuery({
    queryKey: ['tests'],
    queryFn: testsApi.getTests,
  })

  const handleTestClick = (testId: string) => {
    router.push(`/tests/${testId}`)
  }

  const handleRunTest = (testId: string) => {
    // Mock implementation
    toast({
      title: 'Test started',
      description: `Test ${testId} is now running`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    
    // Add to active executions
    setActiveExecutions(prev => [...prev, testId])
  }

  const handleViewExecution = (testId: string) => {
    router.push(`/tests/${testId}/run`)
  }

  const handleDeleteTest = async (testId: string) => {
    try {
      await testsApi.deleteTest(testId)
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      toast({
        title: 'Test deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error deleting test',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
      <Box>
        <Box mb={8}>
          <Heading 
            as="h1" 
            size="xl" 
            mb={4}
            color="white"
          >
            Test Cases
          </Heading>
          <Text color="gray.400" mb={6}>
            Manage your automated test cases and view their execution history
          </Text>
          <HStack spacing={4}>
            <NextLink href="/import" passHref>
              <Button 
                leftIcon={<AddIcon />} 
                colorScheme="blue"
                as="a"
              >
                Import Test
              </Button>
            </NextLink>
            <Button 
              variant="outline" 
              leftIcon={<FiFilter />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filter
            </Button>
          </HStack>
        </Box>
        
        {isLoading ? (
          <LoadingState message="Loading tests..." />
        ) : error ? (
          <ErrorState 
            title="Failed to load tests" 
            message="There was an error loading your tests. Please try again."
            onRetry={() => queryClient.invalidateQueries({ queryKey: ['tests'] })}
          />
        ) : tests && tests.length > 0 ? (
          <TestList 
            tests={tests} 
            onTestClick={handleTestClick}
            onRunTest={handleRunTest}
            onViewExecution={handleViewExecution}
            onDeleteTest={handleDeleteTest}
            activeExecutions={activeExecutions}
          />
        ) : (
          <Box 
            p={8} 
            textAlign="center" 
            borderRadius="lg"
            bg="gray.800"
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Text mb={4} color="gray.400">No tests found</Text>
            <NextLink href="/import" passHref>
              <Button 
                colorScheme="blue"
                as="a"
              >
                Import Your First Test
              </Button>
            </NextLink>
          </Box>
        )}
      </Box>
  )
} 