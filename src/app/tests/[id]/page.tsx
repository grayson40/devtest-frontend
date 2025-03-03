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
  Collapse,
  IconButton,
  Tooltip,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Code,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon, EditIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { SimpleLayout } from '@/components/layout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testsApi } from '@/api/tests'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ErrorState, LoadingState } from '@/components/common'

interface TestStep {
  number: number
  description: string
  action: 'click' | 'fill' | 'goto' | 'wait' | 'assert' | 'unknown' | 'view'
  selector?: string
  value?: string
  screenshotUrl?: string
}

export default function TestPage({ params }: { params: { id: string } }) {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([])
  const toast = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()

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

  const toggleStepExpansion = (stepIndex: number) => {
    const stepId = stepIndex.toString()
    if (expandedSteps.includes(stepId)) {
      setExpandedSteps(expandedSteps.filter(id => id !== stepId))
    } else {
      setExpandedSteps([...expandedSteps, stepId])
    }
  }

  const handleRunTest = () => {
    router.push(`/tests/${params.id}/run`)
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      await deleteMutation.mutateAsync(params.id)
    }
  }

  if (isLoading) {
    return (
      <SimpleLayout>
        <Box py={8}>
          <LoadingState message="Loading test details..." />
        </Box>
      </SimpleLayout>
    )
  }

  if (error) {
    return (
      <SimpleLayout>
        <Box p={8}>
          <ErrorState 
            title="Failed to load test" 
            message={error instanceof Error ? error.message : 'Unknown error'} 
            onRetry={() => {
              queryClient.invalidateQueries({ queryKey: ['tests', params.id] })
            }}
          />
        </Box>
      </SimpleLayout>
    )
  }

  if (!test) {
    return (
      <SimpleLayout>
        <Box p={8}>
          <ErrorState 
            title="Test not found" 
            message="The test you're looking for doesn't exist or has been deleted" 
          />
        </Box>
      </SimpleLayout>
    )
  }

  return (
    <SimpleLayout>
      <VStack spacing={6} align="stretch">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/tests">Tests</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{test.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>{test.title}</Heading>
            <HStack spacing={4}>
              <Badge colorScheme={test.status === 'active' ? 'green' : 'gray'}>
                {test.status}
              </Badge>
              <Text color="gray.600">{test.steps.length} steps</Text>
            </HStack>
          </Box>
          <HStack spacing={4}>
            <Button
              colorScheme="blue"
              onClick={handleRunTest}
              leftIcon={<span>▶️</span>}
            >
              Run Test
            </Button>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="outline">
                Actions
              </MenuButton>
              <MenuList>
                <MenuItem icon={<EditIcon />} onClick={() => router.push(`/tests/${params.id}/edit`)}>
                  Edit Test
                </MenuItem>
                <MenuItem icon={<span>📋</span>} onClick={() => window.open(`/tests/${params.id}/report`, '_blank')}>
                  View Report
                </MenuItem>
                <MenuItem icon={<span>🗑️</span>} color="red.500" onClick={handleDelete}>
                  Delete Test
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </HStack>

        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {test.steps.map((step, index) => (
                <Box key={index} p={4} borderWidth="1px" borderRadius="md">
                  <HStack justify="space-between">
                    <HStack>
                      <Badge colorScheme="blue">
                        Step {index + 1}
                      </Badge>
                      <Text fontWeight="medium">{step.description}</Text>
                      <Badge colorScheme="purple">
                        {step.action}
                      </Badge>
                    </HStack>
                    <IconButton
                      aria-label="Toggle details"
                      icon={expandedSteps.includes(index.toString()) ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleStepExpansion(index)}
                    />
                  </HStack>

                  <Collapse in={expandedSteps.includes(index.toString())}>
                    <VStack align="stretch" spacing={2} mt={4}>
                      {step.selector && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium">Selector:</Text>
                          <Code p={2} borderRadius="md" fontSize="sm" w="full">
                            {step.selector}
                          </Code>
                        </Box>
                      )}
                      {step.value && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium">Value:</Text>
                          <Code p={2} borderRadius="md" fontSize="sm" w="full">
                            {step.value}
                          </Code>
                        </Box>
                      )}
                      {step.screenshotUrl && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium">Screenshot:</Text>
                          <Box 
                            mt={2} 
                            borderWidth="1px" 
                            borderRadius="md" 
                            overflow="hidden"
                          >
                            <img 
                              src={step.screenshotUrl} 
                              alt={`Step ${index + 1} screenshot`} 
                              style={{ maxWidth: '100%' }} 
                            />
                          </Box>
                        </Box>
                      )}
                    </VStack>
                  </Collapse>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </SimpleLayout>
  )
} 