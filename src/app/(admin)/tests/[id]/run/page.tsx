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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Spinner,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon, RepeatIcon, CheckIcon, CopyIcon, WarningIcon, DownloadIcon, ExternalLinkIcon, ChevronLeftIcon } from '@chakra-ui/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testsApi, TestResult } from '@/api/tests'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ErrorState, LoadingState } from '@/components/common'
import { motion } from 'framer-motion'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

const MotionBox = motion(Box)

interface LogEntry {
  message: string
  level: 'info' | 'error' | 'warning' | 'debug'
  timestamp: string
}

interface TestExecutionStep {
  id: string
  action: string
  expected: string
  status: 'running' | 'passed' | 'failed' | 'pending'
  startTime?: string
  endTime?: string
  logs: LogEntry[]
  screenshot?: string
}

interface TestExecution {
  id: string
  testCase: string
  status: 'running' | 'completed' | 'failed' | 'pending'
  startTime: string
  endTime?: string
  steps: TestExecutionStep[]
  currentStep: number
  config: {
    browser: string
    viewport: string
    network: string
    region: string
  }
}

// Extend the TestResult interface from the API to match our needs
interface ExtendedTestResult {
  id: string;
  testCase: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  steps: TestExecutionStep[];
  currentStep: number;
  config: {
    browser: string;
    viewport: string;
    network: string;
    region: string;
  };
  environment?: string;
  duration?: number;
  startTime: string;
  endTime?: string;
}

