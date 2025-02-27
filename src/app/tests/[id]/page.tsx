'use client'

import React, { useState } from 'react'
import {
  Box,
  Container,
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
import { AppLayout } from '@/components/layout'
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
  expected?: string
}

export default function TestPage({ params }: { params: { id: string } }) {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([])
  const toast = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch test details
  const { data: test, isLoading, error } = useQuery({
    queryKey: ['test', params.id],
    queryFn: () => testsApi.getTest(params.id)
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: testsApi.deleteTest,
    onSuccess: () => {
      toast({
        title: 'Test deleted',
        description: 'Test case has been deleted successfully',
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
    setExpandedSteps(prev =>
      prev.includes(stepIndex.toString())
        ? prev.filter(id => id !== stepIndex.toString())
        : [...prev, stepIndex.toString()]
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

  const generatePlaywrightCode = (step: TestStep): string => {
    switch (step.action) {
      case 'click':
        return `await page.click('${step.selector}')`
      case 'fill':
        return `await page.fill('${step.selector}', '${step.value}')`
      case 'goto':
        return `await page.goto('${step.value}')`
      case 'wait':
        return `await page.waitForSelector('${step.selector}')`
      case 'assert':
        return `await expect(page.locator('${step.selector}')).toBeVisible()`
      case 'view':
        return `// View ${step.description}`
      default:
        return `// ${step.description}`
    }
  }

  const getFullPlaywrightScript = (): string => {
    if (!test) return ''

    return `import { test, expect } from '@playwright/test';

test('${test.title}', async ({ page }) => {
  ${test.steps.map(step => '  ' + generatePlaywrightCode(step)).join('\n  ')}
});`
  }

  if (isLoading) {
    return (
      <AppLayout>
        <Box py={8}>
          <LoadingState message="Loading test details..." />
        </Box>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <Box py={8}>
          <ErrorState 
            title="Failed to load test"
            message={error instanceof Error ? error.message : 'Could not load test details'}
            onRetry={() => queryClient.invalidateQueries({ queryKey: ['tests', params.id] })}
          />
        </Box>
      </AppLayout>
    )
  }

  if (!test) {
    return (
      <AppLayout>
        <Box py={8}>
          <ErrorState 
            title="Test not found"
            message="The test you're looking for doesn't exist or has been deleted"
          />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Breadcrumb mb={4}>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href="/tests">Tests</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>{test.title}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <HStack justify="space-between" mb={6}>
              <Box>
                <Heading size="lg" mb={2}>{test.title}</Heading>
                <Text color="gray.600">{test.description}</Text>
              </Box>
              <HStack spacing={2}>
                <Button
                  colorScheme="primary"
                  onClick={handleRunTest}
                  leftIcon={<span>▶️</span>}
                >
                  Run Test
                </Button>
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    rightIcon={<ChevronDownIcon />}
                  >
                    Actions
                  </MenuButton>
                  <MenuList>
                    <MenuItem icon={<EditIcon />}>Edit Test</MenuItem>
                    <MenuItem icon={<span>📋</span>}>Duplicate</MenuItem>
                    <MenuItem icon={<span>🔗</span>}>Link to Ticket</MenuItem>
                    <MenuItem icon={<span>🗑️</span>} color="red.500" onClick={handleDelete}>
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </HStack>
          </Box>

          <Tabs>
            <TabList>
              <Tab>Steps</Tab>
              <Tab>Playwright Code</Tab>
              <Tab>Results</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <VStack spacing={4} align="stretch">
                  {test.steps.map((step, index) => (
                    <Card
                      key={index}
                      variant="outline"
                    >
                      <CardBody>
                        <VStack spacing={4} align="stretch">
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
                            <VStack align="stretch" spacing={2}>
                              {step.selector && (
                                <Box>
                                  <Text fontSize="sm" color="gray.500">Selector:</Text>
                                  <Code p={2} borderRadius="md">{step.selector}</Code>
                                </Box>
                              )}
                              {step.value && (
                                <Box>
                                  <Text fontSize="sm" color="gray.500">Value:</Text>
                                  <Code p={2} borderRadius="md">{step.value}</Code>
                                </Box>
                              )}
                              {step.screenshotUrl && (
                                <Box>
                                  <Text fontSize="sm" color="gray.500" mb={2}>Screenshot:</Text>
                                  <img src={step.screenshotUrl} alt={`Step ${index + 1} screenshot`} style={{ maxWidth: '100%', borderRadius: '8px' }} />
                                </Box>
                              )}
                              <Box>
                                <Text fontSize="sm" color="gray.500">Playwright Code:</Text>
                                <Code p={2} borderRadius="md" display="block" whiteSpace="pre">
                                  {generatePlaywrightCode(step)}
                                </Code>
                              </Box>
                            </VStack>
                          </Collapse>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </TabPanel>

              <TabPanel px={0}>
                <Card>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Full Test Script</Text>
                        <Button size="sm" variant="outline" leftIcon={<span>📋</span>}>
                          Copy to Clipboard
                        </Button>
                      </HStack>
                      <Code p={4} borderRadius="md" display="block" whiteSpace="pre">
                        {getFullPlaywrightScript()}
                      </Code>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel px={0}>
                <Card>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Text>Recent test executions will appear here</Text>
                      <Button
                        colorScheme="primary"
                        onClick={handleRunTest}
                        leftIcon={<span>▶️</span>}
                      >
                        Run Test Now
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </AppLayout>
  )
} 