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
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { testsApi } from '@/api/tests'
import { FiClipboard, FiCheckCircle, FiChevronDown, FiChevronUp, FiPlay, FiInfo } from 'react-icons/fi'
import { useAuth } from '@/context/AuthContext'
import { AuthModal } from '@/components/auth/AuthModal'
import { FaFileExcel, FaCode } from 'react-icons/fa'
import { DownloadIcon, ViewIcon, RepeatIcon, AddIcon, InfoIcon, CheckIcon, CopyIcon } from '@chakra-ui/icons'

export default function ImportPage() {
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [isValidating, setIsValidating] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')
  const [createdTestId, setCreatedTestId] = useState<string | null>(null)
  const [isExecutingTest, setIsExecutingTest] = useState(false)
  const [playwrightCode, setPlaywrightCode] = useState<string>('')
  const [practiTestFormat, setPractiTestFormat] = useState<string>('')
  const { onCopy, hasCopied } = useClipboard("")
  const toast = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()

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
    mutationFn: testsApi.createTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
    }
  })

  const executeTestMutation = useMutation({
    mutationFn: (params: { id: string, environment: string }) => 
      testsApi.executeTest(params.id, params.environment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] })
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
    
    // Immediately process and create test when content is pasted
    if (content) {
      if (!user) {
        setAuthMode('signup')
        setShowAuth(true)
        return
      }

      setIsValidating(true)
      try {
        // Validate HTML content
        const isValid = validateHtml(content)
        if (!isValid) {
          toast({
            title: 'Invalid HTML',
            description: 'The pasted content does not appear to be valid Scribe HTML.',
            status: 'error',
            duration: 5000,
          })
          setIsValidating(false)
          return
        }

        // Create test directly
        const createdTest = await createTestMutation.mutateAsync({ html: content })
        
        if (createdTest && createdTest._id) {
          toast({
            title: 'Test created successfully',
            description: 'Redirecting to test details...',
            status: 'success',
            duration: 3000,
          })
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['tests'] })
          
          // Navigate to test detail page
          router.push(`/tests/${createdTest._id}`)
        }
      } catch (error) {
        toast({
          title: 'Error creating test',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          status: 'error',
          duration: 5000,
        })
      } finally {
        setIsValidating(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setHtmlContent(content)
  }

  const processHtmlContent = async (content: string) => {
    setIsValidating(true)

    try {
      // We're not showing preview anymore, but we still need to validate the HTML
      const isValid = validateHtml(content)
      
      if (!isValid) {
        toast({
          title: 'Invalid HTML',
          description: 'The pasted content does not appear to be valid Scribe HTML.',
          status: 'error',
          duration: 5000,
        })
        setIsValidating(false)
        return
      }

      // We don't need to parse steps for preview anymore
      // Just validate that it's processable
      const steps = parseScribeHtml(content)
      
      if (!steps || steps.length === 0) {
        toast({
          title: 'No steps found',
          description: 'Could not extract test steps from the HTML content.',
          status: 'error',
          duration: 5000,
        })
        setIsValidating(false)
        return
      }
      
      // Success validation
      toast({
        title: 'HTML validated',
        description: 'The HTML content is valid and ready to create a test.',
        status: 'success',
        duration: 3000,
      })
      
      setIsValidating(false)
    } catch (error) {
      toast({
        title: 'Error processing HTML',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
      })
      setIsValidating(false)
    }
  }

  const fetchTestDetails = async (testId: string) => {
    try {
      const test = await testsApi.getTest(testId)
      
      // Generate Playwright code from the test steps
      if (test && test.steps) {
        const code = generatePlaywrightCode(test.steps)
        setPlaywrightCode(code)
        
        const practiTest = JSON.stringify(generatePractiTestFormat(test.steps), null, 2)
        setPractiTestFormat(practiTest)
      }
    } catch (error) {
      console.error('Error fetching test details:', error)
    }
  }

  const handleCreateTest = async () => {
    if (!user) {
      setAuthMode('signup')
      setShowAuth(true)
      return
    }
    
    try {
      const createdTest = await createTestMutation.mutateAsync({ html: htmlContent })
      
      // Set the created test ID
      if (createdTest && createdTest._id) {
        // Set the created test ID immediately to show success state
        setCreatedTestId(createdTest._id)
        
        // Fetch test details to display code
        fetchTestDetails(createdTest._id)
        
        toast({
          title: 'Test created successfully',
          description: 'Your test has been created with Excel export and Playwright script. Preparing to run...',
          status: 'success',
          duration: 3000,
        })
        
        try {
          // Set executing state
          setIsExecutingTest(true)
          
          // Automatically execute the test with default environment
          await executeTestMutation.mutateAsync({ 
            id: createdTest._id, 
            environment: 'cloud' 
          })
          
          setIsExecutingTest(false)
          
          toast({
            title: 'Test execution started',
            description: 'Your test is now running. You can download the generated files from the success screen.',
            status: 'success',
            duration: 3000,
          })
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['tests'] })
          
          // We no longer automatically redirect - let the user choose from the success screen
        } catch (execError) {
          // Reset executing state
          setIsExecutingTest(false)
          
          toast({
            title: 'Test created but execution failed',
            description: 'Your test was created successfully with downloadable files, but we couldn\'t start execution. You can run it manually.',
            status: 'warning',
            duration: 5000,
          })
          
          // We no longer automatically redirect - let the user choose from the success screen
        }
      } else {
        toast({
          title: 'Error creating test',
          description: 'Failed to create test. Please try again.',
          status: 'error',
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: 'Error creating test',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
      })
    }
  }

  // Handler for creating and downloading Playwright test
  const handleCreateAndDownloadPlaywright = async () => {
    if (!user) {
      setAuthMode('signup')
      setShowAuth(true)
      return
    }
    
    try {
      const createdTest = await createTestMutation.mutateAsync({ html: htmlContent })
      
      if (createdTest && createdTest._id) {
        // Set the created test ID
        setCreatedTestId(createdTest._id)
        
        toast({
          title: 'Test created successfully',
          description: 'Downloading Playwright test file...',
          status: 'success',
          duration: 3000,
        })
        
        // Download the Playwright test file
        testsApi.downloadPlaywrightTest(createdTest._id)
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['tests'] })
      } else {
        toast({
          title: 'Error creating test',
          description: 'Failed to create test. Please try again.',
          status: 'error',
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: 'Error creating test',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
      })
    }
  }
  
  // Handler for creating and downloading PractiTest export
  const handleCreateAndDownloadPractiTest = async () => {
    if (!user) {
      setAuthMode('signup')
      setShowAuth(true)
      return
    }
    
    try {
      const createdTest = await createTestMutation.mutateAsync({ html: htmlContent })
      
      if (createdTest && createdTest._id) {
        // Set the created test ID
        setCreatedTestId(createdTest._id)
        
        toast({
          title: 'Test created successfully',
          description: 'Downloading PractiTest export file...',
          status: 'success',
          duration: 3000,
        })
        
        // Download the PractiTest export file
        testsApi.downloadPractiTestExport(createdTest._id)
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['tests'] })
      } else {
        toast({
          title: 'Error creating test',
          description: 'Failed to create test. Please try again.',
          status: 'error',
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: 'Error creating test',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
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

  // Render the success state after test creation
  const renderSuccessState = () => {
    if (!createdTestId) return null;
    
    // Show loading state when test is executing
    if (isExecutingTest) {
      return (
        <Box 
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.700"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box 
            bg="gray.800" 
            p={8} 
            borderRadius="lg" 
            maxW="md" 
            w="full"
            boxShadow="xl"
            textAlign="center"
          >
            <VStack spacing={6}>
              <Spinner size="xl" color="blue.400" thickness="4px" />
              <Heading size="lg" color="white">Preparing Test...</Heading>
              <Text color="gray.300">Your test has been created and is being prepared for execution.</Text>
              <Progress 
                isIndeterminate 
                colorScheme="blue" 
                width="100%" 
                borderRadius="md"
              />
            </VStack>
          </Box>
        </Box>
      );
    }
    
    return (
      <Box 
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.700"
        zIndex={1000}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Box 
          bg="gray.800" 
          p={8} 
          borderRadius="lg" 
          maxW="900px" 
          w="full"
          boxShadow="xl"
          overflowY="auto"
          maxH="90vh"
        >
        <VStack spacing={6} align="stretch">
            <Flex align="center" justify="center" direction="column">
              <Box 
                bg="green.400" 
                color="white" 
                p={3} 
                borderRadius="full" 
                mb={4}
              >
                <CheckIcon boxSize={8} />
              </Box>
              <Heading size="lg" textAlign="center" mb={2} color="white">Test Case Created Successfully!</Heading>
              <Text textAlign="center" color="gray.300" mb={4}>
                Your test case has been created and is ready to use.
              </Text>
            </Flex>

            <Divider my={4} />

            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab color="gray.300" _selected={{ color: "white", bg: "blue.600" }}>Generated Files</Tab>
                <Tab color="gray.300" _selected={{ color: "white", bg: "purple.600" }}>Playwright Code</Tab>
                <Tab color="gray.300" _selected={{ color: "white", bg: "green.600" }}>PractiTest Format</Tab>
              </TabList>
              
              <TabPanels>
                {/* Generated Files Tab */}
                <TabPanel p={4} bg="gray.700" borderRadius="md" mt={2}>
                  <VStack spacing={6} align="stretch">
            <HStack>
                      <Icon as={FaFileExcel} color="green.400" boxSize={5} />
                      <Text flex="1" color="gray.200">PractiTest Excel Export</Text>
              <Button 
                        size="sm" 
                        colorScheme="green" 
                        leftIcon={<DownloadIcon />}
                        onClick={() => testsApi.downloadPractiTestExport(createdTestId)}
                      >
                        Download
              </Button>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FaCode} color="purple.400" boxSize={5} />
                      <Text flex="1" color="gray.200">Playwright Test Script</Text>
              <Button 
                        size="sm" 
                        colorScheme="purple" 
                        leftIcon={<DownloadIcon />}
                        onClick={() => testsApi.downloadPlaywrightTest(createdTestId)}
                      >
                        Download
              </Button>
            </HStack>
                    
                    <Box mt={4} p={4} bg="gray.600" borderRadius="md">
                      <Heading size="sm" mb={3} color="white">Next Steps</Heading>
                      <HStack spacing={4}>
                        <Button 
                          leftIcon={<ViewIcon />} 
                          colorScheme="blue" 
                          size="sm"
                          onClick={() => router.push(`/tests/${createdTestId}`)}
                        >
                          View Test Details
                        </Button>
                        
                        <Button 
                          leftIcon={<RepeatIcon />} 
                          colorScheme="blue"
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/tests/${createdTestId}/run`)}
                        >
                          Run Test
                        </Button>
                          </HStack>
                  </Box>
                </VStack>
              </TabPanel>

                {/* Playwright Code Tab */}
                <TabPanel p={4} bg="gray.700" borderRadius="md" mt={2}>
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between" align="center">
                      <Heading size="sm" color="white">Playwright Test Script</Heading>
                      <HStack>
                        <Button 
                          size="sm" 
                          colorScheme="purple" 
                          leftIcon={<DownloadIcon />}
                          onClick={() => testsApi.downloadPlaywrightTest(createdTestId)}
                        >
                          Download
                        </Button>
                    <Button 
                      size="sm" 
                          colorScheme="blue" 
                          leftIcon={<CopyIcon />}
                          onClick={() => {
                            if (playwrightCode) {
                              navigator.clipboard.writeText(playwrightCode);
                              toast({
                                title: 'Code copied to clipboard',
                                status: 'success',
                                duration: 2000,
                              });
                            }
                          }}
                          isDisabled={!playwrightCode}
                        >
                          Copy Code
                    </Button>
                      </HStack>
                  </Flex>

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
                      <pre>{playwrightCode || "// Loading Playwright code..."}</pre>
                      </Box>
                </VStack>
              </TabPanel>

                {/* PractiTest Format Tab */}
                <TabPanel p={4} bg="gray.700" borderRadius="md" mt={2}>
                <VStack spacing={4} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Heading size="sm" color="white">PractiTest Export Format</Heading>
                      <HStack>
                                <Button 
                                  size="sm"
                          colorScheme="green" 
                          leftIcon={<DownloadIcon />}
                          onClick={() => testsApi.downloadPractiTestExport(createdTestId)}
                        >
                          Download Excel
                                </Button>
                      </HStack>
                    </Flex>
                    
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
                      <pre>{practiTestFormat || "// Loading PractiTest format..."}</pre>
                        </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

            <Button 
              alignSelf="center" 
              variant="ghost" 
              color="gray.400"
              onClick={() => {
                setCreatedTestId(null);
                setHtmlContent('');
              }}
              size="sm"
              mt={2}
            >
              Close & Create Another Test
            </Button>
        </VStack>
        </Box>
      </Box>
    );
  }

  // Import page UI
  return (
    <VStack spacing={6} align="stretch">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Import Test</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Box>
        <Heading size="lg" mb={2}>Import Test from Scribe</Heading>
        <Text color="gray.400" mb={6}>
          Paste your Scribe HTML to create a test case. The test will be created automatically.
        </Text>
      </Box>

      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Paste Scribe HTML</FormLabel>
              <Textarea 
                placeholder="Paste your Scribe HTML here..."
                height="300px"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                onPaste={handlePaste}
                isDisabled={isValidating || createTestMutation.isPending}
              />
            </FormControl>

            <HStack justify="space-between">
              <Button
                variant="outline"
                onClick={handleUseExample}
                isDisabled={isValidating || createTestMutation.isPending}
              >
                {hasCopied ? 'Example Copied!' : 'Use Example'}
              </Button>

              {(isValidating || createTestMutation.isPending) && (
                <HStack>
                  <Spinner size="sm" />
                  <Text fontSize="sm" color="gray.500">
                    {isValidating ? 'Validating...' : 'Creating test...'}
                  </Text>
                </HStack>
              )}
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        defaultMode={authMode}
      />
    </VStack>
  )
} 