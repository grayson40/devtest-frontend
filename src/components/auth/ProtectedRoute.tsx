'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Box, Spinner, VStack, Text } from '@chakra-ui/react'
import { AuthModal } from './AuthModal'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = React.useState(false)

  useEffect(() => {
    // If not loading and no user, show auth modal
    if (!isLoading && !user) {
      setShowAuthModal(true)
    }
  }, [user, isLoading])

  // Handle auth modal close - redirect to home if still not authenticated
  const handleAuthModalClose = () => {
    if (!user) {
      router.push('/')
    } else {
      setShowAuthModal(false)
    }
  }

  if (isLoading) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="gray.900"
      >
        <VStack spacing={4}>
          <Spinner 
            size="xl" 
            color="blue.400" 
            thickness="4px"
            emptyColor="gray.700"
            speed="0.8s"
          />
          <Text color="gray.400">Loading...</Text>
        </VStack>
      </Box>
    )
  }

  if (!user) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="gray.900"
      >
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={handleAuthModalClose} 
          defaultMode="login" 
        />
      </Box>
    )
  }

  return <>{children}</>
} 