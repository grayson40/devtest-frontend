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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  FormErrorMessage,
  Flex,
  CardHeader,
  SimpleGrid,
  Icon,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testsApi } from '@/api/tests'
import { useRouter } from 'next/navigation'
import { ErrorState, LoadingState } from '@/components/common'
import { FiSave, FiArrowLeft, FiPlus, FiTrash2, FiMove, FiMoreVertical, FiEdit } from 'react-icons/fi'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

interface TestStep {
  number: number
  description: string
  action: 'click' | 'fill' | 'goto' | 'wait' | 'assert' | 'unknown' | 'view'
  selector?: string
  value?: string
  screenshotUrl?: string
  id?: string
}

interface TestCase {
  id?: string
  _id?: string
  title: string
  description?: string
  steps: TestStep[]
  status?: 'draft' | 'active' | 'archived'
  playwrightTestPath?: string
  practiTestExportPath?: string
}

interface StepError {
  [key: string]: string
}

interface FormErrors {
  title?: string
  description?: string
  steps?: {
    [key: number]: StepError
  }
}

export default function EditTestPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState<{
    title: string
    description: string
    status: 'draft' | 'active' | 'archived'
    steps: TestStep[]
  }>({
    title: '',
    description: '',
    status: 'draft',
    steps: [],
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [editingStep, setEditingStep] = useState<number | null>(null)
  const toast = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isOpen: isDeleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const { data: test, isLoading, error } = useQuery<TestCase>({
    queryKey: ['tests', params.id],
    queryFn: () => testsApi.getTest(params.id),
  })

  React.useEffect(() => {
    if (test) {
      setFormData({
        title: test.title,
        description: test.description || '',
        status: test.status || 'draft',
        steps: test.steps,
      })
    }
  }, [test])

  const updateMutation = useMutation({
    mutationFn: (data: TestCase) => testsApi.updateTest(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', params.id] })
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      
      toast({
        title: 'Test updated',
        status: 'success',
        duration: 3000,
      })
      router.push(`/tests/${params.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Failed to update test',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      })
    },
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    
    if (errors[field as keyof FormErrors]) {
      const newErrors = { ...errors }
      delete newErrors[field as keyof FormErrors]
      setErrors(newErrors)
    }
  }

  const handleStepChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      ),
    }))
    
    if (errors.steps?.[index]?.[field]) {
      const newErrors = { ...errors }
      if (newErrors.steps) {
        const stepErrors = { ...newErrors.steps[index] }
        delete stepErrors[field]
        
        if (Object.keys(stepErrors).length === 0) {
          delete newErrors.steps[index]
        } else {
          newErrors.steps[index] = stepErrors
        }
        
        if (Object.keys(newErrors.steps).length === 0) {
          delete newErrors.steps
        }
      }
      setErrors(newErrors)
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    formData.steps.forEach((step, index) => {
      if (!step.description.trim()) {
        if (!newErrors.steps) newErrors.steps = {}
        if (!newErrors.steps[index]) newErrors.steps[index] = {}
        newErrors.steps[index].description = 'Description is required'
      }
      if (step.action === 'fill' && !step.value) {
        if (!newErrors.steps) newErrors.steps = {}
        if (!newErrors.steps[index]) newErrors.steps[index] = {}
        newErrors.steps[index].value = 'Value is required for fill action'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        status: 'error',
        duration: 5000,
      })
      return
    }

    await updateMutation.mutateAsync(formData)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const steps = Array.from(formData.steps)
    const [reorderedStep] = steps.splice(result.source.index, 1)
    steps.splice(result.destination.index, 0, reorderedStep)

    // Update step numbers
    const updatedSteps = steps.map((step, index) => ({
      ...step,
      number: index + 1,
    }))

    setFormData(prev => ({
      ...prev,
      steps: updatedSteps,
    }))
  }

  const handleDeleteStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((step, i) => ({
        ...step,
        number: i + 1,
      })),
    }))
  }

  if (isLoading) {
    return <LoadingState message="Loading test..." />
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

  return (
    <Box>
      {/* Header */}
      <Box mb={8}>
        <HStack mb={4}>
          <IconButton
            aria-label="Back to test details"
            icon={<FiArrowLeft />}
            variant="ghost"
            onClick={() => router.push(`/tests/${params.id}`)}
          />
          <Heading size="xl" color="white">Edit Test</Heading>
        </HStack>
        <Text color="gray.400" mb={6}>Modify test details and manage test steps</Text>
        <HStack spacing={4}>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={FiSave} />}
            onClick={handleSave}
            isLoading={updateMutation.isPending}
          >
            Save Changes
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
            <VStack spacing={6}>
              <FormControl isInvalid={!!errors.title}>
                <FormLabel color="gray.300">Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter test title"
                  bg="gray.700"
                  borderColor="gray.600"
                />
                <FormErrorMessage>{errors.title}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter test description"
                  bg="gray.700"
                  borderColor="gray.600"
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Status</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  bg="gray.700"
                  borderColor="gray.600"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </Select>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Generated Files Card - Read Only */}
        <Card>
          <CardHeader>
            <Heading size="md">Generated Files</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text color="gray.400" fontSize="sm" mb={1}>Playwright Test Path</Text>
                <Text>{test?.playwrightTestPath || 'Not generated'}</Text>
              </Box>
              <Box>
                <Text color="gray.400" fontSize="sm" mb={1}>PractiTest Export Path</Text>
                <Text>{test?.practiTestExportPath || 'Not generated'}</Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Test Steps Card */}
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Test Steps</Heading>
            <Text color="gray.400" fontSize="sm">{formData.steps.length} steps</Text>
          </Flex>
        </CardHeader>
        <CardBody>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="steps">
              {(provided) => (
                <VStack
                  spacing={4}
                  align="stretch"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {formData.steps.map((step, index) => (
                    <Draggable key={`step-${index}`} draggableId={`step-${index}`} index={index}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          variant="outline"
                          bg="gray.800"
                          borderColor="gray.700"
                        >
                          <CardBody>
                            <Flex gap={4}>
                              <Box {...provided.dragHandleProps}>
                                <Icon as={FiMove} color="gray.400" boxSize={5} />
                              </Box>
                              <VStack flex={1} align="stretch" spacing={4}>
                                <Flex justify="space-between" align="center">
                                  <HStack>
                                    <Badge colorScheme={getActionColor(step.action)}>
                                      {step.action.toUpperCase()}
                                    </Badge>
                                    <Text fontWeight="medium">Step {step.number}</Text>
                                  </HStack>
                                  <HStack>
                                    <IconButton
                                      aria-label="Delete step"
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() => handleDeleteStep(index)}
                                    />
                                  </HStack>
                                </Flex>

                                <FormControl isInvalid={!!errors.steps?.[index]?.description}>
                                  <FormLabel color="gray.300" fontSize="sm">Description</FormLabel>
                                  <Input
                                    value={step.description}
                                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                                    placeholder="Enter step description"
                                    bg="gray.700"
                                    borderColor="gray.600"
                                  />
                                  <FormErrorMessage>{errors.steps?.[index]?.description}</FormErrorMessage>
                                </FormControl>

                                <SimpleGrid columns={2} spacing={4}>
                                  <FormControl>
                                    <FormLabel color="gray.300" fontSize="sm">Action</FormLabel>
                                    <Select
                                      value={step.action}
                                      onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                                      bg="gray.700"
                                      borderColor="gray.600"
                                    >
                                      <option value="click">Click</option>
                                      <option value="fill">Fill</option>
                                      <option value="goto">Go To</option>
                                      <option value="wait">Wait</option>
                                      <option value="assert">Assert</option>
                                      <option value="view">View</option>
                                    </Select>
                                  </FormControl>

                                  {step.action === 'fill' && (
                                    <FormControl isInvalid={!!errors.steps?.[index]?.value}>
                                      <FormLabel color="gray.300" fontSize="sm">Value</FormLabel>
                                      <Input
                                        value={step.value || ''}
                                        onChange={(e) => handleStepChange(index, 'value', e.target.value)}
                                        placeholder="Enter value"
                                        bg="gray.700"
                                        borderColor="gray.600"
                                      />
                                      <FormErrorMessage>{errors.steps?.[index]?.value}</FormErrorMessage>
                                    </FormControl>
                                  )}

                                  {step.selector && (
                                    <FormControl>
                                      <FormLabel color="gray.300" fontSize="sm">Selector</FormLabel>
                                      <Input
                                        value={step.selector}
                                        onChange={(e) => handleStepChange(index, 'selector', e.target.value)}
                                        placeholder="Enter selector"
                                        bg="gray.700"
                                        borderColor="gray.600"
                                      />
                                    </FormControl>
                                  )}
                                </SimpleGrid>
                              </VStack>
                            </Flex>
                          </CardBody>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </VStack>
              )}
            </Droppable>
          </DragDropContext>
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDeleteDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.800">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Step
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDeleteDialog}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={closeDeleteDialog} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
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