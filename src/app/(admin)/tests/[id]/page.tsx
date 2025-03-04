'use client'

import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  Badge,
  IconButton,
  useToast,
  Code,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  CardHeader,
  Image,
  Grid,
  GridItem,
  Collapse,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Link as ChakraLink,
  SimpleGrid,
  Icon,
  Divider,
  Tooltip,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testsApi } from '@/api/tests'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ErrorState, LoadingState } from '@/components/common'
import { FiPlay, FiMoreVertical, FiEdit, FiTrash2, FiDownload, FiImage, FiArrowLeft, FiMaximize2, FiCode, FiFileText, FiEye } from 'react-icons/fi'
import * as XLSX from 'xlsx'

interface TestStep {
  number: number
  description: string
  action: 'click' | 'fill' | 'goto' | 'wait' | 'assert' | 'unknown' | 'view'
  selector?: string
  value?: string
  screenshotUrl?: string
  id?: string
}

export default function TestPage({ params }: { params: { id: string } }) {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const toast = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isOpen: isImageModalOpen, onOpen: openImageModal, onClose: closeImageModal } = useDisclosure()
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure()
  const [previewType, setPreviewType] = useState<'playwright' | 'practitest'>('playwright')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [filePreview, setFilePreview] = useState<string>('')
  const [isPolling, setIsPolling] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const MAX_POLL_ATTEMPTS = 20 // 20 attempts * 3 seconds = 60 seconds max wait

  const { data: test, isLoading, error } = useQuery({
    queryKey: ['tests', params.id],
    queryFn: () => testsApi.getTest(params.id),
  })

  const deleteMutation = useMutation({
    mutationFn: testsApi.deleteTest,
    onSuccess: () => {
      toast({
        title: 'Test deleted',
        status: 'success',
        duration: 3000,
      })
      router.push('/tests')
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete test',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      })
    }
  })

  const toggleStepExpansion = (index: number) => {
    setExpandedSteps(prev => 
      prev.includes(index.toString()) 
        ? prev.filter(i => i !== index.toString())
        : [...prev, index.toString()]
    )
  }

  const handleRunTest = () => {
    router.push(`/tests/${params.id}/run`)
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      await deleteMutation.mutateAsync(params.id)
    }
  }

  const getActionColor = (action: string) => {
    const colors = {
      click: 'blue',
      fill: 'green',
      goto: 'purple',
      wait: 'orange',
      assert: 'yellow',
      view: 'cyan',
      unknown: 'gray'
    }
    return colors[action as keyof typeof colors] || 'gray'
  }

  const handleImageClick = (url: string) => {
    setSelectedImage(url)
    openImageModal()
  }

  const pollForFile = async (type: 'playwright' | 'practitest', testId: string) => {
    if (pollCount >= MAX_POLL_ATTEMPTS) {
      setPreviewError('Process is taking longer than expected. Please try again later.')
      setIsPreviewLoading(false)
      setIsPolling(false)
      setPollCount(0)
      return
    }

    try {
      const previewUrl = type === 'playwright' ? 
        testsApi.getPlaywrightDownloadUrl(testId) : 
        testsApi.getExportDownloadUrl(testId)
      
      const response = await fetch(previewUrl)
      
      if (response.status === 404) {
        // File not ready yet, continue polling
        setPollCount(prev => prev + 1)
        setTimeout(() => pollForFile(type, testId), 3000) // Poll every 3 seconds
        return
      }

      if (!response.ok) {
        if (response.status === 202) {
          // Still processing
          setPollCount(prev => prev + 1)
          setTimeout(() => pollForFile(type, testId), 3000)
          return
        }
        throw new Error(`Failed to load file: ${response.statusText}`)
      }

      // File is ready
      if (type === 'playwright') {
        const data = await response.text()
        setFilePreview(data)
      } else {
        // For PractiTest export (Excel file)
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
            setFilePreview(JSON.stringify(jsonData))
          } catch (error) {
            setPreviewError('Failed to parse Excel file')
          }
        }
        reader.readAsArrayBuffer(blob)
      }
      
      setIsPolling(false)
      setPollCount(0)
      setIsPreviewLoading(false)
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        // Network error, might still be processing
        setPollCount(prev => prev + 1)
        setTimeout(() => pollForFile(type, testId), 3000)
        return
      }
      
      setPreviewError(error instanceof Error ? error.message : 'An error occurred')
      setIsPolling(false)
      setPollCount(0)
      setIsPreviewLoading(false)
    }
  }

  const handlePreview = async (type: 'playwright' | 'practitest') => {
    if (!test?._id) return;

    setPreviewType(type)
    setIsPreviewLoading(true)
    setPreviewError(null)
    setFilePreview('')
    setIsPolling(true)
    setPollCount(0)
    onPreviewOpen()

    pollForFile(type, test._id)
  }

  const renderPreview = () => {
    if (isPreviewLoading) {
      return (
        <Center p={8}>
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text color="gray.400">
              {isPolling ? (
                <>
                  Processing file... This may take a minute.
                  <br />
                  {pollCount > 5 && "AI is enhancing test steps..."}
                </>
              ) : (
                "Loading preview..."
              )}
            </Text>
          </VStack>
        </Center>
      )
    }

    if (previewError) {
      return (
        <Alert status="error">
          <AlertIcon />
          Failed to load preview: {previewError}
        </Alert>
      )
    }

    if (previewType === 'playwright') {
      return (
        <Box 
          bg="gray.800" 
          p={4} 
          borderRadius="md" 
          fontFamily="mono"
          fontSize="sm"
          whiteSpace="pre-wrap"
        >
          {filePreview}
        </Box>
      )
    }

    // Render PractiTest Excel preview as a table
    try {
      const data = JSON.parse(filePreview)
      if (!Array.isArray(data) || data.length === 0) {
        return <Text>No data available</Text>
      }

      const headers = data[0]
      const rows = data.slice(1)

      return (
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                {headers.map((header: string, index: number) => (
                  <Th key={index} bg="gray.700" color="white">
                    {header}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row: any[], rowIndex: number) => (
                <Tr key={rowIndex} _hover={{ bg: 'gray.700' }}>
                  {row.map((cell: any, cellIndex: number) => (
                    <Td key={cellIndex} borderColor="gray.600">
                      {cell?.toString() || ''}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )
    } catch (error) {
      return <Text>Failed to parse preview data</Text>
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading test details..." />
  }

  if (error) {
    return (
      <Box p={8}>
        <ErrorState 
          title="Failed to load test" 
          message={error instanceof Error ? error.message : 'Unknown error'} 
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['tests', params.id] })}
        />
      </Box>
    )
  }

  if (!test) {
    return (
      <Box p={8}>
        <ErrorState 
          title="Test not found" 
          message="The test you're looking for doesn't exist or has been deleted" 
        />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={8}>
        <HStack mb={4}>
          <IconButton
            aria-label="Back to tests"
            icon={<FiArrowLeft />}
            variant="ghost"
            onClick={() => router.push('/tests')}
          />
          <Heading size="xl" color="white">Test Details</Heading>
        </HStack>
        <Text color="gray.400" mb={6}>View and manage test case details and generated files</Text>
        <HStack spacing={4}>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={FiPlay} />}
            onClick={handleRunTest}
          >
            Run Test
          </Button>
          <Button
            variant="outline"
            leftIcon={<Icon as={FiEdit} />}
            onClick={() => router.push(`/tests/${params.id}/edit`)}
          >
            Edit Test
          </Button>
          <Button
            variant="outline"
            colorScheme="red"
            leftIcon={<Icon as={FiTrash2} />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </HStack>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        {/* Test Info Card */}
        <Card>
          <CardHeader>
            <Heading size="md">Test Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text color="gray.400" fontSize="sm" mb={1}>Title</Text>
                <Text fontSize="lg" fontWeight="medium">{test.title}</Text>
              </Box>
              {test.description && (
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>Description</Text>
                  <Text>{test.description}</Text>
                </Box>
              )}
              <Box>
                <Text color="gray.400" fontSize="sm" mb={1}>Status</Text>
                <Badge colorScheme={test.status === 'active' ? 'green' : test.status === 'draft' ? 'yellow' : 'gray'}>
                  {test.status || 'draft'}
                </Badge>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Generated Files Card */}
        <Card>
          <CardHeader>
            <Heading size="md">Generated Files</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={2} spacing={4}>
              <Card variant="outline" bg="gray.800">
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <Icon as={FiCode} color="blue.400" />
                      <Text fontWeight="medium">Playwright Test</Text>
                    </HStack>
                    <Text color="gray.400" fontSize="sm" noOfLines={1}>
                      {test.playwrightTestPath?.split('/').pop() || 'No file generated'}
                    </Text>
                    <HStack>
                      <Button
                        size="sm"
                        width="full"
                        leftIcon={<FiDownload />}
                        onClick={() => test._id && window.open(testsApi.getPlaywrightDownloadUrl(test._id), '_blank')}
                        isDisabled={!test.playwrightTestPath || !test._id}
                      >
                        Download
                      </Button>
                      <IconButton
                        aria-label="Preview Playwright Test"
                        icon={<FiEye />}
                        size="sm"
                        onClick={() => handlePreview('playwright')}
                        isDisabled={!test.playwrightTestPath || !test._id}
                      />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card variant="outline" bg="gray.800">
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <Icon as={FiFileText} color="green.400" />
                      <Text fontWeight="medium">PractiTest Export</Text>
                    </HStack>
                    <Text color="gray.400" fontSize="sm" noOfLines={1}>
                      {test.practiTestExportPath?.split('/').pop() || 'No file generated'}
                    </Text>
                    <HStack>
                      <Button
                        size="sm"
                        width="full"
                        leftIcon={<FiDownload />}
                        onClick={() => test._id && window.open(testsApi.getExportDownloadUrl(test._id), '_blank')}
                        isDisabled={!test.practiTestExportPath || !test._id}
                      >
                        Download
                      </Button>
                      <IconButton
                        aria-label="Preview PractiTest Export"
                        icon={<FiEye />}
                        size="sm"
                        onClick={() => handlePreview('practitest')}
                        isDisabled={!test.practiTestExportPath || !test._id}
                      />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Test Steps Card */}
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Test Steps</Heading>
            <Text color="gray.400" fontSize="sm">{test.steps.length} steps</Text>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {test.steps.map((step, index) => (
              <Card
                key={`step-${index}`}
                variant="outline"
                bg="gray.800"
                borderColor={expandedSteps.includes(index.toString()) ? 'blue.500' : 'gray.700'}
                transition="all 0.2s"
                _hover={{ borderColor: 'blue.400' }}
              >
                <CardBody p={0}>
                  <Box
                    p={4}
                    cursor="pointer"
                    onClick={() => toggleStepExpansion(index)}
                    _hover={{ bg: 'gray.750' }}
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={4}>
                        <Badge colorScheme={getActionColor(step.action)}>
                          {step.action.toUpperCase()}
                        </Badge>
                        <Text fontWeight="medium">Step {step.number}</Text>
                        <Text color="gray.400">{step.description}</Text>
                      </HStack>
                      <HStack>
                        {step.screenshotUrl && (
                          <Tooltip label="View screenshot">
                            <IconButton
                              aria-label="View screenshot"
                              icon={<FiImage />}
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleImageClick(step.screenshotUrl!)
                              }}
                            />
                          </Tooltip>
                        )}
                        <IconButton
                          aria-label="Toggle step details"
                          icon={expandedSteps.includes(index.toString()) ? <ChevronUpIcon /> : <ChevronDownIcon />}
                          size="sm"
                          variant="ghost"
                        />
                      </HStack>
                    </Flex>
                  </Box>
                  
                  <Collapse in={expandedSteps.includes(index.toString())}>
                    <Divider borderColor="gray.700" />
                    <Box p={4}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {step.selector && (
                          <Box>
                            <Text fontSize="sm" color="gray.400" mb={1}>Selector</Text>
                            <Code p={2} borderRadius="md" fontSize="sm" display="block" bg="gray.900">
                              {step.selector}
                            </Code>
                          </Box>
                        )}
                        {step.value && (
                          <Box>
                            <Text fontSize="sm" color="gray.400" mb={1}>Value</Text>
                            <Code p={2} borderRadius="md" fontSize="sm" display="block" bg="gray.900">
                              {step.value}
                            </Code>
                          </Box>
                        )}
                      </SimpleGrid>
                      {step.screenshotUrl && (
                        <Box mt={4}>
                          <Text fontSize="sm" color="gray.400" mb={2}>Screenshot</Text>
                          <Image
                            src={step.screenshotUrl}
                            alt={`Step ${step.number} screenshot`}
                            borderRadius="md"
                            maxH="200px"
                            objectFit="contain"
                            cursor="pointer"
                            onClick={() => handleImageClick(step.screenshotUrl!)}
                            _hover={{ opacity: 0.8 }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Screenshot Modal */}
      <Modal isOpen={isImageModalOpen} onClose={closeImageModal} size="4xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>Screenshot Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedImage && (
              <Image
                src={selectedImage}
                alt="Step screenshot"
                maxH="80vh"
                w="100%"
                objectFit="contain"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* File Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="6xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            {previewType === 'playwright' ? 'Playwright Test Preview' : 'PractiTest Export Preview'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {renderPreview()}
          </ModalBody>
          <ModalFooter>
            <Button 
              leftIcon={<FiDownload />}
              onClick={() => {
                if (!test?._id) return;
                const id = test._id;
                if (previewType === 'playwright') {
                  window.open(testsApi.getPlaywrightDownloadUrl(id), '_blank')
                } else {
                  window.open(testsApi.getExportDownloadUrl(id), '_blank')
                }
              }}
              isDisabled={!test?._id}
            >
              Download
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
} 