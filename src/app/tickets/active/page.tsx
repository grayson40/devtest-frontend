'use client'

import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Button,
  SimpleGrid,
  Progress,
  Divider,
  Link as ChakraLink,
  Heading,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/layout'
import Link from 'next/link'

interface TestStep {
  id: string
  action: string
  expected: string
  status: 'passed' | 'failed' | 'pending' | 'running'
}

interface Test {
  id: string
  title: string
  status: 'running' | 'passed' | 'failed' | 'not_run'
  progress?: number
  steps: TestStep[]
}

interface Ticket {
  id: string
  key: string
  title: string
  status: 'In Testing' | 'Ready for Test' | 'Done'
  tests: Test[]
}

// Mock data - replace with API call
const mockTickets: Ticket[] = [
  {
    id: '1',
    key: 'DEV-123',
    title: 'Implement user authentication flow',
    status: 'In Testing',
    tests: [
      {
        id: 't1',
        title: 'Login with valid credentials',
        status: 'running',
        progress: 60,
        steps: [
          { id: 's1', action: 'Navigate to login', expected: 'Login form visible', status: 'passed' },
          { id: 's2', action: 'Enter credentials', expected: 'Fields populated', status: 'running' },
          { id: 's3', action: 'Submit form', expected: 'Redirect to dashboard', status: 'pending' }
        ]
      },
      {
        id: 't2',
        title: 'Password reset flow',
        status: 'not_run',
        steps: []
      }
    ]
  },
  {
    id: '2',
    key: 'DEV-124',
    title: 'Add product search functionality',
    status: 'Ready for Test',
    tests: [
      {
        id: 't3',
        title: 'Search with filters',
        status: 'not_run',
        steps: []
      }
    ]
  }
]

function TicketCard({ ticket }: { ticket: Ticket }) {
  const statusColors = {
    'In Testing': 'blue',
    'Ready for Test': 'yellow',
    'Done': 'green'
  }

  return (
    <Card>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <HStack>
                <ChakraLink
                  href={`https://tpgstudios-team.atlassian.net/browse/${ticket.key}`}
                  isExternal
                  color="primary.500"
                  fontWeight="medium"
                >
                  {ticket.key}
                </ChakraLink>
                <Badge colorScheme={statusColors[ticket.status]}>
                  {ticket.status}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.700">
                {ticket.title}
              </Text>
            </VStack>
            <Link href={`/tickets/${ticket.id}/tests/new`}>
              <Button size="sm" variant="outline">
                Add Test
              </Button>
            </Link>
          </HStack>

          <Divider />

          <VStack align="stretch" spacing={3}>
            {ticket.tests.map(test => (
              <Box key={test.id} p={3} bg="gray.50" borderRadius="md">
                <HStack justify="space-between" mb={2}>
                  <HStack>
                    <Text fontSize="sm" fontWeight="medium">
                      {test.title}
                    </Text>
                    <Badge
                      colorScheme={
                        test.status === 'passed' ? 'green' :
                        test.status === 'failed' ? 'red' :
                        test.status === 'running' ? 'blue' : 'gray'
                      }
                    >
                      {test.status}
                    </Badge>
                  </HStack>
                  <Link href={`/tests/${test.id}/run`}>
                    <Button size="xs">
                      {test.status === 'running' ? 'View Run' : 'Run Test'}
                    </Button>
                  </Link>
                </HStack>

                {test.status === 'running' && (
                  <Progress
                    value={test.progress}
                    size="sm"
                    colorScheme="blue"
                    hasStripe
                    isAnimated
                  />
                )}

                {test.steps.length > 0 && (
                  <VStack align="stretch" mt={2} spacing={1}>
                    {test.steps.map(step => (
                      <HStack key={step.id} fontSize="xs" color="gray.600">
                        <Badge
                          size="sm"
                          colorScheme={
                            step.status === 'passed' ? 'green' :
                            step.status === 'failed' ? 'red' :
                            step.status === 'running' ? 'blue' : 'gray'
                          }
                        >
                          {step.status}
                        </Badge>
                        <Text>{step.action}</Text>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>
            ))}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default function ActiveTicketsPage() {
  return (
    <AppLayout>
      <Box p={8}>
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between">
            <Box>
              <Heading size="lg" mb={2}>Test Tickets</Heading>
              <Text color="gray.600">
                Track and manage test requirements
              </Text>
            </Box>
          </HStack>

          <SimpleGrid columns={[1, null, 2]} spacing={6}>
            {mockTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
    </AppLayout>
  )
} 