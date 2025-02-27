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
      <HStack spacing={4}>
        <InputGroup maxW="320px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        <Select
          maxW="200px"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
          >
            Sort by: {sortField}
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleSort('title')}>
              Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </MenuItem>
            <MenuItem onClick={() => handleSort('status')}>
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
              hasActiveExecution={test._id ? activeExecutions.includes(test.id) : false}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Box
          p={8}
          textAlign="center"
          bg="white"
          borderRadius="lg"
          border="1px"
          borderColor="gray.200"
        >
          <Text color="gray.500">
            {searchQuery || statusFilter !== 'all'
              ? 'No tests match your search criteria'
              : 'No tests available'}
          </Text>
        </Box>
      )}
    </VStack>
  )
} 