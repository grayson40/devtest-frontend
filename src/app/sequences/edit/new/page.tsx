'use client'

import { useState } from 'react'
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Text,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Card,
  CardBody,
  Badge,
  Icon,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { SequenceBuilder } from '@/components/test/SequenceBuilder'
import { useQuery, useMutation } from '@tanstack/react-query'
import { testsApi } from '@/api/tests'
import { sequencesApi } from '@/api/sequences'
import { TestNode } from '@/app/sequences/types'
import { AppLayout } from '@/components/layout'
import Link from 'next/link'
import { ChevronRightIcon, ArrowBackIcon } from '@chakra-ui/icons'

export default function NewSequencePage() {
  const router = useRouter()
  const toast = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sequence, setSequence] = useState<TestNode[]>([])

  const { data: availableTests, isLoading: isLoadingTests } = useQuery({
    queryKey: ['tests'],
    queryFn: () => testsApi.getTests(),
  })

  const createSequenceMutation = useMutation({
    mutationFn: (data: { name: string; description: string; sequence: TestNode[] }) =>
      sequencesApi.createSequence({
        name: data.name,
        description: data.description,
        tests: data.sequence.map((test, index) => ({
          testId: test.id,
          order: index + 1,
          runInParallel: test.runInParallel || false,
          dependencies: test.dependencies || [],
        })),
      }),
    onSuccess: () => {
      toast({
        title: 'Sequence created',
        description: 'Your test sequence has been created successfully.',
        status: 'success',
      })
      router.push('/sequences')
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create sequence',
        status: 'error',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for the sequence',
        status: 'error',
      })
      return
    }

    if (sequence.length === 0) {
      toast({
        title: 'Tests required',
        description: 'Please add at least one test to the sequence',
        status: 'error',
      })
      return
    }

    createSequenceMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      sequence,
    })
  }

  return (
    <AppLayout>
      <Box>
        {/* Header */}
        <Box 
          borderBottom="1px" 
          borderColor="gray.200" 
          bg="white" 
          position="sticky" 
          top="60px" 
          zIndex={2}
          px={8}
          py={4}
        >
          <VStack align="stretch" spacing={3}>
            <HStack spacing={3}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowBackIcon />}
                onClick={() => router.push('/sequences/new')}
              >
                Back to Templates
              </Button>
              <Breadcrumb 
                spacing="8px" 
                separator={<ChevronRightIcon color="gray.400" />}
                fontSize="sm"
              >
                <BreadcrumbItem>
                  <Link href="/sequences" passHref>
                    <BreadcrumbLink color="gray.500" _hover={{ color: 'gray.700' }}>
                      Sequences
                    </BreadcrumbLink>
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <Link href="/sequences/new" passHref>
                    <BreadcrumbLink color="gray.500" _hover={{ color: 'gray.700' }}>
                      New
                    </BreadcrumbLink>
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <Text color="gray.900">Empty Sequence</Text>
                </BreadcrumbItem>
              </Breadcrumb>
            </HStack>

            <Flex justify="space-between" align="center">
              <Box>
                <Badge colorScheme="green" mb={2}>Custom Sequence</Badge>
                <Heading size="lg" mb={1}>Create Empty Sequence</Heading>
                <Text color="gray.600">Build a custom sequence by combining and ordering test cases</Text>
              </Box>
              <Button
                type="submit"
                form="sequence-form"
                colorScheme="primary"
                isLoading={createSequenceMutation.isPending}
                loadingText="Creating..."
              >
                Create Sequence
              </Button>
            </Flex>
          </VStack>
        </Box>

        {/* Content */}
        <Box p={8}>
          <VStack 
            as="form" 
            id="sequence-form"
            onSubmit={handleSubmit} 
            spacing={6} 
            align="stretch" 
            maxW="container.lg" 
            mx="auto"
          >
            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Sequence Name</FormLabel>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter sequence name"
                      size="md"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter sequence description"
                      rows={3}
                      size="md"
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box>
                      <Heading size="md" mb={1}>Test Sequence</Heading>
                      <Text color="gray.600" fontSize="sm">
                        Add and arrange tests to create your sequence
                      </Text>
                    </Box>
                    {sequence.length > 0 && (
                      <HStack spacing={4}>
                        <Text fontSize="sm" color="gray.500">
                          {sequence.length} test{sequence.length !== 1 ? 's' : ''}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {sequence.filter(t => t.runInParallel).length} parallel
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                  {isLoadingTests ? (
                    <Text color="gray.500">Loading available tests...</Text>
                  ) : (
                    <SequenceBuilder
                      availableTests={availableTests || []}
                      initialSequence={sequence}
                      onSave={setSequence}
                    />
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Box>
    </AppLayout>
  )
} 