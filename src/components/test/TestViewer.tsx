'use client'

import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Button,
  IconButton,
  Divider,
  Input,
  Textarea,
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react'
import { EditIcon, CheckIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons'

interface TestStep {
  id: string
  action: string
  expected: string
  screenshot?: string
}

interface TestCase {
  id: string
  title: string
  description: string
  status: 'passed' | 'failed' | 'not_run'
  jiraTicket?: string
  steps: TestStep[]
  lastRun?: string
}

interface TestViewerProps {
  test: TestCase
  onSave?: (test: TestCase) => void
}

export function TestViewer({ test: initialTest, onSave }: TestViewerProps) {
  const [test, setTest] = useState(initialTest)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(test.title)
  const [editedDescription, setEditedDescription] = useState(test.description)
  const [jiraTicketId, setJiraTicketId] = useState('')
  const [isJiraTicketValid, setIsJiraTicketValid] = useState(true)
  const [isLinkingTicket, setIsLinkingTicket] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const statusColors = {
    passed: 'green',
    failed: 'red',
    not_run: 'gray'
  }

  const handleSave = () => {
    const updatedTest = {
      ...test,
      title: editedTitle,
      description: editedDescription
    }
    setTest(updatedTest)
    setIsEditing(false)
    onSave?.(updatedTest)
  }

  const validateJiraTicket = (ticketId: string) => {
    const isValid = /^[A-Z]+-\d+$/.test(ticketId)
    setIsJiraTicketValid(isValid)
    return isValid
  }

  const handleJiraTicketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setJiraTicketId(value)
    if (value) {
      validateJiraTicket(value)
    } else {
      setIsJiraTicketValid(true)
    }
  }

  const handleLinkJiraTicket = async () => {
    if (!validateJiraTicket(jiraTicketId)) return

    setIsLinkingTicket(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedTest = {
        ...test,
        jiraTicket: jiraTicketId
      }
      setTest(updatedTest)
      onSave?.(updatedTest)
      
      toast({
        title: 'Jira ticket linked',
        description: `Successfully linked ticket ${jiraTicketId}`,
        status: 'success',
        duration: 3000,
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Error linking ticket',
        description: 'Failed to link Jira ticket. Please try again.',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLinkingTicket(false)
    }
  }

  const openJiraTicket = () => {
    // TODO: Replace with actual Jira URL from configuration
    window.open(`https://tpgstudios-team.atlassian.net/browse/${test.jiraTicket}`, '_blank')
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Card>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between">
              {isEditing ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Test case title"
                  size="lg"
                  fontWeight="semibold"
                />
              ) : (
                <Heading size="lg">{test.title}</Heading>
              )}
              <HStack>
                {isEditing ? (
                  <>
                    <IconButton
                      aria-label="Save changes"
                      icon={<CheckIcon />}
                      colorScheme="green"
                      size="sm"
                      onClick={handleSave}
                    />
                    <IconButton
                      aria-label="Cancel editing"
                      icon={<CloseIcon />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    />
                  </>
                ) : (
                  <IconButton
                    aria-label="Edit test case"
                    icon={<EditIcon />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  />
                )}
              </HStack>
            </HStack>

            {isEditing ? (
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Test case description"
                size="sm"
              />
            ) : (
              <Text color="gray.600">{test.description}</Text>
            )}

            <HStack spacing={2}>
              <Badge
                px={2}
                py={1}
                borderRadius="full"
                colorScheme={statusColors[test.status]}
                textTransform="capitalize"
              >
                {test.status.replace('_', ' ')}
              </Badge>
              {test.jiraTicket ? (
                <HStack>
                  <Badge
                    px={2}
                    py={1}
                    borderRadius="full"
                    variant="outline"
                    colorScheme="blue"
                    cursor="pointer"
                    onClick={openJiraTicket}
                  >
                    {test.jiraTicket}
                  </Badge>
                  <IconButton
                    aria-label="Open in Jira"
                    icon={<ExternalLinkIcon />}
                    size="xs"
                    variant="ghost"
                    onClick={openJiraTicket}
                  />
                </HStack>
              ) : (
                <Button
                  size="xs"
                  variant="outline"
                  leftIcon={<Text fontSize="sm">🎫</Text>}
                  onClick={onOpen}
                >
                  Link Jira Ticket
                </Button>
              )}
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Test Steps */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Test Steps</Heading>
            {test.steps.map((step, index) => (
              <Box key={step.id}>
                {index > 0 && <Divider my={4} />}
                <VStack align="stretch" spacing={3}>
                  <HStack>
                    <Badge colorScheme="purple" fontSize="sm">
                      Step {index + 1}
                    </Badge>
                  </HStack>
                  <Box>
                    <Text fontWeight="medium" mb={1}>
                      Action
                    </Text>
                    <Text color="gray.600">{step.action}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={1}>
                      Expected Result
                    </Text>
                    <Text color="gray.600">{step.expected}</Text>
                  </Box>
                  {step.screenshot && (
                    <Box
                      borderRadius="md"
                      overflow="hidden"
                      border="1px"
                      borderColor="gray.200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={step.screenshot}
                        alt={`Step ${index + 1} screenshot`}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block'
                        }}
                      />
                    </Box>
                  )}
                </VStack>
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Jira Link Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Link Jira Ticket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Associate this test case with a Jira ticket to track requirements and issues.
              </Text>
              <FormControl isInvalid={!isJiraTicketValid}>
                <Input
                  value={jiraTicketId}
                  onChange={handleJiraTicketChange}
                  placeholder="Enter Jira ticket ID (e.g., DEV-123)"
                  autoFocus
                />
                <FormErrorMessage>
                  Please enter a valid Jira ticket ID (e.g., DEV-123)
                </FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="primary"
              isLoading={isLinkingTicket}
              isDisabled={!isJiraTicketValid || !jiraTicketId}
              onClick={handleLinkJiraTicket}
            >
              Link Ticket
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
} 