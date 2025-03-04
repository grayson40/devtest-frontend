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
  Image,
  Stack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  RepeatIcon, 
  CheckIcon, 
  CopyIcon, 
  WarningIcon, 
  DownloadIcon, 
  ExternalLinkIcon, 
  ChevronLeftIcon,
  SettingsIcon,
} from '@chakra-ui/icons'
import { FaChrome, FaFirefox, FaSafari, FaEdge } from 'react-icons/fa'
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
  const [selectedBrowsers, setSelectedBrowsers] = React.useState(['chrome'])
  const toast = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedStep, setSelectedStep] = React.useState<string | null>(null)
  const { onCopy, hasCopied } = useClipboard('')
  const [isExporting, setIsExporting] = React.useState(false)
  const { isOpen: isConfigOpen, onOpen: onConfigOpen, onClose: onConfigClose } = useDisclosure()
  const { isOpen: isScreenshotOpen, onOpen: onScreenshotOpen, onClose: onScreenshotClose } = useDisclosure()
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)

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

  const startExecution = async () => {
    if (selectedBrowsers.length === 0) {
      toast({
        title: 'No browsers selected',
        description: 'Please select at least one browser for test execution',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    try {
      const promises = selectedBrowsers.map(browser => 
        testsApi.executeTest(params.id, `${selectedEnvironment}-${browser}`)
      )
      await Promise.all(promises)
      queryClient.invalidateQueries({ queryKey: ['results', params.id] })
      toast({
        title: 'Test execution started',
        description: `Running tests on ${selectedBrowsers.length} browser${selectedBrowsers.length > 1 ? 's' : ''}`,
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

  const getBrowserIcon = (browser: string) => {
    switch (browser.toLowerCase()) {
      case 'chrome': return FaChrome
      case 'firefox': return FaFirefox
      case 'safari': return FaSafari
      case 'edge': return FaEdge
      default: return FaChrome
    }
  }

  if (error || executionError) return <ErrorState />

    return (
      <ProtectedRoute>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" mb={4}>
            <Button
              leftIcon={<ChevronLeftIcon />}
              variant="ghost"
              onClick={() => router.push(`/tests/${params.id}`)}
            >
              Back to Test Details
            </Button>
            <HStack>
              <Button
                leftIcon={<SettingsIcon />}
                variant="outline"
                onClick={onConfigOpen}
              >
                Configure
              </Button>
              <Button
                colorScheme="blue"
                leftIcon={<RepeatIcon />}
                onClick={startExecution}
                isLoading={execution?.status === 'running'}
                loadingText="Running Test"
              >
                Run Test
              </Button>
            </HStack>
          </HStack>

          {/* Test Information */}
          <Card>
            <CardBody>
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem>
                  <VStack align="stretch" spacing={4}>
                    <Heading size="md">{test?.title || 'Loading...'}</Heading>
                    <Text color="gray.600">{test?.description}</Text>
                    <HStack>
                      <Text fontWeight="bold">Environment:</Text>
                      <Badge colorScheme="purple">{selectedEnvironment}</Badge>
                    </HStack>
                  </VStack>
                </GridItem>
          <GridItem>
                  <VStack align="stretch" spacing={4}>
                    <Heading size="sm">Selected Browsers</Heading>
                    <Flex gap={2} wrap="wrap">
                      {selectedBrowsers.map(browser => (
                        <Badge
                          key={browser}
                          colorScheme="blue"
                          p={2}
                          borderRadius="md"
                        >
                          <HStack spacing={2}>
                            <Icon as={getBrowserIcon(browser)} />
                            <Text>{browser}</Text>
                          </HStack>
                        </Badge>
                      ))}
                    </Flex>
                  </VStack>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Test Execution Progress */}
          {execution && (
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="sm">Test Execution Progress</Heading>
                    <Badge
                      colorScheme={
                        execution.status === 'completed'
                          ? 'green'
                          : execution.status === 'failed'
                          ? 'red'
                          : execution.status === 'running'
                          ? 'blue'
                          : 'gray'
                      }
                    >
                      {execution.status.toUpperCase()}
                    </Badge>
                  </HStack>
                  <Progress
                    value={(execution.currentStep / execution.steps.length) * 100}
                    size="sm"
                    colorScheme={
                      execution.status === 'completed'
                        ? 'green'
                        : execution.status === 'failed'
                        ? 'red'
                        : 'blue'
                    }
                    isIndeterminate={execution.status === 'running'}
                  />
                  
                  {/* Test Steps */}
                  <VStack spacing={2} align="stretch">
                    {execution.steps.map((step, index) => (
                      <Card
                        key={step.id}
                        variant="outline"
                        bg={step.status === 'failed' ? 'red.50' : 'white'}
                      >
                        <CardBody>
                          <VStack spacing={2} align="stretch">
                            <HStack justify="space-between">
                              <HStack>
                                <Badge
                                  colorScheme={
                                    step.status === 'passed'
                                      ? 'green'
                                      : step.status === 'failed'
                                      ? 'red'
                                      : step.status === 'running'
                                      ? 'blue'
                                      : 'gray'
                                  }
                                >
                                  Step {index + 1}
                                </Badge>
                                <Text fontWeight="medium">{step.action}</Text>
                              </HStack>
                              <HStack>
                                {step.screenshot && (
                                  <IconButton
                                    aria-label="View Screenshot"
                                    icon={<ExternalLinkIcon />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedScreenshot(step.screenshot!)
                                      onScreenshotOpen()
                                    }}
                                  />
                                )}
                                <IconButton
                                  aria-label="Toggle Step Details"
                                  icon={
                                    expandedSteps.includes(step.id) ? (
                                      <ChevronUpIcon />
                                    ) : (
                                      <ChevronDownIcon />
                                    )
                                  }
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleStepExpansion(step.id)}
                                />
                              </HStack>
                            </HStack>

                            <Collapse in={expandedSteps.includes(step.id)}>
                              <VStack spacing={3} align="stretch" mt={2}>
                                <Box>
                                  <Text fontSize="sm" color="gray.600">
                                    Expected Result
                                  </Text>
                                  <Text>{step.expected}</Text>
                              </Box>

                                {step.logs.length > 0 && (
                                  <Box>
                                    <Text fontSize="sm" color="gray.600">
                                      Logs
                                    </Text>
                                    <Code p={2} borderRadius="md">
                                      {step.logs.map((log, i) => (
                                        <Text key={i} fontSize="sm">
                                          [{log.timestamp}] {log.message}
                                        </Text>
                                      ))}
                                    </Code>
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

      {/* Configuration Modal */}
      <Modal isOpen={isConfigOpen} onClose={onConfigClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Test Configuration</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Environment</FormLabel>
                <Select
                  value={selectedEnvironment}
                  onChange={(e) => setSelectedEnvironment(e.target.value)}
                >
                  <option value="local">Local</option>
                  <option value="dev">Development</option>
                  <option value="staging">Staging</option>
                  <option value="prod">Production</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Browsers</FormLabel>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  {['chrome', 'firefox', 'safari', 'edge'].map(browser => (
                    <Button
                      key={browser}
                      variant={selectedBrowsers.includes(browser) ? 'solid' : 'outline'}
                      colorScheme={selectedBrowsers.includes(browser) ? 'blue' : 'gray'}
                      leftIcon={<Icon as={getBrowserIcon(browser)} />}
                      onClick={() => {
                        setSelectedBrowsers(prev =>
                          prev.includes(browser)
                            ? prev.filter(b => b !== browser)
                            : [...prev, browser]
                        )
                      }}
                    >
                      {browser.charAt(0).toUpperCase() + browser.slice(1)}
                    </Button>
                  ))}
                </Grid>
              </FormControl>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Screenshot Modal */}
      <Modal isOpen={isScreenshotOpen} onClose={onScreenshotClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Screenshot</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedScreenshot && (
              <Image
                src={selectedScreenshot}
                alt="Test Step Screenshot"
                w="100%"
                borderRadius="md"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </ProtectedRoute>
  )
} 