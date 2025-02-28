import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Input,
  Button,
  Text,
  useToast,
  FormControl,
  FormLabel,
  Divider,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { useAuth } from '@/context/AuthContext'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { authApi } from '@/api/auth'
import { useRouter } from 'next/navigation'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'login' | 'signup'
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, signup } = useAuth()
  const toast = useToast()
  const router = useRouter()
  useEffect(() => {
    setMode(defaultMode)
  }, [defaultMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup(name, email, password)
      }
      onClose()
      toast({
        title: mode === 'login' ? 'Logged in successfully!' : 'Account created successfully!',
        status: 'success',
        duration: 3000,
      })
      router.push('/tests')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubLogin = () => {
    window.location.href = authApi.getGithubAuthUrl()
  }

  const handleGoogleLogin = () => {
    window.location.href = authApi.getGoogleAuthUrl()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg="gray.900" border="1px" borderColor="whiteAlpha.200">
        <ModalHeader color="white">
          {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <Button
              width="full"
              variant="outline"
              leftIcon={<Icon as={FaGithub} />}
              onClick={handleGithubLogin}
              color="white"
              borderColor="whiteAlpha.200"
              _hover={{
                bg: 'whiteAlpha.100',
              }}
            >
              Continue with GitHub
            </Button>
            <Button
              width="full"
              variant="outline"
              leftIcon={<Icon as={FcGoogle} />}
              onClick={handleGoogleLogin}
              color="white"
              borderColor="whiteAlpha.200"
              _hover={{
                bg: 'whiteAlpha.100',
              }}
            >
              Continue with Google
            </Button>

            <HStack w="full" py={2}>
              <Divider borderColor="whiteAlpha.400" />
              <Text color="whiteAlpha.600" fontSize="sm" whiteSpace="nowrap" px={3}>
                or continue with email
              </Text>
              <Divider borderColor="whiteAlpha.400" />
            </HStack>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4}>
                {mode === 'signup' && (
                  <FormControl>
                    <FormLabel color="whiteAlpha.800">Name</FormLabel>
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      bg="whiteAlpha.50"
                      border="1px"
                      borderColor="whiteAlpha.200"
                      color="white"
                      _placeholder={{ color: 'whiteAlpha.400' }}
                    />
                  </FormControl>
                )}
                <FormControl>
                  <FormLabel color="whiteAlpha.800">Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="whiteAlpha.50"
                    border="1px"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _placeholder={{ color: 'whiteAlpha.400' }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="whiteAlpha.800">Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="whiteAlpha.50"
                    border="1px"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _placeholder={{ color: 'whiteAlpha.400' }}
                  />
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={isLoading}
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  _hover={{
                    bgGradient: "linear(to-r, blue.500, purple.600)",
                  }}
                >
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
                <Text color="whiteAlpha.600" fontSize="sm">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <Button
                    variant="link"
                    color="blue.400"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    fontSize="sm"
                  >
                    {mode === 'login' ? 'Sign up' : 'Log in'}
                  </Button>
                </Text>
              </VStack>
            </form>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 