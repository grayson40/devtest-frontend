'use client'

import React from 'react'
import {
  Box,
  Flex,
  HStack,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Icon,
  Avatar,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiHome, FiPlay, FiLogIn, FiPlus, FiChevronDown, FiMenu } from 'react-icons/fi'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface AppHeaderProps {
  transparent?: boolean
  showCreateButton?: boolean
}

export function AppHeader({ transparent = false, showCreateButton = true }: AppHeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const bgColor = transparent 
    ? 'transparent' 
    : useColorModeValue('white', 'gray.800')
  const textColor = transparent 
    ? 'white' 
    : useColorModeValue('gray.800', 'white')
  const borderColor = transparent 
    ? 'whiteAlpha.200' 
    : useColorModeValue('gray.200', 'gray.700')
  const hoverBg = transparent 
    ? 'whiteAlpha.200' 
    : useColorModeValue('gray.100', 'whiteAlpha.100')

  return (
    <>
      <Box
        as="header"
        bg={bgColor}
        borderBottom={transparent ? 'none' : '1px'}
        borderColor={borderColor}
        py={3}
        px={4}
        boxShadow={transparent ? 'none' : 'sm'}
      >
        <Flex justify="space-between" align="center">
          {/* Logo */}
          <Link href="/" passHref>
            <HStack spacing={2} cursor="pointer">
              <Text fontSize="xl" lineHeight="1" color={textColor}>
                🌐
              </Text>
            </HStack>
          </Link>

          {/* Desktop Navigation */}
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            {user ? (
              <>
                <Link href="/dashboard" passHref>
                  <Button
                    variant="ghost"
                    color={textColor}
                    _hover={{ bg: hoverBg }}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/tests" passHref>
                  <Button
                    variant="ghost"
                    color={textColor}
                    _hover={{ bg: hoverBg }}
                  >
                    Tests
                  </Button>
                </Link>
                
                {showCreateButton && (
                  <Menu>
                    <MenuButton
                      as={Button}
                      size="md"
                      variant="gradient"
                      rightIcon={<FiChevronDown />}
                      leftIcon={<FiPlus />}
                    >
                      Create
                    </MenuButton>
                    <MenuList boxShadow="lg" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                      <Link href="/import" passHref>
                        <MenuItem 
                          icon={<Text fontSize="xl">🧪</Text>}
                          _hover={{
                            bg: useColorModeValue('blue.50', 'whiteAlpha.100'),
                          }}
                        >
                          <Box>
                            <Text fontWeight="medium">Test Case</Text>
                            <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>Record and automate tests</Text>
                          </Box>
                        </MenuItem>
                      </Link>
                      <Link href="/sequences/new" passHref>
                        <MenuItem 
                          icon={<Text fontSize="xl">⚡</Text>}
                          _hover={{
                            bg: useColorModeValue('purple.50', 'whiteAlpha.100'),
                          }}
                        >
                          <Box>
                            <Text fontWeight="medium">Test Sequence</Text>
                            <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>Chain multiple tests together</Text>
                          </Box>
                        </MenuItem>
                      </Link>
                    </MenuList>
                  </Menu>
                )}

                {/* User Menu */}
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    _hover={{ bg: hoverBg }}
                  >
                    <HStack>
                      <Avatar 
                        size="xs" 
                        name={user.name} 
                        bgGradient="linear(to-r, blue.400, purple.500)"
                        color="white"
                      />
                      <FiChevronDown />
                    </HStack>
                  </MenuButton>
                  <MenuList boxShadow="lg" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                    <Box px={3} py={2}>
                      <Text fontWeight="medium">{user.name}</Text>
                      <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>{user.email}</Text>
                    </Box>
                    <Divider my={2} />
                    <MenuItem 
                      icon={<Text>⚙️</Text>} 
                      onClick={() => router.push('/settings')}
                      _hover={{
                        bg: useColorModeValue('gray.50', 'whiteAlpha.100'),
                      }}
                    >
                      Settings
                    </MenuItem>
                    <MenuItem 
                      icon={<Text>👋</Text>} 
                      onClick={handleLogout} 
                      color="red.500"
                      _hover={{
                        bg: useColorModeValue('red.50', 'red.900'),
                      }}
                    >
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <>
                <Link href="/import" passHref>
                  <Button
                    variant="ghost"
                    color={textColor}
                    _hover={{ bg: hoverBg }}
                  >
                    Try It Free
                  </Button>
                </Link>
                <Link href="/?auth=login" passHref>
                  <Button
                    variant="ghost"
                    color={textColor}
                    _hover={{ bg: hoverBg }}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/?auth=signup" passHref>
                  <Button
                    variant="gradient"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </HStack>

          {/* Mobile Menu Button */}
          <Button
            display={{ base: 'flex', md: 'none' }}
            variant="ghost"
            color={textColor}
            onClick={onOpen}
            _hover={{ bg: hoverBg }}
          >
            <Icon as={FiMenu} boxSize={5} />
          </Button>
        </Flex>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <Flex direction="column" gap={4} mt={4}>
              {user ? (
                <>
                  <Box 
                    px={3} 
                    py={2} 
                    bg={useColorModeValue('gray.50', 'gray.800')} 
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                  >
                    <HStack mb={2}>
                      <Avatar 
                        size="sm" 
                        name={user.name} 
                        bgGradient="linear(to-r, blue.400, purple.500)"
                        color="white"
                      />
                      <Box>
                        <Text fontWeight="medium">{user.name}</Text>
                        <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>{user.email}</Text>
                      </Box>
                    </HStack>
                  </Box>
                  <Link href="/dashboard" passHref>
                    <Button
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<Icon as={FiHome} />}
                      onClick={onClose}
                      w="full"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/tests" passHref>
                    <Button
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<Icon as={FiPlay} />}
                      onClick={onClose}
                      w="full"
                    >
                      Tests
                    </Button>
                  </Link>
                  <Link href="/import" passHref>
                    <Button
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<Icon as={FiPlus} />}
                      onClick={onClose}
                      w="full"
                    >
                      Create Test
                    </Button>
                  </Link>
                  <Divider my={2} />
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    leftIcon={<Text>⚙️</Text>}
                    onClick={() => {
                      router.push('/settings')
                      onClose()
                    }}
                    w="full"
                  >
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    leftIcon={<Text>👋</Text>}
                    onClick={() => {
                      handleLogout()
                      onClose()
                    }}
                    color="red.500"
                    w="full"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/import" passHref>
                    <Button
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<Icon as={FiPlay} />}
                      onClick={onClose}
                      w="full"
                    >
                      Try It Free
                    </Button>
                  </Link>
                  <Link href="/?auth=login" passHref>
                    <Button
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<Icon as={FiLogIn} />}
                      onClick={onClose}
                      w="full"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/?auth=signup" passHref>
                    <Button
                      variant="gradient"
                      onClick={onClose}
                      w="full"
                      mt={2}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
} 