'use client'

import React, { useState } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Card, 
  CardBody, 
  VStack, 
  Textarea, 
  Button, 
  useToast, 
  Progress,
  FormControl,
  FormLabel,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  Icon,
  Grid,
  GridItem,
  Divider,
  useClipboard,
  Flex,
  Badge,
  Collapse,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { SimpleLayout } from '@/components/layout'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { testsApi } from '@/api/tests'
import { FiClipboard, FiCheckCircle, FiChevronDown, FiChevronUp, FiPlay, FiInfo } from 'react-icons/fi'
import { useAuth } from '@/context/AuthContext'
import { AuthModal } from '@/components/auth/AuthModal'

export default function ImportPage() {
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [isValidating, setIsValidating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewSteps, setPreviewSteps] = useState<any[]>([])
  const [showHelp, setShowHelp] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')
  const [previewTab, setPreviewTab] = useState<'steps' | 'logs' | 'code'>('steps')
  const [isRunningDemo, setIsRunningDemo] = useState(false)
  const [demoProgress, setDemoProgress] = useState(0)
  const [demoLogs, setDemoLogs] = useState<Array<{message: string, level: 'info' | 'error' | 'warning' | 'debug', timestamp: string}>>([])
  const { onCopy, hasCopied } = useClipboard("")
  const toast = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const exampleHtml = `<html>
  <head>
    <title>Scribe Recording</title>
  </head>
  <body>
    <div class="scribe-title">Login to Example App</div>
    <div class="scribe-step" data-step="1">
      <div class="scribe-action">Navigate to https://example.com</div>
    </div>
    <div class="scribe-step" data-step="2">
      <div class="scribe-action">Click on login button</div>
      <div class="scribe-selector">#login-button</div>
    </div>
    <div class="scribe-step" data-step="3">
      <div class="scribe-action">Fill username field</div>
      <div class="scribe-selector">#username</div>
      <div class="scribe-value">testuser</div>
    </div>
    <div class="scribe-step" data-step="4">
      <div class="scribe-action">Fill password field</div>
      <div class="scribe-selector">#password</div>
      <div class="scribe-value">********</div>
    </div>
    <div class="scribe-step" data-step="5">
      <div class="scribe-action">Click submit button</div>
      <div class="scribe-selector">#submit</div>
    </div>
  </body>
</html>`

  const createTestMutation = useMutation({
    mutationFn: async (data: {
      html: string
    }) => {
      const response = await testsApi.createTest(data)
      return response
    },
    onSuccess: (test) => {
      toast({
        title: 'Test created',
        description: 'Successfully created test case',
        status: 'success',
        duration: 3000,
      })
      router.push(`/tests/${test.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Error creating test',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      })
    }
  })

  const validateHtml = (content: string) => {
    if (!content) return false
    return content.includes('class="scribe-step"')
  }

  const parseScribeHtml = (content: string) => {
    // Simple parser for demo purposes
    const steps = []
    const stepRegex = /<div class="scribe-step"[^>]*>([\s\S]*?)<\/div>/g
    const actionRegex = /<div class="scribe-action">([\s\S]*?)<\/div>/
    const selectorRegex = /<div class="scribe-selector">([\s\S]*?)<\/div>/
    const valueRegex = /<div class="scribe-value">([\s\S]*?)<\/div>/
    
    let match
    while ((match = stepRegex.exec(content)) !== null) {
      const stepContent = match[1]
      const action = actionRegex.exec(stepContent)?.[1] || ''
      const selector = selectorRegex.exec(stepContent)?.[1] || ''
      const value = valueRegex.exec(stepContent)?.[1] || ''
      
      steps.push({
        action,
        selector,
        value
      })
    }
    
    return steps
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const content = e.clipboardData.getData('text')
    setHtmlContent(content)
    processHtmlContent(content)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setHtmlContent(content)
  }

  const processHtmlContent = async (content: string) => {
    setIsValidating(true)

    try {
      if (!validateHtml(content)) {
        toast({
          title: 'Invalid Scribe content',
          description: 'Please copy the complete content from your Scribe recording',
          status: 'error',
          duration: 5000,
        })
        setIsValidating(false)
        return
      }

      // Parse the HTML to extract steps
      const steps = parseScribeHtml(content)
      setPreviewSteps(steps)
      
      // Simulate validation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Show preview instead of creating test immediately
      setShowPreview(true)
      setIsValidating(false)
    } catch (error) {
      toast({
        title: 'Error processing content',
        description: 'Failed to process Scribe content. Please try again.',
        status: 'error',
        duration: 5000,
      })
      setIsValidating(false)
    }
  }

  const handleCreateTest = async () => {
    if (!user) {
      setAuthMode('signup')
      setShowAuth(true)
      return
    }
    
    try {
      await createTestMutation.mutateAsync({ html: htmlContent })
    } catch (error) {
      toast({
        title: 'Error creating test',
        description: 'Failed to create test. Please try again.',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleUseExample = () => {
    setHtmlContent(exampleHtml)
    onCopy()
    processHtmlContent(exampleHtml)
  }

  const runDemoTest = () => {
    if (isRunningDemo) return;
    
    setIsRunningDemo(true);
    setDemoProgress(0);
    setDemoLogs([]);
    
    // Simulate test execution with logs
    const totalSteps = previewSteps.length;
    let currentStep = 0;
    
    const addLog = (message: string, level: 'info' | 'error' | 'warning' | 'debug' = 'info') => {
      setDemoLogs(prev => [...prev, {
        message,
        level,
        timestamp: new Date().toISOString()
      }]);
    };
    
    addLog('Initializing browser session...', 'info');
    
    const interval = setInterval(() => {
      if (currentStep < totalSteps) {
        const step = previewSteps[currentStep];
        const progress = Math.round(((currentStep + 1) / totalSteps) * 100);
        
        setDemoProgress(progress);
        
        // Add logs based on the step type
        addLog(`Executing step ${currentStep + 1}: ${step.action}`, 'info');
        
        if (step.selector) {
          addLog(`Looking for element: ${step.selector}`, 'debug');
          
          // Randomly add some waiting logs
          if (Math.random() > 0.7) {
            addLog(`Waiting for element to be visible: ${step.selector}`, 'debug');
          }
        }
        
        if (step.value) {
          addLog(`Input value: ${step.value}`, 'debug');
        }
        
        // Randomly add some warnings
        if (Math.random() > 0.8) {
          addLog('Element took longer than expected to respond', 'warning');
        }
        
        // Add success log
        addLog(`Successfully completed step ${currentStep + 1}`, 'info');
        
        currentStep++;
      } else {
        clearInterval(interval);
        addLog('Test execution completed successfully!', 'info');
        setIsRunningDemo(false);
      }
    }, 1500);
    
    return () => clearInterval(interval);
  };

  const generatePlaywrightCode = (steps: any[]) => {
    return `import { test, expect } from '@playwright/test';

test('${steps.length > 0 && steps[0].action ? steps[0].action.split(' ').slice(1).join(' ') : "Test scenario"}', async ({ page }) => {
  // Test generated from Scribe recording
${steps.map((step, index) => {
  if (step.action.toLowerCase().includes('navigate')) {
    return `  await page.goto('${step.value || 'https://example.com'}');`;
  } else if (step.action.toLowerCase().includes('click')) {
    return `  await page.click('${step.selector || 'button'}');`;
  } else if (step.action.toLowerCase().includes('fill')) {
    return `  await page.fill('${step.selector || 'input'}', '${step.value || ''}');`;
  } else {
    return `  // Step ${index + 1}: ${step.action}`;
  }
}).join('\n')}
});`;
  };

  const generatePractiTestFormat = (steps: any[]) => {
    return steps.map((step, index) => {
      return {
        "step_number": index + 1,
        "description": step.action,
        "expected_results": `Element ${step.selector || ''} should respond as expected`,
        "actual_results": "",
        "status": "PASSED"
      };
    });
  };

  const renderHelpSection = () => (
    <Collapse in={showHelp} animateOpacity>
      <Box bg="blue.50" p={4} borderRadius="md" mt={4}>
        <Text fontSize="sm" fontWeight="medium" color="blue.800" mb={2}>
          How to get your Scribe HTML:
        </Text>
        <VStack align="stretch" spacing={2}>
          <Text fontSize="xs" color="blue.700">
            1. Create a recording in Scribe (Chrome extension)
          </Text>
          <Text fontSize="xs" color="blue.700">
            2. Click "Export" in the Scribe editor
          </Text>
          <Text fontSize="xs" color="blue.700">
            3. Select "HTML" as the export format
          </Text>
          <Text fontSize="xs" color="blue.700">
            4. Copy the HTML content and paste it here
          </Text>
        </VStack>
        <Divider my={3} borderColor="blue.200" />
        <Text fontSize="xs" color="blue.600">
          Don't have Scribe? <Button variant="link" size="xs" color="blue.500" onClick={handleUseExample}>Use our example</Button> to see how it works.
        </Text>
      </Box>
    </Collapse>
  )

  // Preview mode UI
  if (showPreview) {
    return (
      <SimpleLayout>
        <VStack spacing={6} align="stretch">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href="/import" onClick={() => setShowPreview(false)}>Import Test</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Preview</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="lg">Test Preview</Heading>
              <Text color="gray.600">
                Review your test before creating it
              </Text>
            </Box>
            <HStack>
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(false)}
              >
                Edit
              </Button>
              <Button 
                colorScheme="primary"
                leftIcon={<Icon as={FiPlay} />}
                onClick={handleCreateTest}
                isLoading={createTestMutation.isPending}
              >
                Create Test
              </Button>
            </HStack>
          </Flex>

          <Tabs variant="enclosed" colorScheme="primary" onChange={(index) => {
            setPreviewTab(['steps', 'logs', 'code'][index] as 'steps' | 'logs' | 'code');
          }}>
            <TabList>
              <Tab>Test Steps</Tab>
              <Tab>Execution Logs</Tab>
              <Tab>Generated Code</Tab>
            </TabList>
            <TabPanels>
              {/* Test Steps Panel */}
              <TabPanel p={4}>
                <VStack spacing={4} align="stretch">
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Test Preview</AlertTitle>
                      <AlertDescription>
                        We've parsed your Scribe recording and created the following test steps.
                        {!user && " Sign up to save this test and run it in our cloud environment."}
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <Box>
                    <VStack spacing={3} align="stretch">
                      {previewSteps.map((step, index) => (
                        <Box 
                          key={index} 
                          p={3} 
                          borderWidth="1px" 
                          borderRadius="md"
                          borderColor="gray.200"
                          bg="gray.50"
                        >
                          <HStack mb={1}>
                            <Badge colorScheme="blue">Step {index + 1}</Badge>
                            <Text fontWeight="medium">{step.action}</Text>
                          </HStack>
                          {step.selector && (
                            <Text fontSize="sm" color="gray.600">
                              Selector: <Text as="span" fontFamily="mono" fontSize="xs">{step.selector}</Text>
                            </Text>
                          )}
                          {step.value && (
                            <Text fontSize="sm" color="gray.600">
                              Value: <Text as="span" fontFamily="mono" fontSize="xs">{step.value}</Text>
                            </Text>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Execution Logs Panel */}
              <TabPanel p={4}>
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="medium">Test Execution Logs</Text>
                    <Button 
                      size="sm" 
                      leftIcon={<Icon as={FiPlay} />} 
                      colorScheme="primary" 
                      isLoading={isRunningDemo}
                      loadingText="Running..."
                      onClick={runDemoTest}
                      isDisabled={isRunningDemo}
                    >
                      Run Demo Test
                    </Button>
                  </Flex>

                  {isRunningDemo && (
                    <Box mb={4}>
                      <Text fontSize="sm" mb={1}>Progress: {demoProgress}%</Text>
                      <Progress value={demoProgress} size="sm" colorScheme="primary" borderRadius="full" />
                    </Box>
                  )}

                  <Box 
                    borderWidth="1px" 
                    borderRadius="md" 
                    p={3} 
                    bg="gray.900" 
                    color="gray.100"
                    fontFamily="mono"
                    fontSize="xs"
                    height="400px"
                    overflowY="auto"
                  >
                    {demoLogs.length > 0 ? (
                      demoLogs.map((log, index) => (
                        <Text 
                          key={index} 
                          color={
                            log.level === 'error' ? 'red.300' : 
                            log.level === 'warning' ? 'yellow.300' : 
                            log.level === 'debug' ? 'gray.400' : 
                            'green.300'
                          }
                          mb={1}
                        >
                          [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                        </Text>
                      ))
                    ) : (
                      <VStack spacing={4} justify="center" height="100%">
                        <Text color="gray.500">Click "Run Demo Test" to see execution logs</Text>
                      </VStack>
                    )}
                  </Box>

                  {!user && (
                    <Alert status="warning" variant="subtle" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Demo Mode</AlertTitle>
                        <AlertDescription>
                          This is a simulated test run. Sign up to run real tests in our cloud environment.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              {/* Generated Code Panel */}
              <TabPanel p={4}>
                <VStack spacing={4} align="stretch">
                  <Tabs variant="soft-rounded" colorScheme="blue" size="sm">
                    <TabList>
                      <Tab>Playwright</Tab>
                      <Tab>PractiTest Format</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel p={0} pt={4}>
                        <Box position="relative">
                          <Box 
                            borderWidth="1px" 
                            borderRadius="md" 
                            p={3} 
                            bg="gray.900" 
                            color="gray.100"
                            fontFamily="mono"
                            fontSize="xs"
                            height="400px"
                            overflowY="auto"
                            filter={!user ? "blur(3px)" : "none"}
                            userSelect={!user ? "none" : "auto"}
                          >
                            <pre>{generatePlaywrightCode(previewSteps)}</pre>
                          </Box>
                          
                          {!user && (
                            <Box 
                              position="absolute" 
                              top="0" 
                              left="0" 
                              right="0" 
                              bottom="0" 
                              display="flex" 
                              alignItems="center" 
                              justifyContent="center"
                              zIndex={2}
                            >
                              <VStack spacing={3} bg="white" p={4} borderRadius="md" boxShadow="lg">
                                <Icon as={FiPlay} boxSize={8} color="primary.500" />
                                <Text fontWeight="medium">Sign up to access generated code</Text>
                                <Button 
                                  colorScheme="primary" 
                                  size="sm"
                                  onClick={() => {
                                    setAuthMode('signup');
                                    setShowAuth(true);
                                  }}
                                >
                                  Sign Up Now
                                </Button>
                              </VStack>
                            </Box>
                          )}
                        </Box>
                      </TabPanel>
                      <TabPanel p={0} pt={4}>
                        <Box position="relative">
                          <Box 
                            borderWidth="1px" 
                            borderRadius="md" 
                            p={3} 
                            bg="gray.900" 
                            color="gray.100"
                            fontFamily="mono"
                            fontSize="xs"
                            height="400px"
                            overflowY="auto"
                            filter={!user ? "blur(3px)" : "none"}
                            userSelect={!user ? "none" : "auto"}
                          >
                            <pre>{JSON.stringify(generatePractiTestFormat(previewSteps), null, 2)}</pre>
                          </Box>
                          
                          {!user && (
                            <Box 
                              position="absolute" 
                              top="0" 
                              left="0" 
                              right="0" 
                              bottom="0" 
                              display="flex" 
                              alignItems="center" 
                              justifyContent="center"
                              zIndex={2}
                            >
                              <VStack spacing={3} bg="white" p={4} borderRadius="md" boxShadow="lg">
                                <Icon as={FiPlay} boxSize={8} color="primary.500" />
                                <Text fontWeight="medium">Sign up to access PractiTest format</Text>
                                <Button 
                                  colorScheme="primary" 
                                  size="sm"
                                  onClick={() => {
                                    setAuthMode('signup');
                                    setShowAuth(true);
                                  }}
                                >
                                  Sign Up Now
                                </Button>
                              </VStack>
                            </Box>
                          )}
                        </Box>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <HStack justify="center" spacing={4}>
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(false)}
            >
              Back to Edit
            </Button>
            <Button 
              colorScheme="primary"
              leftIcon={<Icon as={FiPlay} />}
              onClick={handleCreateTest}
              isLoading={createTestMutation.isPending}
              size="lg"
            >
              {user ? 'Create and Run Test' : 'Sign Up to Create Test'}
            </Button>
          </HStack>
        </VStack>

        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          defaultMode={authMode}
        />
      </SimpleLayout>
    )
  }

  // Import page UI
  return (
    <SimpleLayout>
      <VStack spacing={6} align="stretch">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Import Test</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg">Import Scribe Test</Heading>
            <Text color="gray.600">
              Paste your Scribe HTML export to create a new test case
            </Text>
          </Box>
          <Tooltip label="Show help">
            <IconButton
              aria-label="Show help"
              icon={showHelp ? <FiChevronUp /> : <FiChevronDown />}
              size="sm"
              variant="ghost"
              onClick={() => setShowHelp(!showHelp)}
            />
          </Tooltip>
        </Flex>

        {renderHelpSection()}

        <Card>
          <CardBody>
            <VStack spacing={4}>
              <Tabs variant="soft-rounded" colorScheme="blue" size="sm" index={activeTab} onChange={setActiveTab} width="100%">
                <TabList>
                  <Tab>Paste HTML</Tab>
                  <Tab>Upload File</Tab>
                </TabList>
                <TabPanels mt={4}>
                  <TabPanel p={0}>
                    <FormControl>
                      <FormLabel>Scribe HTML Content</FormLabel>
                      <Textarea
                        placeholder="Paste your Scribe HTML here..."
                        minH="200px"
                        onPaste={handlePaste}
                        onChange={handleChange}
                        value={htmlContent}
                        bg="gray.50"
                        border="2px"
                        borderStyle="dashed"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'primary.500' }}
                        _focus={{ 
                          borderColor: 'primary.500',
                          boxShadow: 'none'
                        }}
                        isDisabled={isValidating || createTestMutation.isPending}
                      />
                    </FormControl>
                  </TabPanel>
                  <TabPanel p={0}>
                    <Box
                      border="2px"
                      borderStyle="dashed"
                      borderColor="gray.200"
                      borderRadius="md"
                      p={8}
                      textAlign="center"
                      bg="gray.50"
                      cursor="pointer"
                      _hover={{ borderColor: 'primary.500' }}
                      onClick={() => {
                        // This would normally trigger a file upload
                        // For now, just switch to the paste tab and use the example
                        setActiveTab(0)
                        handleUseExample()
                      }}
                    >
                      <VStack spacing={3}>
                        <Icon as={FiClipboard} boxSize={8} color="gray.400" />
                        <Text color="gray.700" fontSize="sm">
                          Click to upload a Scribe HTML file
                        </Text>
                        <Text color="gray.500" fontSize="xs">
                          or drag and drop here
                        </Text>
                      </VStack>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {(isValidating || createTestMutation.isPending) && (
                <Box w="full">
                  <Progress 
                    size="xs" 
                    isIndeterminate 
                    colorScheme="primary" 
                  />
                  <Text mt={2} fontSize="sm" color="gray.600" textAlign="center">
                    {isValidating ? 'Validating Scribe content...' : 'Creating test...'}
                  </Text>
                </Box>
              )}

              <HStack spacing={4} justify="space-between" width="100%">
                <Button
                  size="sm"
                  leftIcon={<Icon as={hasCopied ? FiCheckCircle : FiClipboard} />}
                  variant="ghost"
                  onClick={handleUseExample}
                >
                  {hasCopied ? 'Example Copied!' : 'Use Example'}
                </Button>

                <Button
                  colorScheme="primary"
                  onClick={() => {
                    if (htmlContent) {
                      processHtmlContent(htmlContent)
                    } else {
                      toast({
                        title: 'No content',
                        description: 'Please paste or upload Scribe HTML content',
                        status: 'warning',
                        duration: 3000,
                      })
                    }
                  }}
                  isDisabled={isValidating || !htmlContent.trim()}
                  isLoading={isValidating}
                  loadingText="Processing..."
                >
                  Preview Test
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </SimpleLayout>
  )
} 