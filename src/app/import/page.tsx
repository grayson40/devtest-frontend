'use client'

import React, { useState } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Card, 
  CardBody, 
  VStack, 
  Textarea, 
  Button, 
  useToast, 
  Progress,
  FormControl,
  FormLabel,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { AppLayout } from '@/components/layout'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { testsApi } from '@/api/tests'

export default function ImportPage() {
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [isValidating, setIsValidating] = useState(false)
  const toast = useToast()
  const router = useRouter()

  const createTestMutation = useMutation({
    mutationFn: async (data: {
      html: string
    }) => {
      const response = await testsApi.createTest(data)
      return response
    },
    onSuccess: (test) => {
      toast({
        title: 'Test created',
        description: 'Successfully created test case',
        status: 'success',
        duration: 3000,
      })
      router.push(`/tests/${test._id}`)
    },
    onError: (error) => {
      toast({
        title: 'Error creating test',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      })
    }
  })

  const validateHtml = (content: string) => {
    if (!content) return false
    return content.includes('class="scribe-title"') && content.includes('class="scribe-step"')
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const content = e.clipboardData.getData('text')
    setHtmlContent(content)
    setIsValidating(true)

    try {
      if (!validateHtml(content)) {
        toast({
          title: 'Invalid Scribe content',
          description: 'Please copy the complete content from your Scribe recording',
          status: 'error',
          duration: 5000,
        })
        return
      }

      // Simulate validation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Create test immediately after validation
      await createTestMutation.mutateAsync({ html: content })
    } catch (error) {
      toast({
        title: 'Error processing content',
        description: 'Failed to process Scribe content. Please try again.',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setHtmlContent(content)
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
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>Import Test</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            <Heading size="lg" mb={2}>Import Test from Scribe</Heading>
            <Text color="gray.600">
              Create automated tests from your Scribe recordings
            </Text>
          </Box>

          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Getting Started</AlertTitle>
                    <AlertDescription>
                      1. Run your Scribe recording<br />
                      2. Click "Copy to clipboard" in Scribe<br />
                      3. Paste (Cmd/Ctrl+V) the content below
                    </AlertDescription>
                  </Box>
                </Alert>

                <FormControl>
                  <FormLabel>Scribe HTML Content</FormLabel>
                  <Textarea
                    placeholder="Paste your Scribe HTML here..."
                    minH="200px"
                    onPaste={handlePaste}
                    onChange={handleChange}
                    value={htmlContent}
                    bg="gray.50"
                    border="2px"
                    borderStyle="dashed"
                    borderColor="gray.200"
                    _hover={{ borderColor: 'primary.500' }}
                    _focus={{ 
                      borderColor: 'primary.500',
                      boxShadow: 'none'
                    }}
                    isDisabled={isValidating || createTestMutation.isPending}
                  />
                </FormControl>

                {(isValidating || createTestMutation.isPending) && (
                  <Box w="full">
                    <Progress 
                      size="xs" 
                      isIndeterminate 
                      colorScheme="primary" 
                    />
                    <Text mt={2} fontSize="sm" color="gray.600" textAlign="center">
                      {isValidating ? 'Validating Scribe content...' : 'Creating test...'}
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </AppLayout>
  )
} 