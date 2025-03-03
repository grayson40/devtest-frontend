'use client'

import React from 'react'
import { Box, Container } from '@chakra-ui/react'
import { Navbar } from '@/components/layout/Navbar'

interface SimpleLayoutProps {
  children: React.ReactNode
  fullWidth?: boolean
  showHeader?: boolean
  transparentHeader?: boolean
}

export default function SimpleLayout({ 
  children, 
  fullWidth = false, 
  showHeader = true,
  transparentHeader = false
}: SimpleLayoutProps) {
  return (
    <Box 
      minH="100vh" 
      bg="gray.900"
      backgroundAttachment="fixed"
    >
      {showHeader && <Navbar />}
      <Container 
        maxW={fullWidth ? "100%" : "container.xl"} 
        py={8} 
        px={fullWidth ? 0 : { base: 4, md: 8 }}
        h="100%"
      >
        {children}
      </Container>
    </Box>
  )
} 