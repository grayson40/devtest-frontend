'use client'

import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  HStack,
  VStack,
  Badge,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Progress,
  Tooltip,
} from '@chakra-ui/react'
import { ChevronDownIcon, RepeatIcon } from '@chakra-ui/icons'
import { AppLayout } from '@/components/layout'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TestSequence {
  id: string
  name: string
  description?: string
  testCount: number
  lastRun?: string
  status: 'not_run' | 'running' | 'passed' | 'failed'
  progress?: number
  parallelTests: number
  totalDuration?: number
}

// Mock data - replace with API call
const mockSequences: TestSequence[] = [
  {
    id: '1',
    name: 'Core User Flows',
    description: 'Essential user journeys through the application',
    testCount: 5,
    lastRun: '2024-03-01T10:00:00Z',
    status: 'passed',
    parallelTests: 2,
    totalDuration: 180, // seconds
  },
  {
    id: '2',
    name: 'Payment Processing',
    description: 'End-to-end payment flow validation',
    testCount: 3,
    lastRun: '2024-03-01T09:00:00Z',
    status: 'failed',
    parallelTests: 1,
    totalDuration: 120,
  },
  {
    id: '3',
    name: 'Data Import/Export',
    description: 'Bulk data operations and file handling',
    testCount: 4,
    status: 'running',
    progress: 45,
    parallelTests: 2,
  },
  {
    id: '4',
    name: 'Admin Functions',
    description: 'Administrative operations and settings',
    testCount: 6,
    status: 'not_run',
    parallelTests: 3,
  },
]

function SequenceCard({ sequence }: { sequence: TestSequence }) {
  const statusColors = {
    not_run: 'gray',
    running: 'blue',
    passed: 'green',
    failed: 'red',
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <Card>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Heading size="md">{sequence.name}</Heading>
              <Text color="gray.600" fontSize="sm" noOfLines={2}>
                {sequence.description}
              </Text>
            </VStack>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<ChevronDownIcon />}
                variant="ghost"
                aria-label="Sequence options"
              />
              <MenuList>
                <MenuItem icon={<Text>▶️</Text>}>Run Sequence</MenuItem>
                <MenuItem icon={<RepeatIcon />}>View History</MenuItem>
                <MenuItem>Edit Sequence</MenuItem>
                <MenuItem color="red.500">Delete</MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          <HStack wrap="wrap" spacing={3}>
            <Badge colorScheme={statusColors[sequence.status]}>
              {sequence.status === 'not_run' ? 'Not Run' : sequence.status}
            </Badge>
            <Badge colorScheme="purple">
              {sequence.parallelTests} parallel
            </Badge>
            <Text fontSize="sm" color="gray.500">
              {sequence.testCount} tests
            </Text>
            {sequence.totalDuration && (
              <Text fontSize="sm" color="gray.500">
                {formatDuration(sequence.totalDuration)}
              </Text>
            )}
          </HStack>

          {sequence.status === 'running' && sequence.progress && (
            <Box>
              <Progress
                value={sequence.progress}
                size="sm"
                colorScheme="blue"
                hasStripe
                isAnimated
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {sequence.progress}% complete
              </Text>
            </Box>
          )}

          {sequence.lastRun && (
            <Text fontSize="sm" color="gray.500">
              Last run: {new Date(sequence.lastRun).toLocaleString()}
            </Text>
          )}

          <HStack>
            <Button
              size="sm"
              colorScheme="primary"
              leftIcon={<Text>▶️</Text>}
              isDisabled={sequence.status === 'running'}
            >
              Run Now
            </Button>
            <Link href={`/sequences/${sequence.id}`}>
              <Button size="sm" variant="ghost">
                View Details
              </Button>
            </Link>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default function SequencesPage() {
  const router = useRouter()

  return (
    <AppLayout>
        <Box p={8}>
          <HStack justify="space-between" mb={4}>
            <Box>
              <Heading size="lg" mb={2}>Test Sequences</Heading>
              <Text color="gray.600">
                Chain and organize multiple test cases
              </Text>
            </Box>
            <Button
              colorScheme="primary"
              onClick={() => router.push('/sequences/new')}
              leftIcon={<Text>⚡</Text>}
            >
              New Sequence
            </Button>
          </HStack>

          <SimpleGrid columns={[1, null, 2]} spacing={6}>
            {mockSequences.map(sequence => (
              <SequenceCard key={sequence.id} sequence={sequence} />
            ))}
          </SimpleGrid>
        </Box>
    </AppLayout>
  )
} 