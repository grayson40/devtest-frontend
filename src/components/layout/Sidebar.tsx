'use client'

import React from 'react'
import { Box, VStack, HStack, Text, Divider, useBreakpointValue } from '@chakra-ui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiList, FiPlay, FiSettings, FiServer, FiLayers, FiActivity, FiGitBranch } from 'react-icons/fi'

// Simple navigation items
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: FiHome,
  },
  {
    label: 'Tests',
    href: '/tests',
    icon: FiList,
  },
  {
    label: 'Sequences',
    href: '/sequences',
    icon: FiLayers,
  },
  {
    label: 'Executions',
    href: '/executions',
    icon: FiPlay,
  },
  {
    label: 'Agents',
    href: '/agents',
    icon: FiServer,
  },
]

// NavItem component
const NavItem = ({ item, onNavigate }: { 
  item: { label: string; href: string; icon: any; };
  onNavigate?: () => void;
}) => {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
  const Icon = item.icon

  return (
    <Link href={item.href} onClick={onNavigate}>
      <HStack
        spacing={3}
        px={4}
        py={3}
        borderRadius="md"
        bg={isActive ? 'whiteAlpha.100' : 'transparent'}
        color={isActive ? 'white' : 'gray.400'}
        _hover={{
          bg: 'whiteAlpha.100',
          color: 'white',
        }}
        transition="all 0.2s"
        cursor="pointer"
      >
        <Box fontSize="lg">
          <Icon />
        </Box>
        <Text fontWeight={isActive ? 'medium' : 'normal'}>
          {item.label}
        </Text>
      </HStack>
    </Link>
  )
}

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const isMobile = useBreakpointValue({ base: true, md: false })
  
  return (
    <Box
      as="aside"
      w="240px"
      h="100vh"
      bg="gray.800"
      borderRight="1px"
      borderColor="gray.700"
      position={isMobile ? 'relative' : 'fixed'}
      left={0}
      top={0}
      py={4}
      boxShadow="sm"
      overflowY="auto"
    >
      <VStack h="full" align="stretch" spacing={6}>
        <Box px={4}>
          <Link href="/dashboard" onClick={onNavigate}>
            <HStack spacing={2}>
              <Text fontSize="xl" lineHeight="1">
                🌐
              </Text>
              <Text 
                fontWeight="bold" 
                color="white"
              >
                Compass
              </Text>
            </HStack>
          </Link>
        </Box>

        <Divider borderColor="gray.700" />

        <VStack align="stretch" spacing={1}>
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.label} item={item} onNavigate={onNavigate} />
          ))}
        </VStack>

        <Box flex="1" />

        <Divider borderColor="gray.700" />

        <Box px={4} pb={2}>
          <Link href="/settings" onClick={onNavigate}>
            <HStack
              spacing={3}
              px={4}
              py={3}
              borderRadius="md"
              color="gray.400"
              _hover={{
                bg: 'whiteAlpha.100',
                color: 'white',
              }}
              transition="all 0.2s"
              cursor="pointer"
            >
              <Box fontSize="lg">
                <FiSettings />
              </Box>
              <Text>Settings</Text>
            </HStack>
          </Link>
        </Box>
      </VStack>
    </Box>
  )
} 