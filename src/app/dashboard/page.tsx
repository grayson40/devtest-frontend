'use client'

import React from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Progress,
  Code,
  Flex,
  Icon,
  Button,
  Divider,
  Spinner,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/layout'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { testsApi, TestResult } from '@/api/tests'
import Link from 'next/link'

const MotionBox = motion(Box)

export default function DashboardPage() {
  const { data: recentTests, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recent-tests'],
    queryFn: () => testsApi.getRecent(),
  })

  const { data: activeExecutions, isLoading: isLoadingExecutions } = useQuery({
    queryKey: ['active-executions'],
    queryFn: () => testsApi.getActiveExecutions(),
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  return (
    <AppLayout>
      <Box p={8}>
        <VStack spacing={8} align="stretch">
          {/* Welcome Section */}
          <Box>
            <Heading size="lg" mb={2}>Welcome to Compass</Heading>
            <Text color="gray.600">
              Monitor your tests, view results, and manage your testing infrastructure.
            </Text>
          </Box>

          {/* Quick Actions */}
          <Box>
            <Heading size="md" mb={4}>Quick Actions</Heading>
            <QuickActions />
          </Box>

          {/* Active Tests */}
          <Box>
            <Heading size="md" mb={4}>Active Tests</Heading>
            {isLoadingExecutions ? (
              <Card>
                <CardBody>
                  <VStack py={8}>
                    <Spinner size="xl" color="blue.500" />
                    <Text color="gray.500">Loading active tests...</Text>
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {activeExecutions?.map((execution: TestResult) => (
                  <Card key={execution.id}>
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{execution.testCase}</Text>
                            <HStack>
                              <Badge 
                                colorScheme={!execution.endTime ? 'blue' : execution.status === 'passed' ? 'green' : 'red'}
                              >
                                {!execution.endTime ? 'Running' : execution.status}
                              </Badge>
                              <Text fontSize="sm" color="gray.500">
                                Started {new Date(execution.startTime).toLocaleTimeString()}
                              </Text>
                            </HStack>
                          </VStack>
                          <Link href={`/tests/${execution.testCase}/run/${execution.id}`}>
                            <Button size="sm" variant="outline">View Details</Button>
                          </Link>
                        </HStack>

                        {/* Progress */}
                        <Box>
                          <Progress
                            value={execution.duration ? (execution.duration / (execution.duration + 1000)) * 100 : 0}
                            size="sm"
                            colorScheme="blue"
                            borderRadius="full"
                            isIndeterminate={!execution.endTime}
                          />
                        </Box>

                        {/* Recent Logs */}
                        <Box bg="gray.900" p={3} borderRadius="md" maxH="150px" overflowY="auto">
                          <VStack align="stretch" spacing={1}>
                            {execution.screenshots?.slice(-3).map((screenshot, index) => (
                              <HStack key={index} color="white" fontSize="sm" fontFamily="mono">
                                <Text color={execution.status === 'passed' ? 'green.300' : execution.status === 'failed' ? 'red.300' : 'blue.300'}>
                                  {execution.status === 'passed' ? '✓' : execution.status === 'failed' ? '✕' : '○'}
                                </Text>
                                <Text>Step {screenshot.step}</Text>
                                <Text color="gray.500">{new Date(screenshot.timestamp).toLocaleTimeString()}</Text>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
                {(!activeExecutions || activeExecutions.length === 0) && (
                  <Card>
                    <CardBody>
                      <VStack align="center" spacing={3} py={8}>
                        <Text fontSize="lg" color="gray.500">No Active Tests</Text>
                        <Text fontSize="sm" color="gray.400">
                          Start a new test run to see real-time results here
                        </Text>
                        <Link href="/tests">
                          <Button size="sm" colorScheme="blue">Run a Test</Button>
                        </Link>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </SimpleGrid>
            )}
          </Box>

          {/* Recent Test Results */}
          <Box>
            <Heading size="md" mb={4}>Recent Results</Heading>
            {isLoadingRecent ? (
              <Card>
                <CardBody>
                  <VStack py={8}>
                    <Spinner size="xl" color="blue.500" />
                    <Text color="gray.500">Loading recent results...</Text>
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {recentTests?.map((test: any) => (
                  <Card key={test.id}>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">{test.title}</Text>
                          <Badge colorScheme={test.lastResult === 'passed' ? 'green' : 'red'}>
                            {test.lastResult}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Last run: {new Date(test.lastRun).toLocaleDateString()}
                        </Text>
                        <HStack fontSize="sm" color="gray.500">
                          <Text>Duration: {test.duration}s</Text>
                          <Text>•</Text>
                          <Text>Steps: {test.totalSteps}</Text>
                        </HStack>
                        <Link href={`/tests/${test.id}`}>
                          <Button size="sm" variant="ghost" width="full">
                            View Details
                          </Button>
                        </Link>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
                {(!recentTests || recentTests.length === 0) && (
                  <Card>
                    <CardBody>
                      <VStack align="center" spacing={3} py={8}>
                        <Text fontSize="lg" color="gray.500">No Recent Tests</Text>
                        <Text fontSize="sm" color="gray.400">
                          Your recent test results will appear here
                        </Text>
                        <Link href="/tests">
                          <Button size="sm" colorScheme="blue">View All Tests</Button>
                        </Link>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </SimpleGrid>
            )}
          </Box>
        </VStack>
      </Box>
    </AppLayout>
  )
}
