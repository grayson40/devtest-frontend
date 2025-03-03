'use client'

import React from 'react'
import { Box, Flex, HStack, Input, InputGroup, InputLeftElement, Button, Menu, MenuButton, MenuList, MenuItem, IconButton, Text, Avatar, Divider } from '@chakra-ui/react'
import { SearchIcon, AddIcon, ChevronDownIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  children?: React.ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <Box 
      as="nav" 
      bg="gray.800"
      borderBottom="1px" 
      borderColor="gray.700"
      position="sticky"
      top={0}
      zIndex={1000}
      px={4}
      py={2}
      boxShadow="sm"
    >
      <Flex h={12} alignItems="center" gap={4}>
        {/* Mobile Menu Button (passed as children) */}
        {children}
        
        {/* Quick Actions */}
        <HStack spacing={2} mr={6}>
          <Link href="/dashboard">
            <HStack spacing={2} cursor="pointer">
              <Text fontSize="xl" lineHeight="1">
                🌐
              </Text>
              <Text 
                fontWeight="semibold" 
                display={{ base: 'none', md: 'block' }}
                color="white"
              >
                Compass
              </Text>
            </HStack>
          </Link>
        </HStack>

        {/* Search Bar */}
        <InputGroup maxW={{ base: "140px", md: "320px" }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="Search tests..."
            size="sm"
            bg="gray.700"
            border="1px"
            borderColor="gray.600"
            _placeholder={{ color: "gray.400" }}
            _hover={{ bg: "gray.600" }}
            _focus={{ 
              bg: "gray.700",
              borderColor: "primary.500",
              boxShadow: "none"
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
              colorScheme="blue"
              rightIcon={<ChevronDownIcon />}
              leftIcon={<AddIcon />}
            >
              Create
            </MenuButton>
            <MenuList p={2} boxShadow="lg" borderColor="gray.700" bg="gray.800">
              <Link href="/import">
                <MenuItem 
                  icon={<Text fontSize="xl">🧪</Text>}
                  borderRadius="md"
                  _hover={{
                    bg: "whiteAlpha.100",
                  }}
                >
                  <Box>
                    <Text fontWeight="medium">Test Case</Text>
                    <Text fontSize="xs" color="gray.400">Record and automate tests</Text>
                  </Box>
                </MenuItem>
              </Link>
              <Link href="/sequences/new">
                <MenuItem 
                  icon={<Text fontSize="xl">⚡</Text>}
                  borderRadius="md"
                  _hover={{
                    bg: "whiteAlpha.100",
                  }}
                >
                  <Box>
                    <Text fontWeight="medium">Test Sequence</Text>
                    <Text fontSize="xs" color="gray.400">Chain multiple tests together</Text>
                  </Box>
                </MenuItem>
              </Link>
            </MenuList>
          </Menu>

          {/* Profile Menu */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              size="sm"
              _hover={{
                bg: "whiteAlpha.200",
              }}
            >
              <HStack spacing={2}>
                <Avatar 
                  size="xs" 
                  name={user?.name || "User"} 
                  bg="blue.500"
                  color="white"
                />
                <Text display={{ base: 'none', md: 'block' }}>
                  {user?.name || user?.email || 'User'}
                </Text>
                <ChevronDownIcon />
              </HStack>
            </MenuButton>
            <MenuList
              shadow="lg"
              py={1}
              bg="gray.800"
              borderColor="gray.700"
            >
              <Box px={3} py={2} mb={2}>
                <Text fontWeight="medium">{user?.name || "User"}</Text>
                <Text fontSize="sm" color="gray.400">{user?.email || "user@example.com"}</Text>
              </Box>
              <Divider mb={2} />
              <MenuItem
                icon={<Text>⚙️</Text>}
                borderRadius="md"
                _hover={{
                  bg: "whiteAlpha.100",
                }}
                onClick={() => router.push('/settings')}
              >
                Settings
              </MenuItem>
              <MenuItem
                icon={<Text>👋</Text>}
                borderRadius="md"
                color="red.300"
                _hover={{
                  bg: "red.900",
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