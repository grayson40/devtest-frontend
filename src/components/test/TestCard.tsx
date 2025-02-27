'use client'

import React from 'react'
import { Box, Flex, Text, Badge, Button, IconButton, Menu, MenuButton, MenuList, MenuItem, HStack, Icon, Portal } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { TestCase, TestStatus } from '@/api/tests'

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

const statusColors: Record<TestStatus, string> = {
  draft: 'gray',
  active: 'green',
  archived: 'red'
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
  const status = test.status || 'draft'

  return (
    <MotionBox
      bg="white"
      p={5}
      borderRadius="lg"
      boxShadow="sm"
      position="relative"
      cursor="pointer"
      onClick={onClick}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '3px',
        bg: `${statusColors[status]}.500`,
      }}
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      }}
      transition="all 0.2s"
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
    >
      <Flex direction="column" h="full">
        <Flex justify="space-between" align="start" mb={3}>
          <Box flex="1">
            <Text fontWeight="medium" mb={1} color="gray.900">
              {test.title}
            </Text>
            {test.description && (
              <Text fontSize="sm" color="gray.600" noOfLines={2} mb={2}>
                {test.description}
              </Text>
            )}
            <HStack spacing={2} mb={2}>
              <Badge
                px={2}
                py={0.5}
                bg={`${statusColors[status]}.100`}
                color={`${statusColors[status]}.700`}
                fontWeight="medium"
                fontSize="xs"
                borderRadius="full"
                textTransform="capitalize"
              >
                {status}
              </Badge>
              <Badge
                px={2}
                py={0.5}
                bg="gray.100"
                color="gray.600"
                fontWeight="medium"
                fontSize="xs"
                borderRadius="full"
              >
                {test.steps.length} steps
              </Badge>
            </HStack>
          </Box>
        </Flex>

        <Flex justify="space-between" align="center" mt="auto">
          <HStack spacing={2}>
            {hasActiveExecution ? (
              <Button
                size="sm"
                colorScheme="primary"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewExecution?.()
                }}
                leftIcon={<span>👁️</span>}
                _hover={{
                  bg: 'primary.50',
                }}
              >
                View Run
              </Button>
            ) : (
              <Button
                size="sm"
                colorScheme="primary"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onRun?.()
                }}
                _hover={{
                  bg: 'primary.50',
                }}
              >
                Run
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.()
              }}
              _hover={{
                bg: 'gray.50',
              }}
            >
              Edit
            </Button>
          </HStack>

          <Box position="relative">
            <Menu isLazy placement="bottom-end" gutter={4} strategy="fixed" autoSelect={false}>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                variant="ghost"
                size="sm"
                icon={<span>⋮</span>}
                onClick={(e) => e.stopPropagation()}
                _hover={{
                  bg: 'gray.100',
                }}
                _active={{
                  bg: 'gray.200',
                }}
              />
              <Portal>
                <MenuList
                  shadow="lg"
                  py={1}
                  onClick={(e) => e.stopPropagation()}
                  minW="140px"
                  zIndex={1400}
                >
                  <MenuItem
                    _hover={{
                      bg: 'gray.50',
                    }}
                  >
                    Duplicate
                  </MenuItem>
                  <MenuItem 
                    onClick={onDelete} 
                    color="red.500"
                    _hover={{
                      bg: 'red.50',
                    }}
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>
    </MotionBox>
  )
} 