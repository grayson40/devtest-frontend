'use client'

import React from 'react'
import { Box, Flex, Container, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerBody } from '@chakra-ui/react'
import { Sidebar, Navbar } from './index'
import { HamburgerIcon } from '@chakra-ui/icons'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
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

      {/* Mobile Drawer Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="gray.800" maxW="240px">
          <DrawerCloseButton color="white" />
          <DrawerBody p={0}>
            <Sidebar onNavigate={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Box
        flex="1"
        ml={{ base: 0, md: "240px" }}
        bg="gray.900"
        minH="100vh"
        backgroundAttachment="fixed"
      >
        <Navbar>
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            display={{ base: 'flex', md: 'none' }}
            variant="ghost"
            color="gray.400"
            onClick={onOpen}
            size="md"
          />
        </Navbar>
        <Container 
          maxW="container.xl" 
          py={8} 
          px={{ base: 4, md: 8 }}
        >
          {children}
        </Container>
      </Box>
    </Flex>
  )
} 