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
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { useMutation } from '@tanstack/react-query'
import { testsApi } from '@/api/tests'
import { useAuth } from '@/context/AuthContext'
import { AuthModal } from '@/components/auth/AuthModal'

const MotionBox = motion(Box)
const MotionText = motion(Text)

export default function Home() {
  const [showSignUp, setShowSignUp] = React.useState(false)
  const [showAuth, setShowAuth] = React.useState(false)
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login')
  const [testCreated, setTestCreated] = React.useState(false)
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
      setTimeout(() => {
        window.location.href = `/tests/${result.id}/run`
      }, 1500)
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
  }) => {
    if (!user) {
      setAuthMode('signup')
      setShowAuth(true)
      return
    }
    await createTestMutation.mutateAsync(data.html)
  }

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
                _hover={{
                  bg: "whiteAlpha.100",
                }}
                onClick={() => setShowSignUp(true)}
              >
                Save & Configure
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.900" position="relative" overflow="hidden" display="flex" alignItems="center">
      {/* Auth Buttons */}
      <Box position="fixed" top={4} right={4} zIndex={10}>
        {user ? (
          <Button
            size={{ base: 'sm', md: 'md' }}
            bgGradient="linear(to-r, blue.400, purple.500)"
            color="white"
            onClick={() => window.location.href = '/dashboard'}
            _hover={{
              bgGradient: "linear(to-r, blue.500, purple.600)",
            }}
          >
            Go to Console
          </Button>
        ) : (
          <HStack spacing={2}>
            <Button
              size={{ base: 'sm', md: 'md' }}
              variant="ghost"
              color="whiteAlpha.900"
              onClick={() => {
                setAuthMode('login')
                setShowAuth(true)
              }}
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              Sign In
            </Button>
            <Button
              size={{ base: 'sm', md: 'md' }}
              bgGradient="linear(to-r, blue.400, purple.500)"
              color="white"
              onClick={() => {
                setAuthMode('signup')
                setShowAuth(true)
              }}
              _hover={{
                bgGradient: "linear(to-r, blue.500, purple.600)",
              }}
              display={{ base: 'none', sm: 'inline-flex' }}
            >
              Sign Up
            </Button>
          </HStack>
        )}
      </Box>

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
          mt={{ base: 16, md: 0 }}
        >
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={16} alignItems="center">
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
                  Automated Testing Made Simple
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
                    Record Once,<br />
                    Test Everywhere
                  </Heading>

                  <Text fontSize="xl" color="whiteAlpha.800" lineHeight="tall" maxW="container.sm">
                    Transform your Scribe recordings into powerful automated tests. Run them in our secure cloud infrastructure and get results in minutes.
                  </Text>
                </VStack>

                <Grid templateColumns="repeat(2, 1fr)" gap={6} width="full">
                  <Feature
                    icon="🎯"
                    title="Zero Setup"
                    description="Import your Scribe recording and start testing instantly"
                  />
                  <Feature
                    icon="☁️"
                    title="Cloud Native"
                    description="Run tests in isolated, secure environments"
                  />
                  <Feature
                    icon="⚡"
                    title="Lightning Fast"
                    description="Get test results in real-time"
                  />
                  <Feature
                    icon="🔄"
                    title="Auto-Healing"
                    description="Tests that adapt to UI changes"
                  />
                </Grid>
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
      spacing={2}
      p={4}
      bg="whiteAlpha.100"
      borderRadius="lg"
      transition="all 0.2s"
      _hover={{
        bg: 'whiteAlpha.200',
        transform: 'translateY(-2px)',
      }}
    >
      <Text fontSize="2xl">{icon}</Text>
      <Text color="whiteAlpha.900" fontWeight="semibold" fontSize="sm">
        {title}
      </Text>
      <Text color="whiteAlpha.600" fontSize="sm">
        {description}
      </Text>
    </VStack>
  )
}
