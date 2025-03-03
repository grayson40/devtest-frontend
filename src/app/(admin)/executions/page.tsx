'use client'

import React from 'react'
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Badge,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react'
import { FiRefreshCw, FiPlay, FiFilter, FiClock } from 'react-icons/fi'
import { ErrorState, LoadingState } from '@/components/common'

export default function ExecutionsPage() {
  return (
    <Box>
      <Box mb={8}>
        <Heading 
          as="h1" 
          size="xl" 
          mb={4}
          color="white"
        >
          Test Executions
        </Heading>
        <Text color="gray.400" mb={6}>
          View and manage test execution history
        </Text>
        <HStack spacing={4}>
          <Button 
            variant="outline" 
            leftIcon={<Icon as={FiRefreshCw} />}
          >
            Refresh
          </Button>
          <Button 
            variant="outline" 
            leftIcon={<Icon as={FiFilter} />}
          >
            Filter
          </Button>
        </HStack>
      </Box>

      <Box
        bg="gray.800"
        p={6}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.700"
        mb={8}
      >
        <Heading as="h3" size="md" mb={4} color="white">
          Recent Executions
        </Heading>
        
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th color="gray.400">ID</Th>
              <Th color="gray.400">Test</Th>
              <Th color="gray.400">Status</Th>
              <Th color="gray.400">Duration</Th>
              <Th color="gray.400">Started</Th>
              <Th color="gray.400">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {/* Execution rows would go here */}
          </Tbody>
        </Table>
      </Box>

      <Box
        bg="gray.800"
        p={6}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.700"
        textAlign="center"
      >
        <Icon as={FiClock} boxSize={12} color="gray.500" mb={4} />
        <Heading as="h3" size="md" mb={2} color="white">
          No Test Executions
        </Heading>
        <Text color="gray.400" mb={6}>
          Run a test to see execution history
        </Text>
        <Button 
          leftIcon={<Icon as={FiPlay} />} 
          colorScheme="blue"
        >
          Run Test
        </Button>
      </Box>
    </Box>
  )
} 