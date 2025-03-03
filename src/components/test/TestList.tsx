'use client'

import React, { useState, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Text,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { TestCard } from './TestCard'
import { TestCase } from '@/api/tests'

interface TestListProps {
  tests: TestCase[]
  onTestClick: (testId: string) => void
  onRunTest: (testId: string) => void
  onViewExecution: (testId: string) => void
  onDeleteTest: (testId: string) => void
  activeExecutions?: string[]
}

type SortField = 'title' | 'status'
type SortOrder = 'asc' | 'desc'

export function TestList({ 
  tests, 
  onTestClick, 
  onRunTest,
  onViewExecution,
  onDeleteTest,
  activeExecutions = []
}: TestListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const filteredAndSortedTests = useMemo(() => {
    return tests
      .filter(test => {
        const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.description?.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || test.status === statusFilter
        
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        let comparison = 0
        
        switch (sortField) {
          case 'title':
            comparison = a.title.localeCompare(b.title)
            break
          case 'status':
            comparison = (a.status || '').localeCompare(b.status || '')
            break
        }
        
        return sortOrder === 'asc' ? comparison : -comparison
      })
  }, [tests, searchQuery, statusFilter, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack spacing={4} flexWrap={{ base: 'wrap', md: 'nowrap' }}>
        <InputGroup maxW="320px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color={useColorModeValue("gray.400", "gray.500")} />
          </InputLeftElement>
          <Input
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg={useColorModeValue("white", "gray.800")}
            borderColor={useColorModeValue("gray.200", "gray.700")}
            _hover={{
              borderColor: useColorModeValue("gray.300", "gray.600")
            }}
            _focus={{
              borderColor: useColorModeValue("blue.500", "blue.400"),
              boxShadow: useColorModeValue(
                "0 0 0 1px rgba(66, 153, 225, 0.6)",
                "0 0 0 1px rgba(99, 179, 237, 0.6)"
              )
            }}
          />
        </InputGroup>

        <Select
          maxW="200px"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          bg={useColorModeValue("white", "gray.800")}
          borderColor={useColorModeValue("gray.200", "gray.700")}
          _hover={{
            borderColor: useColorModeValue("gray.300", "gray.600")
          }}
          _focus={{
            borderColor: useColorModeValue("blue.500", "blue.400"),
            boxShadow: useColorModeValue(
              "0 0 0 1px rgba(66, 153, 225, 0.6)",
              "0 0 0 1px rgba(99, 179, 237, 0.6)"
            )
          }}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </Select>

        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            variant="outline"
            size="md"
            borderColor={useColorModeValue("gray.200", "gray.700")}
            _hover={{
              bg: useColorModeValue("gray.50", "whiteAlpha.100"),
              borderColor: useColorModeValue("gray.300", "gray.600")
            }}
          >
            Sort by: {sortField}
          </MenuButton>
          <MenuList
            bg={useColorModeValue("white", "gray.800")}
            borderColor={useColorModeValue("gray.200", "gray.700")}
            boxShadow="lg"
          >
            <MenuItem 
              onClick={() => handleSort('title')}
              _hover={{
                bg: useColorModeValue("gray.50", "whiteAlpha.100")
              }}
            >
              Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </MenuItem>
            <MenuItem 
              onClick={() => handleSort('status')}
              _hover={{
                bg: useColorModeValue("gray.50", "whiteAlpha.100")
              }}
            >
              Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>

      {filteredAndSortedTests.length > 0 ? (
        <SimpleGrid columns={[1, null, 2]} spacing={6}>
          {filteredAndSortedTests.map(test => (
            <TestCard
              key={test.id}
              test={{
                ...test,
                id: test.id || '',
                status: test.status || 'draft'
              }}
              onRun={() => onRunTest(test._id || '')}
              onClick={() => onTestClick(test._id || '')}
              onViewExecution={() => onViewExecution(test._id || '')}
              onDelete={() => onDeleteTest(test._id || '')}
              hasActiveExecution={activeExecutions.includes(test._id || '')}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Box
          p={8}
          textAlign="center"
          bg={useColorModeValue("white", "gray.800")}
          borderRadius="lg"
          border="1px"
          borderColor={useColorModeValue("gray.200", "gray.700")}
          boxShadow="sm"
        >
          <Text color={useColorModeValue("gray.500", "gray.400")}>
            {searchQuery || statusFilter !== 'all'
              ? 'No tests match your search criteria'
              : 'No tests available'}
          </Text>
        </Box>
      )}
    </VStack>
  )
} 