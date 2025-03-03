'use client'

import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  Badge,
  Icon,
  Flex,
  Grid,
  GridItem,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Progress,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tooltip,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { useMutation } from '@tanstack/react-query'
import { testsApi } from '@/api/tests'
import { useAuth } from '@/context/AuthContext'
import { AuthModal } from '@/components/auth/AuthModal'
import { FiArrowRight, FiPlay, FiSave, FiLogIn, FiHome, FiChevronRight, FiCheckCircle } from 'react-icons/fi'
import Link from 'next/link'

const MotionBox = motion(Box)
const MotionText = motion(Text)

export default function Home() {
  const [showSignUp, setShowSignUp] = React.useState(false)
  const [showAuth, setShowAuth] = React.useState(false)
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login')
  const [testCreated, setTestCreated] = React.useState(false)
  const [previewMode, setPreviewMode] = React.useState(false)
  const [previewHtml, setPreviewHtml] = React.useState('')
  const [previewProgress, setPreviewProgress] = React.useState(0)
  const { isOpen: isNavOpen, onOpen: onNavOpen, onClose: onNavClose } = useDisclosure()
  const toast = useToast()
  const { user, isLoading: isAuthLoading } = useAuth()

  const createTestMutation = useMutation({
    mutationFn: (html: string) => testsApi.createFromScribe(html),
    onSuccess: (result) => {
      setTestCreated(true)
      toast({
        title: 'Test created successfully! 🎉',
        description: 'Your test is ready to run in our cloud infrastructure.',
        status: 'success',
        duration: 5000,
      })
    }
  })

  const handleOnboardingComplete = async (data: {
    html: string
    gitConfig: {
      repository: string
      branch: string
    }
    environment: {
      name: string
      os: string
      memory: number
      cpu: number
    }
    localConfig: {
      useLocalBrowser: boolean
      saveCredentials: boolean
      debugMode: boolean
    }
  }) => {
    // Store the HTML for preview mode
    setPreviewHtml(data.html)
    
    // If user is logged in, create the test directly
    if (user) {
      await createTestMutation.mutateAsync(data.html)
    } else {
      // Otherwise, show preview mode first
      setPreviewMode(true)
      // Set a static preview progress of 35% to show what it would look like
      setPreviewProgress(35)
    }
  }

  // This function is no longer used for actual simulation
  // It's kept for reference or future use
  const simulateTestExecution = () => {
    setPreviewProgress(35) // Static preview at 35% to show what it would look like
  }

  // Parse the preview HTML to extract steps
  const parsePreviewSteps = () => {
    if (!previewHtml) return []
    
    const steps = []
    const stepRegex = /<div class="scribe-step"[^>]*>([\s\S]*?)<\/div>/g
    const actionRegex = /<div class="scribe-action">([\s\S]*?)<\/div>/
    const selectorRegex = /<div class="scribe-selector">([\s\S]*?)<\/div>/
    const valueRegex = /<div class="scribe-value">([\s\S]*?)<\/div>/
    
    let match
    while ((match = stepRegex.exec(previewHtml)) !== null) {
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

  // Generate simulated logs based on progress
  const generateLogs = () => {
    const steps = parsePreviewSteps()
    const logs = []
    
    // Add initialization logs
    logs.push({
      message: 'Initializing browser session...',
      level: 'info',
      timestamp: new Date(Date.now() - 10000).toISOString()
    })
    
    logs.push({
      message: 'Starting Chrome browser in headless mode',
      level: 'debug',
      timestamp: new Date(Date.now() - 9800).toISOString()
    })
    
    logs.push({
      message: 'Browser started successfully',
      level: 'info',
      timestamp: new Date(Date.now() - 9500).toISOString()
    })
    
    // Add logs for a few steps to show what it would look like
    const previewStepCount = Math.min(3, steps.length)
    
    for (let i = 0; i < previewStepCount; i++) {
      const step = steps[i]
      const baseTime = Date.now() - (9000 - (i * 1000))
      
      logs.push({
        message: `Executing step ${i + 1}: ${step.action}`,
        level: 'info',
        timestamp: new Date(baseTime).toISOString()
      })
      
      if (step.selector) {
        logs.push({
          message: `Looking for element: ${step.selector}`,
          level: 'debug',
          timestamp: new Date(baseTime + 200).toISOString()
        })
      }
    }
    
    // Add a "preview only" message
    logs.push({
      message: '--- PREVIEW MODE: Sign up to run complete test ---',
      level: 'warning',
      timestamp: new Date().toISOString()
    })
    
    return logs
  }

  // Generate Playwright code for preview
  const generatePlaywrightCode = () => {
    const steps = parsePreviewSteps()
    
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
});`
  }

  // Generate PractiTest format for preview
  const generatePractiTestFormat = () => {
    const steps = parsePreviewSteps()
    
    return JSON.stringify(steps.map((step, index) => {
      return {
        "step_number": index + 1,
        "description": step.action,
        "expected_results": `Element ${step.selector || ''} should respond as expected`,
        "actual_results": "",
        "status": "PASSED"
      };
    }), null, 2)
  }

  // Handle sign up from preview mode
  const handleSignUpFromPreview = () => {
    setAuthMode('signup')
    setShowAuth(true)
  }

  // Handle creating test after authentication
  const handleCreateTestAfterAuth = async () => {
    if (user && previewHtml) {
      await createTestMutation.mutateAsync(previewHtml)
    }
  }

  // Navigation drawer for mobile
  const renderNavigationDrawer = () => (
    <Drawer isOpen={isNavOpen} placement="right" onClose={onNavClose}>
      <DrawerOverlay />
      <DrawerContent bg="gray.800">
        <DrawerCloseButton color="white" />
        <DrawerHeader color="white">Navigation</DrawerHeader>
        <DrawerBody>
          <VStack spacing={4} align="stretch">
            <Button 
              variant="ghost" 
              color="white" 
              justifyContent="flex-start"
              leftIcon={<Icon as={FiHome} />}
              onClick={() => window.location.href = '/'}
            >
              Home
            </Button>
            {user ? (
              <Button 
                variant="ghost" 
                color="white" 
                justifyContent="flex-start"
                leftIcon={<Icon as={FiPlay} />}
                onClick={() => window.location.href = '/dashboard'}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  color="white" 
                  justifyContent="flex-start"
                  leftIcon={<Icon as={FiLogIn} />}
                  onClick={() => {
                    setAuthMode('login')
                    setShowAuth(true)
                    onNavClose()
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  variant="ghost" 
                  color="white" 
                  justifyContent="flex-start"
                  leftIcon={<Icon as={FiLogIn} />}
                  onClick={() => {
                    setAuthMode('signup')
                    setShowAuth(true)
                    onNavClose()
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )

  // Preview mode UI
  if (previewMode) {
    const previewSteps = parsePreviewSteps()
    const logs = generateLogs()
    
    return (
      <Box minH="100vh" bg="gray.900" position="relative" overflow="hidden">
        {/* Animated Background */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="100%"
          bgGradient="linear(165deg, blue.900, purple.900)"
          opacity={0.9}
          zIndex={0}
        />
        
        {/* Navigation */}
        <Box position="fixed" top={4} left={4} right={4} zIndex={10}>
          <Flex justify="space-between" align="center">
            <Breadcrumb separator={<Icon as={FiChevronRight} color="whiteAlpha.600" />}>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href="/" color="whiteAlpha.800">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color="whiteAlpha.800">Test Preview</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            
            <HStack spacing={2}>
              <Button
                size={{ base: 'sm', md: 'md' }}
                variant="ghost"
                color="white"
                onClick={() => setPreviewMode(false)}
                _hover={{
                  bg: "whiteAlpha.100",
                }}
              >
                Back
              </Button>
              <Button
                size={{ base: 'sm', md: 'md' }}
                bgGradient="linear(to-r, blue.400, purple.500)"
                color="white"
                onClick={handleSignUpFromPreview}
                _hover={{
                  bgGradient: "linear(to-r, blue.500, purple.600)",
                }}
              >
                Sign Up to Run Test
              </Button>
            </HStack>
          </Flex>
        </Box>

        <Container maxW="container.xl" py={20} position="relative" zIndex={1}>
          <VStack spacing={8} align="stretch">
            <VStack spacing={4} align="center" textAlign="center">
              <Badge
                colorScheme="blue"
                px={4}
                py={2}
                borderRadius="full"
                fontSize="md"
                textTransform="none"
                bgGradient="linear(to-r, blue.400, purple.400)"
              >
                Preview Mode
              </Badge>
              
              <Heading
                size="2xl"
                bgGradient="linear(to-r, blue.100, purple.100)"
                bgClip="text"
                lineHeight="1.2"
                fontWeight="bold"
                letterSpacing="tight"
              >
                Your Test is Ready to Run
              </Heading>

              <Text fontSize="xl" color="whiteAlpha.800" maxW="container.md">
                We've processed your Scribe recording and prepared an automated test. 
                Sign up now to run this test in our secure cloud infrastructure.
              </Text>
              
              <Button
                mt={2}
                size="lg"
                bgGradient="linear(to-r, blue.400, purple.500)"
                color="white"
                px={8}
                leftIcon={<Icon as={FiPlay} />}
                _hover={{
                  bgGradient: "linear(to-r, blue.500, purple.600)",
                  transform: "translateY(-2px)",
                  boxShadow: "xl",
                }}
                onClick={handleSignUpFromPreview}
              >
                Sign Up to Run This Test
              </Button>
            </VStack>

            {/* Main content area with tabs */}
            <Box 
              w="full" 
              bg="whiteAlpha.100" 
              borderRadius="xl" 
              overflow="hidden"
              boxShadow="xl"
              position="relative"
            >
              {/* Preview Overlay */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="blackAlpha.50"
                backdropFilter="blur(1px)"
                zIndex={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                pointerEvents="none"
              >
                <Box
                  position="absolute"
                  top={4}
                  right={4}
                  bg="blue.500"
                  color="white"
                  px={3}
                  py={1}
                  borderRadius="md"
                  fontWeight="bold"
                  transform="rotate(5deg)"
                  boxShadow="lg"
                >
                  Preview Only
                </Box>
              </Box>

              {/* Progress bar at top */}
              <Box p={4} borderBottomWidth="1px" borderColor="whiteAlpha.200">
                <VStack spacing={2} align="stretch">
                  <Flex justify="space-between">
                    <Text color="white" fontWeight="medium">Test Execution Preview</Text>
                    <Text color="white">{previewProgress}%</Text>
                  </Flex>
                  <Progress 
                    value={previewProgress} 
                    size="md" 
                    colorScheme="blue" 
                    borderRadius="full"
                    hasStripe
                  />
                  
                  <Grid templateColumns="repeat(4, 1fr)" gap={4} mt={2}>
                    <GridItem>
                      <VStack align="start" spacing={1}>
                        <Text color="whiteAlpha.600" fontSize="sm">Status</Text>
                        <HStack>
                          <Text color="white" fontWeight="medium">
                            Preview
                          </Text>
                          <Badge colorScheme="yellow" fontSize="xs">Sign up to run</Badge>
                        </HStack>
                      </VStack>
                    </GridItem>
                    <GridItem>
                      <VStack align="start" spacing={1}>
                        <Text color="whiteAlpha.600" fontSize="sm">Environment</Text>
                        <Text color="white" fontWeight="medium">Cloud (Chrome)</Text>
                      </VStack>
                    </GridItem>
                    <GridItem>
                      <VStack align="start" spacing={1}>
                        <Text color="whiteAlpha.600" fontSize="sm">Estimated Duration</Text>
                        <Text color="white" fontWeight="medium">
                          ~{Math.max(5, Math.floor(previewSteps.length * 1.5))}s
                        </Text>
                      </VStack>
                    </GridItem>
                    <GridItem>
                      <VStack align="start" spacing={1}>
                        <Text color="whiteAlpha.600" fontSize="sm">Steps</Text>
                        <Text color="white" fontWeight="medium">
                          {previewSteps.length} total
                        </Text>
                      </VStack>
                    </GridItem>
                  </Grid>
                </VStack>
              </Box>

              {/* Tabs for different views */}
              <Tabs variant="soft-rounded" colorScheme="blue" p={6} position="relative" zIndex={0}>
                <TabList mb={4}>
                  <Tab color="whiteAlpha.800" _selected={{ color: 'white', bg: 'whiteAlpha.200' }}>Test Steps</Tab>
                  <Tab color="whiteAlpha.800" _selected={{ color: 'white', bg: 'whiteAlpha.200' }}>Execution Logs</Tab>
                  <Tab color="whiteAlpha.800" _selected={{ color: 'white', bg: 'whiteAlpha.200' }}>Generated Code</Tab>
                </TabList>
                <TabPanels>
                  {/* Test Steps Panel */}
                  <TabPanel p={0}>
                    <VStack spacing={4} align="stretch" maxH="400px" overflowY="auto" pr={2}>
                      {previewSteps.slice(0, Math.min(5, previewSteps.length)).map((step, index) => {
                        const isCompleted = index < Math.ceil((previewProgress / 100) * previewSteps.length)
                        const isActive = index === Math.floor((previewProgress / 100) * previewSteps.length) && previewProgress < 100
                        
                        return (
                          <Box 
                            key={index} 
                            p={4} 
                            borderWidth="1px" 
                            borderRadius="md"
                            borderColor={isActive ? "blue.400" : "whiteAlpha.200"}
                            bg={isCompleted ? "whiteAlpha.200" : "whiteAlpha.100"}
                            position="relative"
                            transition="all 0.2s"
                          >
                            <HStack mb={2}>
                              <Badge 
                                colorScheme={isCompleted ? "green" : isActive ? "blue" : "gray"}
                                variant={isActive ? "solid" : "subtle"}
                              >
                                Step {index + 1}
                              </Badge>
                              <Text color="white" fontWeight="medium">{step.action}</Text>
                            </HStack>
                            {step.selector && (
                              <Text fontSize="sm" color="whiteAlpha.800">
                                Selector: <Text as="span" fontFamily="mono" fontSize="xs">{step.selector}</Text>
                              </Text>
                            )}
                            {step.value && (
                              <Text fontSize="sm" color="whiteAlpha.800">
                                Value: <Text as="span" fontFamily="mono" fontSize="xs">{step.value}</Text>
                              </Text>
                            )}
                            
                            {isCompleted && (
                              <Box position="absolute" top={3} right={3}>
                                <Icon as={FiCheckCircle} color="green.300" />
                              </Box>
                            )}
                          </Box>
                        )
                      })}
                      
                      {previewSteps.length > 5 && (
                        <Box 
                          p={4} 
                          borderWidth="1px" 
                          borderRadius="md"
                          borderColor="whiteAlpha.200"
                          bg="whiteAlpha.50"
                          textAlign="center"
                        >
                          <Text color="whiteAlpha.800">
                            +{previewSteps.length - 5} more steps
                          </Text>
                          <Button
                            mt={2}
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={handleSignUpFromPreview}
                          >
                            Sign Up to View All Steps
                          </Button>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>
                  
                  {/* Execution Logs Panel */}
                  <TabPanel p={0}>
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
                      position="relative"
                    >
                      {logs.map((log, index) => (
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
                      ))}
                      
                      <Box
                        position="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                        height="150px"
                        bgGradient="linear(to-t, gray.900, transparent)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexDirection="column"
                        p={4}
                      >
                        <Text color="white" fontWeight="medium" mb={2}>
                          Sign up to see complete execution logs
                        </Text>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={handleSignUpFromPreview}
                        >
                          Sign Up Now
                        </Button>
                      </Box>
                    </Box>
                  </TabPanel>
                  
                  {/* Generated Code Panel */}
                  <TabPanel p={0}>
                    <Tabs variant="line" colorScheme="blue" size="sm">
                      <TabList mb={4}>
                        <Tab color="whiteAlpha.800">Playwright</Tab>
                        <Tab color="whiteAlpha.800">PractiTest Format</Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel p={0}>
                          <Box position="relative">
                            <Box 
                              borderWidth="1px" 
                              borderRadius="md" 
                              p={3} 
                              bg="gray.900" 
                              color="gray.100"
                              fontFamily="mono"
                              fontSize="xs"
                              height="350px"
                              overflowY="auto"
                              filter="blur(3px)"
                              userSelect="none"
                            >
                              <pre>{generatePlaywrightCode()}</pre>
                            </Box>
                            
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
                              bg="blackAlpha.700"
                              borderRadius="md"
                            >
                              <VStack spacing={4} bg="gray.800" p={6} borderRadius="md" boxShadow="lg" maxW="80%">
                                <Icon as={FiPlay} boxSize={10} color="blue.400" />
                                <Heading size="md" color="white" textAlign="center">
                                  Generate Playwright Code
                                </Heading>
                                <Text color="whiteAlpha.800" textAlign="center">
                                  Sign up to generate and export Playwright code that you can run in your own environment.
                                </Text>
                                <Text color="whiteAlpha.600" fontSize="sm" textAlign="center">
                                  Our code generator creates clean, maintainable Playwright tests that work with your CI/CD pipeline.
                                </Text>
                                <Button 
                                  colorScheme="blue" 
                                  size="md"
                                  onClick={handleSignUpFromPreview}
                                  leftIcon={<Icon as={FiPlay} />}
                                >
                                  Sign Up to Generate Code
                                </Button>
                              </VStack>
                            </Box>
                          </Box>
                        </TabPanel>
                        <TabPanel p={0}>
                          <Box position="relative">
                            <Box 
                              borderWidth="1px" 
                              borderRadius="md" 
                              p={3} 
                              bg="gray.900" 
                              color="gray.100"
                              fontFamily="mono"
                              fontSize="xs"
                              height="350px"
                              overflowY="auto"
                              filter="blur(3px)"
                              userSelect="none"
                            >
                              <pre>{generatePractiTestFormat()}</pre>
                            </Box>
                            
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
                              bg="blackAlpha.700"
                              borderRadius="md"
                            >
                              <VStack spacing={4} bg="gray.800" p={6} borderRadius="md" boxShadow="lg" maxW="80%">
                                <Icon as={FiSave} boxSize={10} color="purple.400" />
                                <Heading size="md" color="white" textAlign="center">
                                  Export to PractiTest
                                </Heading>
                                <Text color="whiteAlpha.800" textAlign="center">
                                  Sign up to export your test in PractiTest format for seamless integration.
                                </Text>
                                <Text color="whiteAlpha.600" fontSize="sm" textAlign="center">
                                  Our PractiTest integration allows you to manage your tests alongside your manual test cases.
                                </Text>
                                <Button 
                                  colorScheme="purple" 
                                  size="md"
                                  onClick={handleSignUpFromPreview}
                                  leftIcon={<Icon as={FiSave} />}
                                >
                                  Sign Up to Export
                                </Button>
                              </VStack>
                            </Box>
                          </Box>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>

            {/* Call to action */}
            <VStack spacing={6} pt={8} align="center">
              <Box p={6} bg="blue.900" borderRadius="lg" maxW="container.md" boxShadow="xl">
                <VStack spacing={4}>
                  <Heading size="md" color="white">
                    Ready to run your first test?
                  </Heading>
                  <Text color="whiteAlpha.800" textAlign="center">
                    Sign up now to run this test in our secure cloud environment and unlock all features.
                  </Text>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} width="100%">
                    <GridItem>
                      <VStack p={3} bg="whiteAlpha.100" borderRadius="md" height="100%">
                        <Icon as={FiPlay} color="blue.300" boxSize={6} />
                        <Text color="white" fontWeight="medium">Run Tests</Text>
                        <Text color="whiteAlpha.700" fontSize="sm" textAlign="center">
                          Execute tests in our secure cloud environment
                        </Text>
                      </VStack>
                    </GridItem>
                    <GridItem>
                      <VStack p={3} bg="whiteAlpha.100" borderRadius="md" height="100%">
                        <Icon as={FiSave} color="blue.300" boxSize={6} />
                        <Text color="white" fontWeight="medium">Export Code</Text>
                        <Text color="whiteAlpha.700" fontSize="sm" textAlign="center">
                          Generate and export Playwright code
                        </Text>
                      </VStack>
                    </GridItem>
                    <GridItem>
                      <VStack p={3} bg="whiteAlpha.100" borderRadius="md" height="100%">
                        <Icon as={FiCheckCircle} color="blue.300" boxSize={6} />
                        <Text color="white" fontWeight="medium">Detailed Reports</Text>
                        <Text color="whiteAlpha.700" fontSize="sm" textAlign="center">
                          Get comprehensive test reports
                        </Text>
                      </VStack>
                    </GridItem>
                  </Grid>
                  <Button
                    size="lg"
                    bgGradient="linear(to-r, blue.400, purple.500)"
                    color="white"
                    px={8}
                    leftIcon={<Icon as={FiPlay} />}
                    _hover={{
                      bgGradient: "linear(to-r, blue.500, purple.600)",
                      transform: "translateY(-2px)",
                      boxShadow: "xl",
                    }}
                    onClick={handleSignUpFromPreview}
                    mt={2}
                  >
                    Sign Up Now
                  </Button>
                </VStack>
              </Box>

              <HStack spacing={4}>
                <Button
                  size="lg"
                  variant="ghost"
                  color="white"
                  leftIcon={<Icon as={FiArrowRight} />}
                  _hover={{
                    bg: "whiteAlpha.100",
                  }}
                  onClick={() => setPreviewMode(false)}
                >
                  Create Another Test
                </Button>
              </HStack>
              
              <Text color="whiteAlpha.600" fontSize="sm" maxW="container.md" textAlign="center">
                By signing up, you'll get access to all features including test history, detailed reports, 
                CI/CD integration, and the ability to share tests with your team.
              </Text>
            </VStack>
          </VStack>
        </Container>
        
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          defaultMode={authMode}
        />
      </Box>
    )
  }

  // Test created success UI
  if (testCreated) {
  return (
      <Box minH="100vh" bg="gray.900" position="relative" overflow="hidden">
        {/* Animated Background */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="100%"
          bgGradient="linear(165deg, blue.900, purple.900)"
          opacity={0.9}
          zIndex={0}
        />
        
        {/* Navigation */}
        <Box position="fixed" top={4} left={4} right={4} zIndex={10}>
          <Flex justify="space-between" align="center">
            <Breadcrumb separator={<Icon as={FiChevronRight} color="whiteAlpha.600" />}>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href="/" color="whiteAlpha.800">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color="whiteAlpha.800">Test Created</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            
            <Button
              size={{ base: 'sm', md: 'md' }}
              bgGradient="linear(to-r, blue.400, purple.500)"
              color="white"
              onClick={() => window.location.href = '/dashboard'}
              _hover={{
                bgGradient: "linear(to-r, blue.500, purple.600)",
              }}
            >
              Go to Dashboard
            </Button>
          </Flex>
        </Box>
        
        {/* Success Wave Pattern */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          height="40%"
          bgImage="url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSIzMTYiIHZpZXdCb3g9IjAgMCAxNDQwIDMxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQ0MCAyODAuOEM5NjAgMjgwLjggNzIwIDAsIDAgMFYzMTZIMTQ0MFYyODAuOFoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcikiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXIiIHgxPSI3MjAiIHkxPSIwIiB4Mj0iNzIwIiB5Mj0iMzE2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzJCNjhEQyIgc3RvcC1vcGFjaXR5PSIwLjA1Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMkI2OERDIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=')"
          bgRepeat="no-repeat"
          bgPosition="bottom"
          bgSize="cover"
          opacity={0.1}
        />

        <Container maxW="container.lg" py={20} position="relative" zIndex={1}>
          <VStack spacing={8} align="center" textAlign="center">
            <Badge
              colorScheme="green"
              px={4}
              py={2}
              borderRadius="full"
              fontSize="md"
              textTransform="none"
              bgGradient="linear(to-r, green.400, teal.400)"
            >
              Test Created Successfully
            </Badge>
            
            <Heading
              size="2xl"
              bgGradient="linear(to-r, blue.100, purple.100)"
              bgClip="text"
              lineHeight="1.2"
              fontWeight="bold"
              letterSpacing="tight"
            >
              Your Test is Ready to Run
            </Heading>

            <Text fontSize="xl" color="whiteAlpha.800" maxW="container.sm">
              We've processed your Scribe recording and created an automated test. Run it now in our secure cloud infrastructure.
            </Text>

            <Grid templateColumns="repeat(3, 1fr)" gap={6} width="full" mt={8}>
              <GridItem colSpan={1}>
                <VStack
                  bg="whiteAlpha.100"
                  p={6}
                  borderRadius="xl"
                  spacing={4}
                  height="full"
                  justify="center"
                >
                  <Text fontSize="4xl">🚀</Text>
                  <Text color="whiteAlpha.900" fontWeight="medium">
                    Cloud Ready
                  </Text>
                </VStack>
              </GridItem>
              <GridItem colSpan={1}>
                <VStack
                  bg="whiteAlpha.100"
                  p={6}
                  borderRadius="xl"
                  spacing={4}
                  height="full"
                  justify="center"
                >
                  <Text fontSize="4xl">🔒</Text>
                  <Text color="whiteAlpha.900" fontWeight="medium">
                    Secure Environment
                  </Text>
                </VStack>
              </GridItem>
              <GridItem colSpan={1}>
                <VStack
                  bg="whiteAlpha.100"
                  p={6}
                  borderRadius="xl"
                  spacing={4}
                  height="full"
                  justify="center"
                >
                  <Text fontSize="4xl">📊</Text>
                  <Text color="whiteAlpha.900" fontWeight="medium">
                    Real-time Results
                  </Text>
                </VStack>
              </GridItem>
            </Grid>

            <HStack spacing={4} pt={8}>
              <Button
                size="lg"
                bgGradient="linear(to-r, blue.400, purple.500)"
                color="white"
                px={8}
                leftIcon={<Icon as={FiPlay} />}
                _hover={{
                  bgGradient: "linear(to-r, blue.500, purple.600)",
                  transform: "translateY(-2px)",
                  boxShadow: "xl",
                }}
                onClick={() => window.location.href = `/tests/${createTestMutation.data?.id}/run`}
              >
                View Test Run
              </Button>
              <Button
                size="lg"
                variant="ghost"
                color="white"
                leftIcon={<Icon as={FiArrowRight} />}
                _hover={{
                  bg: "whiteAlpha.100",
                }}
                onClick={() => {
                  setTestCreated(false)
                  setPreviewMode(false)
                }}
              >
                Create Another Test
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    )
  }

  // Main landing page UI
  return (
    <Box minH="100vh" bg="gray.900" position="relative" overflow="hidden" display="flex" alignItems="center">
      {/* Navigation */}
      <Box position="fixed" top={4} left={4} right={4} zIndex={10}>
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Text fontSize="xl" lineHeight="1" color="white">
              🌐
            </Text>
            <Text fontSize="lg" fontWeight="semibold" color="white">
              Compass
            </Text>
          </HStack>
          
          {/* Desktop Navigation */}
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            {user ? (
              <Button
                size="md"
                bgGradient="linear(to-r, blue.400, purple.500)"
                color="white"
                onClick={() => window.location.href = '/dashboard'}
                _hover={{
                  bgGradient: "linear(to-r, blue.500, purple.600)",
                }}
                leftIcon={<Icon as={FiPlay} />}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  size="md"
                  variant="ghost"
                  color="white"
                  onClick={() => {
                    setAuthMode('login')
                    setShowAuth(true)
                  }}
                  _hover={{
                    bg: "whiteAlpha.100",
                  }}
                >
                  Sign In
                </Button>
                <Button
                  size="md"
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  color="white"
                  onClick={() => {
                    setAuthMode('signup')
                    setShowAuth(true)
                  }}
                  _hover={{
                    bgGradient: "linear(to-r, blue.500, purple.600)",
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </HStack>
          
          {/* Mobile Navigation Button */}
          <Button
            display={{ base: 'flex', md: 'none' }}
            variant="ghost"
            color="white"
            onClick={onNavOpen}
            _hover={{
              bg: "whiteAlpha.100",
            }}
          >
            Menu
          </Button>
        </Flex>
      </Box>

      {/* Mobile Navigation Drawer */}
      {renderNavigationDrawer()}

      {/* Background Elements */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="100%"
        bgGradient="linear(165deg, blue.900, purple.900)"
        opacity={0.9}
        zIndex={0}
      />
      
      {/* Wave Pattern */}
      <Box
        position="absolute"
        top="50%"
        left={0}
        right={0}
        height="50%"
        bgImage="url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSIzMTYiIHZpZXdCb3g9IjAgMCAxNDQwIDMxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQ0MCAyODAuOEM5NjAgMjgwLjggNzIwIDAsIDAgMFYzMTZIMTQ0MFYyODAuOFoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcikiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXIiIHgxPSI3MjAiIHkxPSIwIiB4Mj0iNzIwIiB5Mj0iMzE2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzJCNjhEQyIgc3RvcC1vcGFjaXR5PSIwLjA1Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMkI2OERDIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=')"
        bgRepeat="no-repeat"
        bgPosition="bottom"
        bgSize="cover"
        opacity={0.1}
        transform="rotate(180deg)"
      />

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        position="relative"
        zIndex={1}
        width="100%"
      >
        <Container 
          maxW="container.xl" 
          px={{ base: 4, md: 8 }}
          py={{ base: 6, md: 12 }}
        >
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1.2fr" }} gap={12} alignItems="center">
            <GridItem>
              <VStack spacing={8} align="flex-start">
                <Badge
                  colorScheme="blue"
                  px={4}
                  py={2}
                  borderRadius="full"
                  fontSize="md"
                  textTransform="none"
                  bgGradient="linear(to-r, blue.400, purple.400)"
                >
                  Instant Test Automation
                </Badge>

                <VStack spacing={6} align="flex-start">
                  <Heading
                    size="3xl"
                    bgGradient="linear(to-r, blue.100, purple.100)"
                    bgClip="text"
                    lineHeight="1.2"
                    fontWeight="bold"
                    letterSpacing="tight"
                  >
                    Paste HTML,<br />
                    Get Tests
                  </Heading>

                  <Text fontSize="xl" color="whiteAlpha.800" lineHeight="tall" maxW="container.sm">
                    Transform your Scribe recordings into powerful automated tests in seconds. Just paste your HTML and we'll handle the rest.
                  </Text>
                </VStack>

                <HStack spacing={8} mt={4} width="full">
                  <VStack align="center" spacing={2}>
                    <Text fontSize="3xl">🚀</Text>
                    <Text color="white" fontWeight="semibold">
                      Instant Setup
                    </Text>
                  </VStack>
                  <VStack align="center" spacing={2}>
                    <Text fontSize="3xl">☁️</Text>
                    <Text color="white" fontWeight="semibold">
                      Cloud Execution
                    </Text>
                  </VStack>
                  <VStack align="center" spacing={2}>
                    <Text fontSize="3xl">📊</Text>
                    <Text color="white" fontWeight="semibold">
                      Live Results
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </GridItem>

            <GridItem>
              <Box
                bg="gray.800"
                borderRadius="2xl"
                p={8}
                boxShadow="xl"
                border="1px"
                borderColor="whiteAlpha.100"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '2xl',
                  background: 'linear-gradient(45deg, rgba(59,130,246,0.05) 0%, rgba(147,51,234,0.05) 100%)',
                  pointerEvents: 'none'
                }}
              >
                <OnboardingFlow onComplete={handleOnboardingComplete} />
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </MotionBox>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        defaultMode={authMode}
      />
    </Box>
  )
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <VStack
      align="flex-start"
      spacing={3}
    >
      <Text fontSize="3xl">{icon}</Text>
      <Text color="white" fontWeight="semibold" fontSize="lg">
        {title}
      </Text>
      <Text color="whiteAlpha.700">
        {description}
      </Text>
    </VStack>
  )
}
