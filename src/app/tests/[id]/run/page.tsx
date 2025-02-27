'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  Progress,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  Code,
  Collapse,
  IconButton,
  Tooltip,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon, RepeatIcon } from '@chakra-ui/icons'
import { AppLayout } from '@/components/layout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testsApi, TestResult } from '@/api/tests'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ErrorState, LoadingState } from '@/components/common'

interface TestExecutionStep {
  id: string
  number: number
  action: string
  expected: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  logs: string[]
  screenshot?: string
  error?: string
  startTime?: string
  endTime?: string
}

interface TestExecution {
  id: string
  testId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  currentStep: number
  steps: TestExecutionStep[]
  startTime: string
  endTime?: string
  environment: string
}

export default function TestRunPage({ params }: { params: { id: string } }) {
  const [execution, setExecution] = useState<TestExecution | null>(null)
  const [expandedSteps, setExpandedSteps] = useState<string[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = useState('development')
  const toast = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch test details
  const { data: test, isLoading: isLoadingTest, error } = useQuery({
    queryKey: ['test', params.id],
    queryFn: () => testsApi.getTest(params.id)
  })

  // Start test execution
  const executeMutation = useMutation({
    mutationFn: async () => {
      const result = await testsApi.executeTest(params.id, selectedEnvironment)
      return result
    },
    onSuccess: (result) => {
      // Convert API result to our execution format
      const steps = test?.steps.map((step, index) => ({
        id: `step-${index + 1}`,
        number: index + 1,
        action: step.description,
        expected: 'Expected result',
        status: 'pending' as const,
        logs: [],
      })) || []

      setExecution({
        id: result.id,
        testId: params.id,
        status: 'pending',
        currentStep: 0,
        steps,
        startTime: result.startTime,
        environment: result.environment
      })

      // Start polling for results
      startPolling(result.id)
    },
    onError: (error) => {
      toast({
        title: 'Failed to start test execution',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      })
    }
  })

  // Poll for test results
  const startPolling = (resultId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const result = await testsApi.getTestResult(resultId)
        
        // Update execution state based on result
        setExecution(prev => {
          if (!prev) return prev

          const updatedSteps = prev.steps.map((step, index) => {
            const screenshot = result.screenshots?.find(s => s.step === index + 1)
            const isCompleted = index < prev.currentStep
            const isCurrent = index === prev.currentStep

            return {
              ...step,
              status: isCompleted ? 'passed' as const :
                      isCurrent && result.status === 'failed' ? 'failed' as const :
                      isCurrent ? 'running' as const :
                      'pending' as const,
              screenshot: screenshot?.path,
              error: isCurrent && result.error ? result.error.message : undefined,
              logs: [
                ...step.logs,
                ...(isCurrent ? [`[${new Date().toISOString()}] ${result.status === 'failed' ? 'Step failed' : 'Step in progress'}`] : [])
              ]
            }
          })

          const isComplete = result.status === 'passed' || result.status === 'failed' || result.status === 'error'
          if (isComplete) {
            clearInterval(pollInterval)
          }

          return {
            ...prev,
            status: result.status === 'passed' ? 'completed' as const :
                    result.status === 'failed' || result.status === 'error' ? 'failed' as const :
                    'running' as const,
            currentStep: isComplete ? prev.steps.length : prev.currentStep + 1,
            steps: updatedSteps,
            endTime: result.endTime
          }
        })

        // Show toast for completion
        if (result.status === 'passed' || result.status === 'failed' || result.status === 'error') {
          toast({
            title: `Test ${result.status}`,
            description: result.error?.message || `Test execution ${result.status}`,
            status: result.status === 'passed' ? 'success' : 'error',
            duration: 5000,
          })

          // Invalidate test queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['test', params.id] })
        }
      } catch (error) {
        console.error('Error polling test results:', error)
        clearInterval(pollInterval)
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const handleStart = () => {
    executeMutation.mutate()
  }

  const handleViewResults = () => {
    if (execution?.id) {
      router.push(`/tests/${params.id}/results/${execution.id}`)
    }
  }

  if (isLoadingTest) {
    return (
      <AppLayout>
        <Box py={8}>
          <LoadingState message="Loading test details..." />
        </Box>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <Box py={8}>
          <ErrorState 
            title="Failed to load test"
            message={error instanceof Error ? error.message : 'Could not load test details'}
            onRetry={() => queryClient.invalidateQueries({ queryKey: ['tests', params.id] })}
          />
        </Box>
      </AppLayout>
    )
  }

  if (!test) {
    return (
      <AppLayout>
        <Box py={8}>
          <ErrorState 
            title="Test not found"
            message="The test you're looking for doesn't exist or has been deleted"
          />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Breadcrumb mb={4}>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href="/tests">Tests</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href={`/tests/${params.id}`}>{test.title}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>Run Test</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <HStack justify="space-between" mb={6}>
              <Box>
                <Heading size="lg" mb={2}>{test.title}</Heading>
                <Text color="gray.600">{test.description}</Text>
              </Box>
              {execution?.status === 'completed' || execution?.status === 'failed' ? (
                <Button
                  colorScheme="primary"
                  onClick={handleViewResults}
                  leftIcon={<RepeatIcon />}
                >
                  View Results
                </Button>
              ) : !execution && (
                <VStack align="flex-end" spacing={4}>
                  <FormControl>
                    <FormLabel>Environment</FormLabel>
                    <Select
                      value={selectedEnvironment}
                      onChange={(e) => setSelectedEnvironment(e.target.value)}
                      w="200px"
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </Select>
                  </FormControl>
                  <Button
                    colorScheme="primary"
                    onClick={handleStart}
                    isLoading={executeMutation.isPending}
                    leftIcon={<RepeatIcon />}
                  >
                    Start Test Run
                  </Button>
                </VStack>
              )}
            </HStack>
          </Box>

          {execution && (
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <HStack spacing={4}>
                      <Badge
                        colorScheme={
                          execution.status === 'completed' ? 'green' :
                          execution.status === 'failed' ? 'red' :
                          execution.status === 'running' ? 'blue' :
                          'gray'
                        }
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {execution.status.toUpperCase()}
                      </Badge>
                      <Badge
                        colorScheme="purple"
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {execution.environment}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      Started: {new Date(execution.startTime).toLocaleTimeString()}
                    </Text>
                  </HStack>

                  <Progress
                    value={(execution.currentStep / execution.steps.length) * 100}
                    size="sm"
                    colorScheme={
                      execution.status === 'completed' ? 'green' :
                      execution.status === 'failed' ? 'red' :
                      'blue'
                    }
                    hasStripe
                    isAnimated
                  />

                  <VStack spacing={4} align="stretch">
                    {execution.steps.map((step, index) => (
                      <Card
                        key={step.id}
                        variant="outline"
                        bg={
                          step.status === 'running' ? 'blue.50' :
                          step.status === 'passed' ? 'green.50' :
                          step.status === 'failed' ? 'red.50' :
                          'white'
                        }
                      >
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <HStack>
                                <Badge
                                  colorScheme={
                                    step.status === 'passed' ? 'green' :
                                    step.status === 'failed' ? 'red' :
                                    step.status === 'running' ? 'blue' :
                                    'gray'
                                  }
                                >
                                  Step {index + 1}
                                </Badge>
                                <Text fontWeight="medium">{step.action}</Text>
                              </HStack>
                              {step.logs.length > 0 && (
                                <Tooltip label="Toggle logs">
                                  <IconButton
                                    aria-label="Toggle logs"
                                    icon={expandedSteps.includes(step.id) ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleStepExpansion(step.id)}
                                  />
                                </Tooltip>
                              )}
                            </HStack>

                            <Collapse in={expandedSteps.includes(step.id)}>
                              <VStack align="stretch" spacing={2}>
                                {step.logs.map((log, i) => (
                                  <Code key={i} p={2} borderRadius="md" fontSize="sm">
                                    {log}
                                  </Code>
                                ))}
                                {step.error && (
                                  <Alert status="error" size="sm">
                                    <AlertIcon />
                                    {step.error}
                                  </Alert>
                                )}
                                {step.screenshot && (
                                  <Box>
                                    <img src={step.screenshot} alt={`Step ${index + 1} screenshot`} />
                                  </Box>
                                )}
                              </VStack>
                            </Collapse>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </AppLayout>
  )
} 