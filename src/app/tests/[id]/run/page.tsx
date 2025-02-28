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
  Grid,
  GridItem,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  useClipboard,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon, RepeatIcon, CheckIcon, CopyIcon, WarningIcon } from '@chakra-ui/icons'
import { AppLayout } from '@/components/layout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testsApi, TestResult } from '@/api/tests'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ErrorState, LoadingState } from '@/components/common'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

interface LogEntry {
  timestamp: string
  level: 'info' | 'error' | 'debug'
  message: string
}

interface TestExecutionStep {
  id: string
  number: number
  action: string
  expected: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  logs: LogEntry[]
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
  config: {
    browser: string
    viewport: string
    network: string
    region: string
  }
}

export default function TestRunPage({ params }: { params: { id: string } }) {
  const [execution, setExecution] = useState<TestExecution | null>(null)
  const [expandedSteps, setExpandedSteps] = useState<string[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = useState('development')
  const toast = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedStep, setSelectedStep] = React.useState<string | null>(null)
  const { onCopy, hasCopied } = useClipboard("")

  // Fetch test details
  const { data: test, isLoading: isLoadingTest, error } = useQuery({
    queryKey: ['test', params.id],
    queryFn: () => testsApi.getTest(params.id)
  })

  // Fetch test execution details
  const { data: executionData, isLoading: isLoadingExecution, error: executionError } = useQuery({
    queryKey: ['test-execution', params.id],
    queryFn: () => testsApi.getTestResult(params.id),
    refetchInterval: (data) => 
      data?.status === 'running' || data?.status === 'pending' ? 1000 : false
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
        environment: result.environment,
        config: {
          browser: result.config.browser,
          viewport: result.config.viewport,
          network: result.config.network,
          region: result.config.region,
        }
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
                ...(isCurrent ? [{ timestamp: new Date().toISOString(), level: 'info', message: result.status === 'failed' ? 'Step failed' : 'Step in progress' }] : [])
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

  if (isLoadingTest || isLoadingExecution) {
    return (
      <AppLayout>
        <Box py={8}>
          <LoadingState message="Loading test details..." />
        </Box>
      </AppLayout>
    )
  }

  if (error || executionError) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'blue'
      case 'completed': return 'green'
      case 'failed': return 'red'
      default: return 'gray'
    }
  }

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'In progress...'
    const duration = new Date(end).getTime() - new Date(start).getTime()
    return `${(duration / 1000).toFixed(1)}s`
  }

  return (
    <AppLayout>
      <Box bg="gray.900" minH="calc(100vh - 64px)">
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Grid templateColumns="1fr auto" gap={8} alignItems="center">
              <VStack align="flex-start" spacing={3}>
                <HStack spacing={4}>
                  <Badge
                    colorScheme={getStatusColor(execution.status)}
                    px={3}
                    py={1}
                    borderRadius="full"
                    textTransform="capitalize"
                  >
                    {execution.status}
                  </Badge>
                  <Text color="whiteAlpha.600" fontSize="sm">
                    Started {new Date(execution.startTime).toLocaleTimeString()}
                  </Text>
                  <Text color="whiteAlpha.600" fontSize="sm">
                    Duration: {formatDuration(execution.startTime, execution.endTime)}
                  </Text>
                </HStack>
                <Text color="white" fontSize="2xl" fontWeight="semibold">
                  Test Execution #{params.id}
                </Text>
              </VStack>

              <HStack spacing={4}>
                <Button
                  variant="outline"
                  colorScheme={getStatusColor(execution.status)}
                  size="sm"
                  leftIcon={execution.status === 'running' ? <Icon as={WarningIcon} /> : undefined}
                  isDisabled={execution.status !== 'running'}
                >
                  {execution.status === 'running' ? 'Stop Execution' : 'Rerun Test'}
                </Button>
              </HStack>
            </Grid>

            {/* Main Content */}
            <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={8}>
              {/* Left Panel */}
              <GridItem>
                <Tabs variant="soft-rounded" colorScheme="blue">
                  <TabList mb={4} bg="whiteAlpha.50" p={1} borderRadius="full">
                    <Tab 
                      color="whiteAlpha.600" 
                      _selected={{ 
                        color: 'white',
                        bg: 'whiteAlpha.200'
                      }}
                    >
                      Steps
                    </Tab>
                    <Tab 
                      color="whiteAlpha.600"
                      _selected={{ 
                        color: 'white',
                        bg: 'whiteAlpha.200'
                      }}
                    >
                      Logs
                    </Tab>
                    <Tab 
                      color="whiteAlpha.600"
                      _selected={{ 
                        color: 'white',
                        bg: 'whiteAlpha.200'
                      }}
                    >
                      Raw Output
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* Steps Panel */}
                    <TabPanel p={0}>
                      <VStack spacing={4} align="stretch">
                        {execution.steps.map((step) => (
                          <MotionBox
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Box
                              bg="whiteAlpha.50"
                              borderRadius="lg"
                              p={4}
                              cursor="pointer"
                              onClick={() => setSelectedStep(step.id)}
                              position="relative"
                              _hover={{ bg: 'whiteAlpha.100' }}
                            >
                              <Grid templateColumns="auto 1fr auto" gap={4} alignItems="center">
                                <Box>
                                  {step.status === 'running' ? (
                                    <Progress
                                      size="xs"
                                      isIndeterminate
                                      colorScheme="blue"
                                      width="24px"
                                    />
                                  ) : (
                                    <Badge
                                      colorScheme={getStatusColor(step.status)}
                                      variant="subtle"
                                    >
                                      {step.status}
                                    </Badge>
                                  )}
                                </Box>

                                <VStack align="flex-start" spacing={1}>
                                  <Text color="white" fontWeight="medium">
                                    {step.action}
                                  </Text>
                                  <Text color="whiteAlpha.600" fontSize="sm">
                                    {step.expected}
                                  </Text>
                                </VStack>

                                <Text color="whiteAlpha.400" fontSize="sm">
                                  {step.endTime ? formatDuration(step.startTime!, step.endTime) : ''}
                                </Text>
                              </Grid>

                              {selectedStep === step.id && (
                                <Box mt={4}>
                                  <Divider mb={4} />
                                  <VStack align="stretch" spacing={4}>
                                    {step.logs.map((log, index) => (
                                      <Text
                                        key={index}
                                        color={log.level === 'error' ? 'red.300' : 'whiteAlpha.800'}
                                        fontSize="sm"
                                        fontFamily="mono"
                                      >
                                        {log.message}
                                      </Text>
                                    ))}
                                    {step.screenshot && (
                                      <Box
                                        mt={2}
                                        borderRadius="md"
                                        overflow="hidden"
                                        border="1px"
                                        borderColor="whiteAlpha.200"
                                      >
                                        <img src={step.screenshot} alt="Step screenshot" />
                                      </Box>
                                    )}
                                  </VStack>
                                </Box>
                              )}
                            </Box>
                          </MotionBox>
                        ))}
                      </VStack>
                    </TabPanel>

                    {/* Logs Panel */}
                    <TabPanel p={0}>
                      <Box
                        bg="gray.800"
                        borderRadius="lg"
                        p={4}
                        fontFamily="mono"
                        fontSize="sm"
                        color="whiteAlpha.800"
                        maxH="600px"
                        overflowY="auto"
                      >
                        {execution.steps.flatMap(step => step.logs).map((log, index) => (
                          <Text
                            key={index}
                            color={log.level === 'error' ? 'red.300' : 'whiteAlpha.800'}
                            mb={2}
                          >
                            <Text as="span" color="whiteAlpha.400">
                              {new Date(log.timestamp).toLocaleTimeString()} 
                            </Text>
                            {' '}
                            {log.message}
                          </Text>
                        ))}
                      </Box>
                    </TabPanel>

                    {/* Raw Output Panel */}
                    <TabPanel p={0}>
                      <Box position="relative">
                        <Button
                          size="xs"
                          position="absolute"
                          top={2}
                          right={2}
                          onClick={onCopy}
                          leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                        >
                          {hasCopied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Code
                          display="block"
                          whiteSpace="pre"
                          p={4}
                          borderRadius="lg"
                          bg="gray.800"
                          color="whiteAlpha.800"
                          fontSize="sm"
                          maxH="600px"
                          overflowY="auto"
                        >
                          {JSON.stringify(execution, null, 2)}
                        </Code>
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </GridItem>

              {/* Right Panel - Environment & Config */}
              <GridItem>
                <VStack spacing={6} align="stretch">
                  <Box bg="whiteAlpha.50" borderRadius="lg" p={6}>
                    <Text color="white" fontWeight="semibold" mb={4}>
                      Environment
                    </Text>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text color="whiteAlpha.600">Browser</Text>
                        <Text color="white">{execution.config.browser}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="whiteAlpha.600">Viewport</Text>
                        <Text color="white">{execution.config.viewport}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="whiteAlpha.600">Network</Text>
                        <Text color="white">{execution.config.network}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="whiteAlpha.600">Region</Text>
                        <Text color="white">{execution.config.region}</Text>
                      </HStack>
                    </VStack>
                  </Box>

                  <Box bg="whiteAlpha.50" borderRadius="lg" p={6}>
                    <Text color="white" fontWeight="semibold" mb={4}>
                      Test Progress
                    </Text>
                    <VStack align="stretch" spacing={4}>
                      <Progress
                        value={(execution.currentStep / execution.steps.length) * 100}
                        size="sm"
                        colorScheme={getStatusColor(execution.status)}
                        borderRadius="full"
                      />
                      <HStack justify="space-between">
                        <Text color="whiteAlpha.600">Steps</Text>
                        <Text color="white">
                          {execution.currentStep} / {execution.steps.length}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="whiteAlpha.600">Success Rate</Text>
                        <Text color="white">
                          {Math.round((execution.steps.filter(s => s.status === 'passed').length / execution.steps.length) * 100)}%
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                </VStack>
              </GridItem>
            </Grid>
          </VStack>
        </Container>
      </Box>
    </AppLayout>
  )
} 