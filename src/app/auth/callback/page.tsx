'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/auth'
import { Box, Spinner, Text, VStack } from '@chakra-ui/react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const provider = searchParams.get('provider') as 'github' | 'google'

        if (!code || !provider) {
          throw new Error('Invalid callback parameters')
        }

        const response = await authApi.handleSocialAuth(provider, code)
        
        // Store the token and user data
        localStorage.setItem('auth_token', response.token)
        
        // Redirect to home page
        router.push('/')
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/?error=auth_failed')
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <Box minH="100vh" bg="gray.900" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.400" thickness="4px" />
        <Text color="white" fontSize="lg">
          Completing authentication...
        </Text>
      </VStack>
    </Box>
  )
} 