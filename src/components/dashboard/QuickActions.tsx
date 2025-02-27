'use client'

import React from 'react'
import { SimpleGrid, Box, VStack, Text, Button, Icon, useColorModeValue } from '@chakra-ui/react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const QUICK_ACTIONS = [
  {
    title: 'Record Test',
    description: 'Record a new test case using Scribe',
    icon: '📝',
    href: '/import',
    color: 'blue'
  },
  {
    title: 'Create Sequence',
    description: 'Combine tests into a sequence',
    icon: '⚡',
    href: '/sequences/new',
    color: 'purple'
  },
  {
    title: 'Link Jira Ticket',
    description: 'Associate tests with tickets',
    icon: '🎫',
    href: '/tickets',
    color: 'green'
  },
  {
    title: 'View Results',
    description: 'Check recent test results',
    icon: '✅',
    href: '/results',
    color: 'orange'
  }
]

export function QuickActions() {
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.100', 'gray.600')

  return (
    <SimpleGrid columns={[1, 2, 4]} spacing={4} w="full">
      {QUICK_ACTIONS.map((action) => (
        <Link key={action.title} href={action.href}>
          <MotionBox
            p={4}
            bg={bgColor}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            cursor="pointer"
            whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
            whileTap={{ y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <VStack align="start" spacing={3}>
              <Text fontSize="2xl" lineHeight="1">
                {action.icon}
              </Text>
              <Box>
                <Text fontWeight="500" mb={1}>
                  {action.title}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {action.description}
                </Text>
              </Box>
            </VStack>
          </MotionBox>
        </Link>
      ))}
    </SimpleGrid>
  )
} 