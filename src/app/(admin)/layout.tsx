'use client'

import React from 'react'
import { Box, Flex, Container } from '@chakra-ui/react'
import Sidebar from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <Flex minH="100vh">
        {/* Desktop Sidebar - visible on md and larger screens */}
        <Box
          display={{ base: 'none', md: 'block' }}
          w="240px"
          position="fixed"
          left={0}
          top={0}
          h="100vh"
          zIndex={20}
        >
          <Sidebar />
        </Box>

        <Box
          flex="1"
          ml={{ base: 0, md: "240px" }}
          bg="gray.900"
          minH="100vh"
          backgroundAttachment="fixed"
        >
          <Navbar />
          <Container 
            maxW="container.xl" 
            py={8} 
            px={{ base: 4, md: 8 }}
          >
            {children}
          </Container>
        </Box>
      </Flex>
    </ProtectedRoute>
  )
} 