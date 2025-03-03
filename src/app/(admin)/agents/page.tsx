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
import { FiPlus, FiRefreshCw, FiCpu } from 'react-icons/fi'
import { ErrorState, LoadingState } from '@/components/common'

export default function AgentsPage() {
  return (
    <Box>
      <Box mb={8}>
        <Heading 
          as="h1" 
          size="xl" 
          mb={4}
          color="white"
        >
          Test Agents
        </Heading>
        <Text color="gray.400" mb={6}>
          Manage test execution agents and worker nodes
        </Text>
        <HStack spacing={4}>
          <Button 
            leftIcon={<Icon as={FiPlus} />} 
            colorScheme="blue"
          >
            Register Agent
          </Button>
          <Button 
            variant="outline" 
            leftIcon={<Icon as={FiRefreshCw} />}
          >
            Refresh
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
          Agent Status
        </Heading>
        
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th color="gray.400">Name</Th>
              <Th color="gray.400">Status</Th>
              <Th color="gray.400">Environment</Th>
              <Th color="gray.400">Last Seen</Th>
              <Th color="gray.400">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {/* Agent rows would go here */}
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
        <Icon as={FiCpu} boxSize={12} color="gray.500" mb={4} />
        <Heading as="h3" size="md" mb={2} color="white">
          No Agents Registered
        </Heading>
        <Text color="gray.400" mb={6}>
          Register your first agent to start running tests
        </Text>
        <Button 
          leftIcon={<Icon as={FiPlus} />} 
          colorScheme="blue"
        >
          Register Agent
        </Button>
      </Box>
    </Box>
  )
} 