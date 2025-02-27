'use client'

import React from 'react'
import { Box, Container, Heading, Text, Card, CardBody, HStack, Badge, Button, VStack, SimpleGrid, Progress, Tooltip, Spinner, useToast, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'
import { AppLayout } from '@/components/layout'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sequencesApi } from '@/api/sequences'
import { TestNode } from '../types'
import { ErrorState } from '@/components/common'
import Link from 'next/link'

const MotionBox = motion(Box)

function SequenceVisualizer({ tests }: { tests: TestNode[] }) {
  const statusColors = {
    passed: 'green',
    failed: 'red',
    not_run: 'gray',
    running: 'blue'
  }

  const nodeWidth = 250
  const nodeHeight = 100
  const verticalSpacing = 40
  const horizontalSpacing = 60

  // Calculate node positions based on dependencies
  const getNodePositions = () => {
    const positions = new Map<string, { x: number; y: number; level: number }>()
    const visited = new Set<string>()
    const levels = new Map<number, number>() // level -> count of nodes in level

    const visit = (nodeId: string, level: number = 0) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)

      // Update count for this level
      levels.set(level, (levels.get(level) || 0) + 1)
      const position = levels.get(level) || 0

      // Calculate x and y coordinates
      const x = level * (nodeWidth + horizontalSpacing)
      const y = position * (nodeHeight + verticalSpacing)

      positions.set(nodeId, { x, y, level })

      // Visit dependencies
      const node = tests.find(t => t.id === nodeId)
      node?.dependencies?.forEach(depId => {
        visit(depId, level + 1)
      })
    }

    // Start with nodes that have no dependencies
    tests.filter(t => !t.dependencies?.length).forEach(t => visit(t.id))

    return positions
  }

  const nodePositions = getNodePositions()

  return (
    <Box position="relative" w="full" h="600px" overflowX="auto" p={8}>
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {tests.map(test => 
          test.dependencies?.map(depId => {
            const start = nodePositions.get(test.id)
            const end = nodePositions.get(depId)
            if (!start || !end) return null

            const startX = start.x + nodeWidth / 2
            const startY = start.y + nodeHeight / 2
            const endX = end.x + nodeWidth / 2
            const endY = end.y + nodeHeight / 2

            return (
              <g key={`${test.id}-${depId}`}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#CBD5E0"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <circle
                  cx={endX}
                  cy={endY}
                  r="4"
                  fill="#4299E1"
                />
              </g>
            )
          })
        )}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#CBD5E0"
            />
          </marker>
        </defs>
      </svg>

      {tests.map(test => {
        const pos = nodePositions.get(test.id)
        if (!pos) return null

        return (
          <MotionBox
            key={test.id}
            position="absolute"
            left={pos.x}
            top={pos.y}
            width={nodeWidth}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Badge
                      colorScheme={statusColors[test.status]}
                      px={2}
                      py={0.5}
                      borderRadius="full"
                    >
                      {test.status}
                    </Badge>
                    {test.runInParallel && (
                      <Tooltip label="Runs in parallel">
                        <Badge colorScheme="purple">parallel</Badge>
                      </Tooltip>
                    )}
                  </HStack>
                  <Text fontWeight="medium" noOfLines={2}>
                    {test.title}
                  </Text>
                  {test.status === 'running' && test.progress && (
                    <Progress
                      value={test.progress}
                      size="sm"
                      colorScheme="blue"
                      borderRadius="full"
                    />
                  )}
                  {test.duration && (
                    <Text fontSize="sm" color="gray.500">
                      Duration: {test.duration}s
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </MotionBox>
        )
      })}
    </Box>
  )
}

function LoadingState() {
  return (
    <Container maxW="container.lg" py={8}>
      <VStack py={12} spacing={4}>
        <Spinner size="xl" color="primary.500" />
        <Text color="gray.600">Loading sequence...</Text>
      </VStack>
    </Container>
  )
}

export default function SequenceDetailsPage({ params }: { params: { id: string } }) {
  const toast = useToast()
  const queryClient = useQueryClient()

  // Fetch sequence data
  const { data: sequence, isLoading, error } = useQuery({
    queryKey: ['sequences', params.id],
    queryFn: () => sequencesApi.getSequence(params.id)
  })

  // Run sequence mutation
  const runMutation = useMutation({
    mutationFn: () => sequencesApi.updateSequence(params.id, { status: 'running' }),
    onSuccess: () => {
      toast({
        title: 'Sequence started',
        description: 'The test sequence is now running',
        status: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Failed to start sequence',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
      })
    }
  })

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState />
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <Box py={8}>
          <ErrorState
            title="Failed to load sequence"
            message={error instanceof Error ? error.message : 'An error occurred'}
            onRetry={() => queryClient.invalidateQueries({ queryKey: ['sequences', params.id] })}
          />
        </Box>
      </AppLayout>
    )
  }

  if (!sequence) {
    return (
      <AppLayout>
        <Box py={8}>
          <ErrorState
            title="Sequence not found"
            message="The sequence you're looking for doesn't exist or has been deleted"
          />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Breadcrumb mb={4}>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href="/sequences">Sequences</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>{sequence.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <HStack justify="space-between" mb={6}>
              <Box>
                <Heading size="lg" mb={2}>{sequence.name}</Heading>
                <Text color="gray.600">{sequence.description}</Text>
              </Box>
              <Button 
                colorScheme="primary"
                onClick={() => runMutation.mutate()}
                isLoading={runMutation.isPending}
                loadingText="Starting..."
                leftIcon={<span>▶️</span>}
              >
                Run Sequence
              </Button>
            </HStack>
          </Box>

          <SimpleGrid columns={4} spacing={4}>
            <Card>
              <CardBody>
                <VStack align="start">
                  <Text color="gray.500" fontSize="sm">Total Tests</Text>
                  <Heading size="lg">{sequence.tests.length}</Heading>
                </VStack>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <VStack align="start">
                  <Text color="gray.500" fontSize="sm">Parallel Tests</Text>
                  <Heading size="lg">{sequence.parallelTests}</Heading>
                </VStack>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <VStack align="start">
                  <Text color="gray.500" fontSize="sm">Total Duration</Text>
                  <Heading size="lg">{sequence.totalDuration}s</Heading>
                </VStack>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <VStack align="start">
                  <Text color="gray.500" fontSize="sm">Last Run</Text>
                  <Text>{sequence.lastRun ? new Date(sequence.lastRun).toLocaleDateString() : 'Never'}</Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Card>
            <CardBody>
              <Text fontSize="lg" fontWeight="medium" mb={4}>
                Sequence Flow
              </Text>
              <SequenceVisualizer tests={sequence.tests} />
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </AppLayout>
  )
} 