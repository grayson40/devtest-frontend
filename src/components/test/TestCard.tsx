'use client'

import React from 'react'
import { Box, Text, HStack, Badge, IconButton, Tooltip, Flex, Spacer } from '@chakra-ui/react'
import { FiPlay, FiEdit, FiTrash2, FiEye } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { TestCase } from '@/api/tests'

const MotionBox = motion(Box)

interface TestCardProps {
  test: TestCase & { id: string }
  onRun?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
  onViewExecution?: () => void
  hasActiveExecution?: boolean
}

export function TestCard({ 
  test, 
  onRun, 
  onEdit, 
  onDelete,
  onClick,
  onViewExecution,
  hasActiveExecution 
}: TestCardProps) {
  return (
    <MotionBox
      p={4}
      borderRadius="lg"
      bg="gray.800"
      borderWidth="1px"
      borderColor="gray.700"
      boxShadow="sm"
      cursor="pointer"
      onClick={onClick}
      whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.2)' }}
      transition={{ duration: 0.2 }}
      position="relative"
    >
      {hasActiveExecution && (
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme="blue"
          variant="solid"
          fontSize="xs"
          px={2}
          py={1}
          borderRadius="full"
        >
          Running
        </Badge>
      )}

      <Text 
        fontWeight="semibold" 
        fontSize="lg" 
        mb={1}
        color="white"
        noOfLines={1}
      >
        {test.title}
      </Text>
      
      <Text 
        fontSize="sm" 
        color="gray.400" 
        mb={3}
        noOfLines={2}
      >
        {test.description || 'No description provided'}
      </Text>
      
      <Flex align="center">
        <Badge 
          colorScheme={
            test.status === 'active' ? 'green' : 
            test.status === 'draft' ? 'yellow' : 
            'gray'
          }
          mr={2}
        >
          {test.status || 'draft'}
        </Badge>
        
        <Text fontSize="xs" color="gray.500">
          {test.steps?.length || 0} steps
        </Text>
        
        <Spacer />
        
        <HStack spacing={1} onClick={e => e.stopPropagation()}>
          {hasActiveExecution && onViewExecution && (
            <Tooltip label="View execution">
              <IconButton
                aria-label="View execution"
                icon={<FiEye />}
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={e => {
                  e.stopPropagation()
                  onViewExecution()
                }}
              />
            </Tooltip>
          )}
          
          {!hasActiveExecution && onRun && (
            <Tooltip label="Run test">
              <IconButton
                aria-label="Run test"
                icon={<FiPlay />}
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={e => {
                  e.stopPropagation()
                  onRun()
                }}
              />
            </Tooltip>
          )}
          
          {onEdit && (
            <Tooltip label="Edit test">
              <IconButton
                aria-label="Edit test"
                icon={<FiEdit />}
                size="sm"
                variant="ghost"
                onClick={e => {
                  e.stopPropagation()
                  onEdit()
                }}
              />
            </Tooltip>
          )}
          
          {onDelete && (
            <Tooltip label="Delete test">
              <IconButton
                aria-label="Delete test"
                icon={<FiTrash2 />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={e => {
                  e.stopPropagation()
                  onDelete()
                }}
              />
            </Tooltip>
          )}
        </HStack>
      </Flex>
    </MotionBox>
  )
} 