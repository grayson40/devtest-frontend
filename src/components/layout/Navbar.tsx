'use client'

import React from 'react'
import { Box, Flex, HStack, Input, InputGroup, InputLeftElement, Button, Menu, MenuButton, MenuList, MenuItem, IconButton, Text, Avatar, Divider } from '@chakra-ui/react'
import { SearchIcon, AddIcon, ChevronDownIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <Box 
      as="nav" 
      bg="white" 
      borderBottom="1px" 
      borderColor="gray.200"
      position="sticky"
      top={0}
      zIndex={1000}
      px={4}
      py={2}
    >
      <Flex h={12} alignItems="center" gap={4}>
        {/* Quick Actions */}
        <HStack spacing={2} mr={6} />

        {/* Search Bar */}
        <InputGroup maxW="320px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search tests, tickets, or sequences..."
            size="sm"
            bg="gray.50"
            border="1px"
            borderColor="gray.200"
            _placeholder={{ color: 'gray.500' }}
            _hover={{ bg: 'gray.100' }}
            _focus={{ 
              bg: 'white',
              borderColor: 'primary.500',
              boxShadow: 'none'
            }}
            borderRadius="md"
          />
        </InputGroup>

        <HStack spacing={3} ml="auto">
          {/* Create Menu */}
          <Menu>
            <MenuButton
              as={Button}
              size="sm"
              colorScheme="primary"
              rightIcon={<ChevronDownIcon />}
              leftIcon={<AddIcon />}
            >
              Create
            </MenuButton>
            <MenuList p={2}>
              <Link href="/import">
                <MenuItem 
                  icon={<Text fontSize="xl">🧪</Text>}
                  borderRadius="md"
                  _hover={{
                    bg: 'primary.50',
                  }}
                >
                  <Box>
                    <Text fontWeight="medium">Test Case</Text>
                    <Text fontSize="xs" color="gray.500">Record and automate tests</Text>
                  </Box>
                </MenuItem>
              </Link>
              <Link href="/sequences/new">
                <MenuItem 
                  icon={<Text fontSize="xl">⚡</Text>}
                  borderRadius="md"
                  _hover={{
                    bg: 'primary.50',
                  }}
                >
                  <Box>
                    <Text fontWeight="medium">Test Sequence</Text>
                    <Text fontSize="xs" color="gray.500">Chain multiple tests together</Text>
                  </Box>
                </MenuItem>
              </Link>
            </MenuList>
          </Menu>

          {/* Profile Menu */}
          <Menu>
            <MenuButton
              as={Button}
              size="sm"
              variant="ghost"
              px={2}
              _hover={{ bg: 'gray.100' }}
            >
              <HStack spacing={2}>
                <Avatar size="xs" name="User" bg="primary.500" />
                <ChevronDownIcon />
              </HStack>
            </MenuButton>
            <MenuList p={2} minW="200px">
              <Box px={3} py={2} mb={2}>
                <Text fontWeight="medium">{user?.name}</Text>
                <Text fontSize="sm" color="gray.500">{user?.email}</Text>
              </Box>
              <Divider mb={2} />
              <MenuItem
                icon={<Text>⚙️</Text>}
                borderRadius="md"
                _hover={{
                  bg: 'gray.50',
                }}
                onClick={() => router.push('/settings')}
              >
                Settings
              </MenuItem>
              <MenuItem
                icon={<Text>👋</Text>}
                borderRadius="md"
                color="red.500"
                _hover={{
                  bg: 'red.50',
                }}
                onClick={() => {
                  logout()
                  router.push('/')
                }}
              >
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  )
} 