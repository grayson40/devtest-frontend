'use client'

import React from 'react'
import { Box, Flex, Container } from '@chakra-ui/react'
import { Sidebar, Navbar } from './index'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box
        flex="1"
        ml="240px" // Same as sidebar width
        bg="gray.50"
        minH="100vh"
      >
        <Navbar />
        <Container 
          maxW="container.xl" 
          py={8} 
          px={8}
        >
          {children}
        </Container>
      </Box>
    </Flex>
  )
} 