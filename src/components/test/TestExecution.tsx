'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Card,
  CardBody,
  Badge,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

interface Agent {
  id: string
  name: string
  status: 'idle' | 'running' | 'error'
  currentTest?: string
  lastPing: string
}

interface TestStep {
  id: string
  action: string
  expected: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  screenshot?: string
  logs?: string[]
  startTime?: string
  endTime?: string
  error?: string
}

interface TestExecution {
  id: string
  testId: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  steps: TestStep[]
  agent?: Agent
  startTime: string
  endTime?: string
  playwrightScript?: string
}

interface TestExecutionProps {
  execution: TestExecution
  onStop?: () => void
  onRerun?: () => void
}

export function TestExecution({ execution, onStop, onRerun }: TestExecutionProps) {
  const [currentStep, setCurrentStep] = useState<TestStep | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const codeBg = useColorModeValue('gray.50', 'gray.800')

  useEffect(() => {
    const runningStep = execution.steps.find(step => step.status === 'running')
    setCurrentStep(runningStep || null)
  }, [execution.steps])

  const statusColors = {
    queued: 'gray',
    running: 'blue',
    completed: 'green',
    failed: 'red',
  }

  const agentStatusColors = {
    idle: 'gray',
    running: 'green',
    error: 'red',
  }

  const stepStatusColors = {
    pending: 'gray',
    running: 'blue',
    passed: 'green',
    failed: 'red',
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Execution Header */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <HStack spacing={4}>
                <Badge
                  colorScheme={statusColors[execution.status]}
                  px={2}
                  py={1}
                  borderRadius="full"
                  textTransform="capitalize"
                >
                  {execution.status}
                </Badge>
                <Text color="gray.600">
                  Started: {new Date(execution.startTime).toLocaleString()}
                </Text>
                {execution.endTime && (
                  <Text color="gray.600">
                    Ended: {new Date(execution.endTime).toLocaleString()}
                  </Text>
                )}
              </HStack>
              <HStack>
                {execution.status === 'running' && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={onStop}
                  >
                    Stop
                  </Button>
                )}
                {(execution.status === 'completed' || execution.status === 'failed') && (
                  <Button
                    size="sm"
                    colorScheme="primary"
                    variant="ghost"
                    onClick={onRerun}
                  >
                    Run Again
                  </Button>
                )}
              </HStack>
            </HStack>

            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Overall Progress
              </Text>
              <Progress
                value={execution.progress}
                size="sm"
                colorScheme={statusColors[execution.status]}
                borderRadius="full"
                hasStripe={execution.status === 'running'}
                isAnimated={execution.status === 'running'}
              />
            </Box>

            {execution.agent && (
              <HStack>
                <Text fontSize="sm" color="gray.600">
                  Agent:
                </Text>
                <Badge
                  colorScheme={agentStatusColors[execution.agent.status]}
                  variant="subtle"
                >
                  {execution.agent.name}
                </Badge>
                <Text fontSize="sm" color="gray.500">
                  Last ping: {new Date(execution.agent.lastPing).toLocaleTimeString()}
                </Text>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Steps Progress */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="medium">Test Steps</Text>
            {execution.steps.map((step, index) => (
              <Box key={step.id}>
                <HStack justify="space-between" mb={2}>
                  <HStack>
                    <Badge colorScheme={stepStatusColors[step.status]}>
                      Step {index + 1}
                    </Badge>
                    <Text fontSize="sm">{step.action}</Text>
                  </HStack>
                  <Badge colorScheme={stepStatusColors[step.status]}>
                    {step.status}
                  </Badge>
                </HStack>
                {step.status === 'running' && (
                  <Progress
                    size="xs"
                    isIndeterminate
                    colorScheme="blue"
                    mt={2}
                  />
                )}
                {step.error && (
                  <Text color="red.500" fontSize="sm" mt={2}>
                    {step.error}
                  </Text>
                )}
                {step.screenshot && (
                  <Box mt={2}>
                    <img
                      src={step.screenshot}
                      alt={`Step ${index + 1} result`}
                      style={{
                        maxWidth: '100%',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: 'var(--chakra-colors-gray-200)',
                      }}
                    />
                  </Box>
                )}
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Playwright Script & Logs */}
      <Accordion allowMultiple>
        {execution.playwrightScript && (
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="medium">Playwright Script</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Box
                bg={codeBg}
                p={4}
                borderRadius="md"
                overflow="auto"
                maxH="400px"
              >
                <Code display="block" whiteSpace="pre">
                  {execution.playwrightScript}
                </Code>
              </Box>
            </AccordionPanel>
          </AccordionItem>
        )}

        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <Text fontWeight="medium">Execution Logs</Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Box
              bg={codeBg}
              p={4}
              borderRadius="md"
              overflow="auto"
              maxH="400px"
              fontFamily="mono"
              fontSize="sm"
            >
              {currentStep?.logs?.map((log, index) => (
                <Text key={index} color={log.includes('error') ? 'red.500' : 'inherit'}>
                  {log}
                </Text>
              ))}
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </VStack>
  )
} 