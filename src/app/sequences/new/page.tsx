'use client'

import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  VStack,
  HStack,
  Badge,
  useToast,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/layout'
import { useRouter } from 'next/navigation'
import { sequenceTemplates } from '../templates'
import { useMutation } from '@tanstack/react-query'
import { sequencesApi } from '@/api/sequences'

export default function NewSequencePage() {
  const router = useRouter()
  const toast = useToast()

  const createMutation = useMutation({
    mutationFn: sequencesApi.createFromTemplate,
    onSuccess: (sequence) => {
      toast({
        title: 'Sequence created',
        description: 'Your new test sequence is ready',
        status: 'success',
      })
      router.push(`/sequences/${sequence.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Failed to create sequence',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
      })
    }
  })

  const handleSelectTemplate = (templateId: string) => {
    const template = sequenceTemplates.find(t => t.id === templateId)
    if (!template) return

    createMutation.mutate({
      name: template.name,
      description: template.description,
      tests: template.tests
    })
  }

  return (
    <AppLayout>
      <Box p={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>Create New Sequence</Heading>
            <Text color="gray.600">
              Start with a template or create a sequence from scratch
            </Text>
          </Box>

          <SimpleGrid columns={[1, null, 2]} spacing={6}>
            <Card
              role="button"
              onClick={() => router.push('/sequences/edit/new')}
              _hover={{ transform: 'scale(1.02)', cursor: 'pointer' }}
              transition="all 0.2s"
            >
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Badge colorScheme="green" px={2} py={1}>
                    Start Fresh
                  </Badge>
                  <Box>
                    <Heading size="md" mb={2}>Empty Sequence</Heading>
                    <Text color="gray.600">
                      Create a new sequence from scratch with your own tests and dependencies
                    </Text>
                  </Box>
                  <Button size="sm" colorScheme="primary">
                    Create Empty Sequence
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {sequenceTemplates.map(template => (
              <Card
                key={template.id}
                role="button"
                onClick={() => handleSelectTemplate(template.id)}
                _hover={{ transform: 'scale(1.02)', cursor: 'pointer' }}
                transition="all 0.2s"
                opacity={createMutation.isPending ? 0.7 : 1}
                pointerEvents={createMutation.isPending ? 'none' : 'auto'}
              >
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <Badge colorScheme="blue" px={2} py={1}>
                      Template
                    </Badge>
                    <Box>
                      <Heading size="md" mb={2}>{template.name}</Heading>
                      <Text color="gray.600">{template.description}</Text>
                    </Box>
                    <HStack spacing={4}>
                      <Text fontSize="sm" color="gray.500">
                        {template.tests.length} tests
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {template.tests.filter(t => t.runInParallel).length} parallel
                      </Text>
                    </HStack>
                    <Button 
                      size="sm" 
                      colorScheme="primary"
                      isLoading={createMutation.isPending && createMutation.variables?.name === template.name}
                      loadingText="Creating..."
                    >
                      Use Template
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
    </AppLayout>
  )
} 