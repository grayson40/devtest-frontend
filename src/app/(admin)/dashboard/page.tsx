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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  StatArrow,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { testsApi } from '@/api/tests'
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
import { ErrorState, LoadingState } from '@/components/common'

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
    <Box>
      <Box mb={8}>
        <Heading 
          as="h1" 
          size="xl" 
          mb={4}
          color="white"
        >
          Dashboard
        </Heading>
        <Text color="gray.400" mb={6}>
          Overview of your test management platform
        </Text>
        <HStack spacing={4}>
          <Link href="/import" as="a">
            <Button 
              leftIcon={<Icon as={FiPlus} />} 
              colorScheme="blue"
            >
              Create Test
            </Button>
          </Link>
          <Button 
            variant="outline" 
            leftIcon={<Icon as={FiRefreshCw} />}
            onClick={() => refetchActive()}
          >
            Refresh
          </Button>
        </HStack>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat
          bg="gray.800"
          p={4}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <StatLabel color="gray.400">Total Tests</StatLabel>
          <StatNumber color="white">0</StatNumber>
          <StatHelpText color="gray.400">
            <StatArrow type="increase" />
            0%
          </StatHelpText>
        </Stat>
        
        <Stat
          bg="gray.800"
          p={4}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <StatLabel color="gray.400">Active Agents</StatLabel>
          <StatNumber color="white">0</StatNumber>
          <StatHelpText color="gray.400">
            <StatArrow type="increase" />
            0%
          </StatHelpText>
        </Stat>
        
        <Stat
          bg="gray.800"
          p={4}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <StatLabel color="gray.400">Success Rate</StatLabel>
          <StatNumber color="white">0%</StatNumber>
          <StatHelpText color="gray.400">
            <StatArrow type="increase" />
            0%
          </StatHelpText>
        </Stat>
        
        <Stat
          bg="gray.800"
          p={4}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <StatLabel color="gray.400">Environments</StatLabel>
          <StatNumber color="white">0</StatNumber>
          <StatHelpText color="gray.400">
            <StatArrow type="increase" />
            0%
          </StatHelpText>
        </Stat>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        <Box
          bg="gray.800"
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <Heading as="h3" size="md" mb={4} color="white">
            Recent Test Executions
          </Heading>
          
          {isLoadingActive ? (
            <LoadingState message="Loading executions..." />
          ) : activeExecutions && activeExecutions.length > 0 ? (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th color="gray.400">Test</Th>
                  <Th color="gray.400">Status</Th>
                  <Th color="gray.400">Duration</Th>
                  <Th color="gray.400">Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {activeExecutions.map((execution) => (
                  <Tr key={execution.id}>
                    <Td color="white">Test #{execution.id.slice(-4)}</Td>
                    <Td>
                      <Badge colorScheme="blue">Running</Badge>
                    </Td>
                    <Td color="white">--</Td>
                    <Td color="white">{new Date(execution.startTime).toLocaleTimeString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text color="gray.400" textAlign="center" py={4}>
              No recent executions
            </Text>
          )}
        </Box>

        <Box
          bg="gray.800"
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <Heading as="h3" size="md" mb={4} color="white">
            Environment Status
          </Heading>
          
          <Flex direction="column" gap={4}>
            <Text color="gray.400" textAlign="center" py={4}>
              No environments configured
            </Text>
          </Flex>
        </Box>
      </SimpleGrid>

      <Box
        bg="gray.800"
        p={6}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.700"
      >
        <Heading as="h3" size="md" mb={4} color="white">
          Test Health Overview
        </Heading>
        
        <Text color="gray.400" textAlign="center" py={4}>
          No test data available
        </Text>
      </Box>
    </Box>
  )
}
