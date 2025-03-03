'use client'

import React from 'react'
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Badge,
  Flex,
  Icon,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Link,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { testsApi } from '@/api/tests'
import { SimpleLayout } from '@/components/layout'
import { motion } from 'framer-motion'
import NextLink from 'next/link'
import { 
  FiPlay, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiPlus,
  FiRefreshCw,
  FiList,
} from 'react-icons/fi'

const MotionBox = motion(Box)

export default function DashboardPage() {
  // Fetch active test executions
  const { data: activeExecutions, isLoading: isLoadingActive, refetch: refetchActive } = useQuery({
    queryKey: ['activeExecutions'],
    queryFn: testsApi.getActiveExecutions,
    refetchInterval: 5000, // Poll every 5 seconds for active tests
  })

  // Fetch recent test results
  const { data: recentResults, isLoading: isLoadingResults } = useQuery({
    queryKey: ['recentResults'],
    queryFn: () => testsApi.getTestResults({ limit: 5 }).then(data => data.results),
  })

  // Fetch recent test cases
  const { data: recentTests, isLoading: isLoadingTests } = useQuery({
    queryKey: ['recentTests'],
    queryFn: testsApi.getRecent,
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return 'green';
      case 'failed':
        return 'red';
      case 'running':
        return 'blue';
      case 'queued':
        return 'orange';
      case 'error':
        return 'red';
      case 'skipped':
        return 'gray';
      default:
        return 'gray';
    }
  }

  const formatDuration = (duration: number) => {
    if (duration < 1000) {
      return `${duration}ms`;
    }
    
    const seconds = Math.floor(duration / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  return (
    <SimpleLayout>
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading 
              size="lg" 
              mb={2}
              bgGradient="linear(to-r, blue.600, purple.600)"
              bgClip="text"
            >
              Dashboard
            </Heading>
            <Text color={useColorModeValue("gray.600", "gray.400")}>Overview of your testing activity</Text>
          </Box>
          <Button
            leftIcon={<Icon as={FiRefreshCw} />}
            variant="outline"
            onClick={() => {
              refetchActive();
            }}
            _hover={{
              borderColor: "purple.400",
              color: "purple.500"
            }}
          >
            Refresh
          </Button>
        </Flex>

        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          {/* Active Tests Section */}
          <GridItem colSpan={{ base: 12, lg: 8 }}>
            <Card variant="gradient" shadow="md">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Active Tests</Heading>
                  <NextLink href="/tests" passHref>
                    <Button as="a" size="sm" variant="ghost">View All</Button>
                  </NextLink>
                </Flex>
              </CardHeader>
              <CardBody>
                {isLoadingActive ? (
                  <Box textAlign="center" py={10}>
                    <Spinner size="lg" color="primary.500" />
                    <Text mt={4} color={useColorModeValue("gray.500", "gray.400")}>Loading active tests...</Text>
                  </Box>
                ) : activeExecutions && activeExecutions.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {activeExecutions.map((execution) => (
                      <Box 
                        key={execution.id} 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md" 
                        borderColor={useColorModeValue("gray.200", "gray.700")}
                        bg={useColorModeValue("gray.50", "gray.800")}
                        _hover={{
                          borderColor: useColorModeValue("blue.200", "blue.700"),
                          transform: "translateY(-2px)",
                          transition: "all 0.2s ease-in-out"
                        }}
                      >
                        <Flex justify="space-between" align="center" mb={2}>
                          <HStack>
                            <Icon as={FiPlay} color="blue.500" />
                            <Text fontWeight="medium">Test #{execution.id.slice(-4)}</Text>
                            <Badge colorScheme="blue">Running</Badge>
                          </HStack>
                          <NextLink href={`/tests/${execution.testCase}/run`} passHref>
                            <Button as="a" size="xs" variant="gradient">
                              View
                            </Button>
                          </NextLink>
                        </Flex>
                        <Progress 
                          value={75} 
                          size="sm" 
                          variant="gradient"
                          borderRadius="full"
                          mb={2}
                        />
                        <Flex justify="space-between" fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                          <Text>Started: {new Date(execution.startTime).toLocaleTimeString()}</Text>
                          <Text>Environment: {execution.environment}</Text>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text color={useColorModeValue("gray.500", "gray.400")} mb={4}>No active tests running</Text>
                    <NextLink href="/import" passHref>
                      <Button as="a" leftIcon={<Icon as={FiPlus} />} variant="gradient" size="sm">
                        Start New Test
                      </Button>
                    </NextLink>
                  </Box>
                )}
              </CardBody>
            </Card>
          </GridItem>

          {/* Test Statistics */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <Card variant="gradient" shadow="md">
              <CardHeader>
                <Heading size="md">Test Statistics</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel>Total Tests</StatLabel>
                    <StatNumber>42</StatNumber>
                    <StatHelpText>
                      <Icon as={FiList} mr={1} />
                      All test cases
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Success Rate</StatLabel>
                    <StatNumber>87%</StatNumber>
                    <StatHelpText>
                      <Icon as={FiCheckCircle} mr={1} color="green.500" />
                      Last 30 days
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Avg. Duration</StatLabel>
                    <StatNumber>1m 24s</StatNumber>
                    <StatHelpText>
                      <Icon as={FiClock} mr={1} />
                      Per test
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>This Month</StatLabel>
                    <StatNumber>18</StatNumber>
                    <StatHelpText>
                      <Icon as={FiPlay} mr={1} color="blue.500" />
                      Test executions
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>
          </GridItem>

          {/* Recent Results */}
          <GridItem colSpan={{ base: 12, md: 6 }}>
            <Card variant="gradient" shadow="md">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Recent Results</Heading>
                  <NextLink href="/results" passHref>
                    <Button as="a" size="sm" variant="ghost">View All</Button>
                  </NextLink>
                </Flex>
              </CardHeader>
              <CardBody>
                {isLoadingResults ? (
                  <Box textAlign="center" py={6}>
                    <Spinner size="md" color="primary.500" />
                  </Box>
                ) : recentResults && recentResults.length > 0 ? (
                  <VStack spacing={3} align="stretch">
                    {recentResults.map((result) => (
                      <Flex 
                        key={result.id} 
                        p={3} 
                        borderWidth="1px" 
                        borderRadius="md"
                        borderColor="gray.200"
                        justify="space-between"
                        align="center"
                      >
                        <HStack>
                          <Icon 
                            as={
                              result.status === 'passed' ? FiCheckCircle : 
                              result.status === 'failed' ? FiXCircle : 
                              FiAlertCircle
                            } 
                            color={`${getStatusColor(result.status)}.500`}
                          />
                          <Box>
                            <Text fontWeight="medium" fontSize="sm">
                              Test #{result.id.slice(-4)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(result.startTime).toLocaleDateString()} • {formatDuration(result.duration)}
                            </Text>
                          </Box>
                        </HStack>
                        <Badge colorScheme={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </Flex>
                    ))}
                  </VStack>
                ) : (
                  <Box textAlign="center" py={6}>
                    <Text color="gray.500">No recent test results</Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          </GridItem>

          {/* Recent Test Cases */}
          <GridItem colSpan={{ base: 12, md: 6 }}>
            <Card variant="gradient" shadow="md">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Recent Test Cases</Heading>
                  <NextLink href="/tests" passHref>
                    <Button as="a" size="sm" variant="ghost">View All</Button>
                  </NextLink>
                </Flex>
              </CardHeader>
              <CardBody>
                {isLoadingTests ? (
                  <Box textAlign="center" py={6}>
                    <Spinner size="md" color="primary.500" />
                  </Box>
                ) : recentTests && recentTests.length > 0 ? (
                  <VStack spacing={3} align="stretch">
                    {recentTests.map((test) => (
                      <Flex 
                        key={test.id} 
                        p={3} 
                        borderWidth="1px" 
                        borderRadius="md"
                        borderColor="gray.200"
                        justify="space-between"
                        align="center"
                      >
                        <Box>
                          <Text fontWeight="medium" fontSize="sm">
                            {test.title}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {test.steps?.length || 0} steps
                          </Text>
                        </Box>
                        <HStack>
                          <NextLink href={`/tests/${test.id}/run`} passHref>
                            <Button as="a" size="xs" leftIcon={<Icon as={FiPlay} />} colorScheme="primary" variant="outline">
                              Run
                            </Button>
                          </NextLink>
                          <NextLink href={`/tests/${test.id}`} passHref>
                            <Button as="a" size="xs" variant="ghost">
                              Edit
                            </Button>
                          </NextLink>
                        </HStack>
                      </Flex>
                    ))}
                  </VStack>
                ) : (
                  <Box textAlign="center" py={6}>
                    <Text color="gray.500">No recent test cases</Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Box>
    </SimpleLayout>
  )
}
