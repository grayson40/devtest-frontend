'use client'

import React from 'react'
import { Box, VStack, HStack, Text, Button, Badge } from '@chakra-ui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SECTIONS = [
  {
    title: 'TEST MANAGEMENT',
    items: [
      { 
        label: 'Tests', 
        href: '/tests', 
        icon: '🧪',
        description: 'Manage test cases' 
      },
      // { 
      //   label: 'Tickets', 
      //   href: '/tickets', 
      //   icon: '🎫',
      //   description: 'Test requirements' 
      // },
      { 
        label: 'Sequences', 
        href: '/sequences', 
        icon: '⚡',
        description: 'Multi-step test flows' 
      }
    ]
  },
  {
    title: 'EXECUTION',
    items: [
      { 
        label: 'Active Tests', 
        href: '/tests/running', 
        icon: '▶️',
        highlight: true,
        description: 'Currently running tests' 
      },
      { 
        label: 'Results', 
        href: '/results', 
        icon: '📊',
        description: 'Test execution history' 
      },
    ]
  }
]

const NavItem = ({ item }: { item: { label: string; href: string; icon: string; highlight?: boolean; description?: string } }) => {
  const pathname = usePathname()
  const isActive = pathname === item.href
  
  return (
    <Link href={item.href} style={{ width: '100%' }}>
      <VStack
        w="full"
        px={3}
        py={2}
        spacing={1}
        borderRadius="md"
        cursor="pointer"
        color={isActive ? 'primary.500' : 'gray.600'}
        bg={isActive ? 'primary.50' : 'transparent'}
        _hover={{
          bg: isActive ? 'primary.100' : 'gray.50',
        }}
        transition="all 0.2s"
        align="start"
      >
        <HStack spacing={3}>
          <Text fontSize="lg" lineHeight="1">
            {item.icon}
          </Text>
          <Text fontSize="sm" fontWeight={isActive ? '500' : '400'}>
            {item.label}
          </Text>
          {item.highlight && (
            <Badge colorScheme="green" variant="subtle" fontSize="xs">
              Live
            </Badge>
          )}
        </HStack>
        {item.description && (
          <Text fontSize="xs" color="gray.500" pl={8}>
            {item.description}
          </Text>
        )}
      </VStack>
    </Link>
  )
}

export default function Sidebar() {
  return (
    <Box
      as="aside"
      w="240px"
      h="100vh"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      position="fixed"
      left={0}
      top={0}
      py={4}
    >
      <VStack h="full" align="stretch" spacing={6}>
        <Box px={4}>
          <Link href="/dashboard">
            <HStack spacing={2}>
              <Text fontSize="xl" lineHeight="1">
                🌐
              </Text>
              <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                Compass
              </Text>
            </HStack>
          </Link>
        </Box>

        {SECTIONS.map((section) => (
          <Box key={section.title}>
            <Text px={4} py={2} fontSize="xs" fontWeight="500" color="gray.500">
              {section.title}
            </Text>
            <VStack align="stretch" spacing={1}>
              {section.items.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </VStack>
          </Box>
        ))}

        <Box mt="auto" px={3}>
          <Link href="/import">
            <Button
              variant="solid"
              colorScheme="primary"
              size="sm"
              width="full"
              leftIcon={<Text>📄</Text>}
            >
              Import Scribe Test
            </Button>
          </Link>
        </Box>
      </VStack>
    </Box>
  )
} 