export default function TestRunPage({ params }: { params: { id: string } }) {
  const [execution, setExecution] = useState<TestExecution | null>(null)
  const [expandedSteps, setExpandedSteps] = useState<string[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = React.useState('cloud')
  const toast = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedStep, setSelectedStep] = React.useState<string | null>(null)
  const { onCopy, hasCopied } = useClipboard('')
  const [isExporting, setIsExporting] = React.useState(false)

  // Get test details
  const { data: test, error } = useQuery({
    queryKey: ['tests', params.id],
    queryFn: () => testsApi.getTest(params.id),
  })

  // Get test execution results with polling for updates
  const { data: executionData, error: executionError } = useQuery({
    queryKey: ['results', params.id],
    queryFn: async () => {
      const result = await testsApi.getTestResult(params.id);
      // Convert API result to our extended format
      return {
        ...result,
        steps: [], // We'll populate this from screenshots or other data
        currentStep: 0,
        config: {
          browser: 'chrome',
          viewport: '1280x720',
          network: 'broadband',
          region: 'us-east'
        }
      } as ExtendedTestResult;
    },
    refetchInterval: (query) => {
      // Poll every 5 seconds if the test is still running
      const data = query.state.data;
      return data && data.status === 'running' ? 5000 : false;
    },
    initialData: {
      id: params.id,
      testCase: params.id,
      status: 'pending',
      startTime: new Date().toISOString(),
      steps: [],
      currentStep: 0,
      environment: 'default',
      duration: 0,
      config: {
        browser: 'chrome',
        viewport: '1280x720',
        network: 'broadband',
        region: 'us-east'
      }
    } as ExtendedTestResult
  })

  // Update execution state when executionData changes
  useEffect(() => {
    if (executionData) {
      setExecution({
        id: executionData.id,
        testCase: executionData.testCase,
        status: executionData.status as 'running' | 'completed' | 'failed' | 'pending',
        startTime: executionData.startTime,
        endTime: executionData.endTime,
        steps: executionData.steps || [],
        currentStep: executionData.currentStep || 0,
        config: executionData.config || {
          browser: 'chrome',
          viewport: '1280x720',
          network: 'broadband',
          region: 'us-east'
        }
      });
    }
  }, [executionData]);

  // Start test execution
  const startExecution = async () => {
    try {
      await testsApi.executeTest(params.id, selectedEnvironment)
      queryClient.invalidateQueries({ queryKey: ['results', params.id] })
      toast({
        title: 'Test execution started',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Failed to start test execution',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const handleViewResults = () => {
    if (execution?.id) {
      router.push(`/tests/${params.id}/results/${execution.id}`)
    }
  }

  // Export test results to different formats
  const exportResults = async (format: 'practitest' | 'json' | 'csv') => {
    setIsExporting(true)
    try {
      // Simulate export functionality
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      let message = '';
      switch (format) {
        case 'practitest':
          message = 'Test results exported to Practitest successfully';
          break;
        case 'json':
          message = 'Test results exported as JSON';
          break;
        case 'csv':
          message = 'Test results exported as CSV';
          break;
      }
      
      toast({
        title: 'Export successful',
        description: message,
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (error || executionError) {
    return (
      <ProtectedRoute>
        <VStack spacing={6} align="stretch" w="full">
          <Box px={8}>
            <Button
              as={Link}
              href={`/tests/${params.id}`}
              size="sm"
              leftIcon={<ChevronLeftIcon />}
              variant="outline"
              mb={4}
            >
              Back to Test Case
            </Button>

            <Flex justify="space-between" align="center" mb={6}>
              <Box>
                <Heading size="lg" mb={1}>Test Execution</Heading>
                <Text color="gray.600">
                  {executionError instanceof Error ? executionError.message : 'Failed to load test'}
                </Text>
              </Box>
              <Button
                leftIcon={<RepeatIcon />}
                colorScheme="blue"
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['tests', params.id] })}
              >
                Retry
              </Button>
            </Flex>
          </Box>
        </VStack>
      </ProtectedRoute>
    )
  }

  if (!test) {
    return (
      <ProtectedRoute>
        <VStack spacing={6} align="stretch" w="full">
          <Box px={8}>
            <Button
              as={Link}
              href={`/tests/${params.id}`}
              size="sm"
              leftIcon={<ChevronLeftIcon />}
              variant="outline"
              mb={4}
            >
              Back to Test Case
            </Button>

            <Flex justify="space-between" align="center" mb={6}>
              <Box>
                <Heading size="lg" mb={1}>Test Execution</Heading>
                <Text color="gray.600">
                  Test not found
                </Text>
              </Box>
            </Flex>
          </Box>
        </VStack>
      </ProtectedRoute>
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

  // Render a loading state if execution is null
  if (!execution) {
    return (
      <ProtectedRoute>
        <VStack spacing={6} align="stretch" w="full">
          <Box p={8}>
            <Heading size="lg" mb={4}>Test Execution</Heading>
              <LoadingState message="Loading test execution..." />
            </Box>
          </VStack>
        </ProtectedRoute>
      );
  }

  return (
    <ProtectedRoute>
      <VStack spacing={6} align="stretch" w="full">
        <Box px={8}>
          <Button
            as={Link}
            href={`/tests/${params.id}`}
            size="sm"
            leftIcon={<ChevronLeftIcon />}
            variant="outline"
            mb={4}
          >
            Back to Test Case
          </Button>

          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Heading size="lg" mb={1}>Test Execution</Heading>
              <Text color="gray.600">
                {execution.status === 'running' ? 'Loading test details...' : `Running test: ${test.title || 'Unknown Test'}`}
              </Text>
            </Box>
            <HStack>
              {/* Export button with dropdown */}
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  leftIcon={<DownloadIcon />}
                  variant="outline"
                  size="sm"
                  isLoading={isExporting}
                >
                  Export
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => exportResults('practitest')}>
                    Export to PractiTest
                  </MenuItem>
                  <MenuItem onClick={() => exportResults('json')}>
                    Export as JSON
                  </MenuItem>
                  <MenuItem onClick={() => exportResults('csv')}>
                    Export as CSV
                  </MenuItem>
                </MenuList>
              </Menu>

              <Button
                leftIcon={<RepeatIcon />}
                colorScheme="blue"
                size="sm"
                onClick={startExecution}
                isLoading={false}
                isDisabled={execution?.status === 'running'}
              >
                {execution?.status === 'running' ? 'Running...' : 'Run Test'}
              </Button>
            </HStack>
          </Flex>
        </Box>

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
                    {execution.steps.length === 0 ? (
                      <Box 
                        bg="whiteAlpha.50" 
                        borderRadius="lg" 
                        p={8} 
                        textAlign="center"
                      >
                        <VStack spacing={4}>
                          <Text color="whiteAlpha.800">
                            {execution.status === 'pending' 
                              ? 'Test execution has not started yet' 
                              : 'No steps available for this test'}
                          </Text>
                          {execution.status === 'pending' && (
                            <Button 
                              colorScheme="blue" 
                              onClick={startExecution}
                              leftIcon={<Icon as={RepeatIcon} />}
                            >
                              Start Execution
                            </Button>
                          )}
                        </VStack>
                      </Box>
                    ) : (
                      execution.steps.map((step) => (
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
                            onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                            position="relative"
                            _hover={{ bg: 'whiteAlpha.100' }}
                            borderLeft="4px solid"
                            borderLeftColor={
                              step.status === 'passed' ? 'green.400' :
                              step.status === 'failed' ? 'red.400' :
                              step.status === 'running' ? 'blue.400' : 'gray.400'
                            }
                          >
                            <Grid templateColumns="auto 1fr auto" gap={4} alignItems="center">
                              <Box>
                                {step.status === 'running' ? (
                                  <Spinner
                                    size="sm"
                                    color="blue.400"
                                    thickness="2px"
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
                                  {step.logs.length > 0 ? (
                                    step.logs.map((log, index) => (
                                      <Text
                                        key={index}
                                        color={log.level === 'error' ? 'red.300' : 'whiteAlpha.800'}
                                        fontSize="sm"
                                        fontFamily="mono"
                                      >
                                        {log.message}
                                      </Text>
                                    ))
                                  ) : (
                                    <Text color="whiteAlpha.600" fontSize="sm">
                                      No logs available for this step
                                    </Text>
                                  )}
                                  {step.screenshot ? (
                                    <Box
                                      mt={2}
                                      borderRadius="md"
                                      overflow="hidden"
                                      border="1px"
                                      borderColor="whiteAlpha.200"
                                    >
                                      <img src={step.screenshot} alt="Step screenshot" />
                                    </Box>
                                  ) : (
                                    <Text color="whiteAlpha.600" fontSize="sm">
                                      No screenshot available for this step
                                    </Text>
                                  )}
                                </VStack>
                              </Box>
                            )}
                          </Box>
                        </MotionBox>
                      ))
                    )}
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
                    {execution.steps.flatMap(step => step.logs).length > 0 ? (
                      execution.steps.flatMap(step => step.logs).map((log, index) => (
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
                      ))
                    ) : (
                      <Text color="whiteAlpha.600" textAlign="center" py={4}>
                        No logs available yet
                      </Text>
                    )}
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
                    value={(execution.currentStep / Math.max(execution.steps.length, 1)) * 100}
                    size="sm"
                    colorScheme={getStatusColor(execution.status)}
                    borderRadius="full"
                    isIndeterminate={execution.status === 'running' && execution.steps.length === 0}
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
                      {execution.steps.length > 0 
                        ? Math.round((execution.steps.filter(s => s.status === 'passed').length / execution.steps.length) * 100)
                        : 0}%
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              <Box bg="whiteAlpha.50" borderRadius="lg" p={6}>
                <Text color="white" fontWeight="semibold" mb={4}>
                  Export Options
                </Text>
                <VStack align="stretch" spacing={3}>
                  <Button 
                    size="sm" 
                    leftIcon={<DownloadIcon />}
                    justifyContent="flex-start"
                    variant="ghost"
                    onClick={() => exportResults('practitest')}
                    isLoading={isExporting}
                  >
                    Export to Practitest
                  </Button>
                  <Button 
                    size="sm" 
                    leftIcon={<DownloadIcon />}
                    justifyContent="flex-start"
                    variant="ghost"
                    onClick={() => exportResults('json')}
                    isLoading={isExporting}
                  >
                    Export as JSON
                  </Button>
                  <Button 
                    size="sm" 
                    leftIcon={<DownloadIcon />}
                    justifyContent="flex-start"
                    variant="ghost"
                    onClick={() => exportResults('csv')}
                    isLoading={isExporting}
                  >
                    Export as CSV
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </ProtectedRoute>
  )
} 