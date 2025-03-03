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
  Card,
  CardBody,
} from '@chakra-ui/react'
import { FiPlus, FiRefreshCw, FiList, FiPlay } from 'react-icons/fi'
import { ErrorState, LoadingState } from '@/components/common'

export default function SequencesPage() {
  return (
    <Box>
      <Box mb={8}>
        <Heading 
          as="h1" 
          size="xl" 
          mb={4}
          color="white"
        >
          Test Sequences
        </Heading>
        <Text color="gray.400" mb={6}>
          Create and manage sequences of tests for batch execution
        </Text>
        <HStack spacing={4}>
          <Button 
            leftIcon={<Icon as={FiPlus} />} 
            colorScheme="blue"
          >
            Create Sequence
          </Button>
          <Button 
            variant="outline" 
            leftIcon={<Icon as={FiRefreshCw} />}
          >
            Refresh
          </Button>
        </HStack>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        {/* Sequence cards would go here */}
      </SimpleGrid>

      <Box
        bg="gray.800"
        p={6}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.700"
        textAlign="center"
      >
        <Icon as={FiList} boxSize={12} color="gray.500" mb={4} />
        <Heading as="h3" size="md" mb={2} color="white">
          No Test Sequences
        </Heading>
        <Text color="gray.400" mb={6}>
          Create your first sequence to run multiple tests in order
        </Text>
        <Button 
          leftIcon={<Icon as={FiPlus} />} 
          colorScheme="blue"
        >
          Create Sequence
        </Button>
      </Box>
    </Box>
  )
} 