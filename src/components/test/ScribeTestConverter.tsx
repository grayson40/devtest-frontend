'use client'

import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  Badge,
  useToast,
  Divider,
} from '@chakra-ui/react'

interface ScribeStep {
  id: string
  action: string
  selector?: string
  value?: string
  screenshot?: string
}

interface TestStep {
  id: string
  action: string
  expected: string
  playwrightCode: string
  practiTestStep?: {
    description: string
    expectedResults: string
  }
}

interface ScribeTestConverterProps {
  scribeSteps: ScribeStep[]
  onSave?: (steps: TestStep[]) => void
  onExport?: (format: 'playwright' | 'practitest') => void
  onRun?: () => void
}

export function ScribeTestConverter({
  scribeSteps,
  onSave,
  onExport,
  onRun
}: ScribeTestConverterProps) {
  const [convertedSteps, setConvertedSteps] = useState<TestStep[]>([])
  const toast = useToast()

  // Convert Scribe steps to Playwright code
  const generatePlaywrightCode = (step: ScribeStep): string => {
    if (!step.selector) return '// No selector available for this step'

    switch (step.action) {
      case 'click':
        return `await page.click('${step.selector}');`
      case 'type':
        return `await page.fill('${step.selector}', '${step.value}');`
      case 'navigate':
        return `await page.goto('${step.value}');`
      default:
        return `// Custom action: ${step.action}`
    }
  }

  // Convert Scribe steps to PractiTest format
  const generatePractiTestStep = (step: ScribeStep) => {
    return {
      description: step.action,
      expectedResults: 'Action should complete successfully' // Default expectation
    }
  }

  const handleConvert = () => {
    const steps = scribeSteps.map(step => ({
      id: step.id,
      action: step.action,
      expected: 'Action should complete successfully',
      playwrightCode: generatePlaywrightCode(step),
      practiTestStep: generatePractiTestStep(step)
    }))
    setConvertedSteps(steps)
  }

  const getFullPlaywrightScript = () => {
    return `import { test, expect } from '@playwright/test';

test('automated test', async ({ page }) => {
  ${convertedSteps.map(step => step.playwrightCode).join('\n  ')}
});`
  }

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="medium">
              Test Conversion
            </Text>
            <Button
              colorScheme="primary"
              size="sm"
              onClick={handleConvert}
            >
              Convert Steps
            </Button>
          </HStack>

          <Tabs>
            <TabList>
              <Tab>Scribe Steps</Tab>
              <Tab>Playwright Test</Tab>
              <Tab>PractiTest Export</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <VStack align="stretch" spacing={4}>
                  {scribeSteps.map((step, index) => (
                    <Box
                      key={step.id}
                      p={4}
                      bg="gray.50"
                      borderRadius="md"
                    >
                      <HStack justify="space-between" mb={2}>
                        <Badge>Step {index + 1}</Badge>
                        <Text fontSize="sm" color="gray.600">
                          {step.action}
                        </Text>
                      </HStack>
                      {step.selector && (
                        <Text fontSize="xs" fontFamily="mono" color="gray.600">
                          Selector: {step.selector}
                        </Text>
                      )}
                      {step.screenshot && (
                        <Box mt={2}>
                          <img
                            src={step.screenshot}
                            alt={`Step ${index + 1}`}
                            style={{
                              maxWidth: '100%',
                              borderRadius: '4px',
                              border: '1px solid var(--chakra-colors-gray-200)'
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  ))}
                </VStack>
              </TabPanel>

              <TabPanel px={0}>
                <VStack align="stretch" spacing={4}>
                  <Box
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                    fontFamily="mono"
                    fontSize="sm"
                    whiteSpace="pre"
                    overflowX="auto"
                  >
                    <Code>{getFullPlaywrightScript()}</Code>
                  </Box>
                  <HStack>
                    <Button
                      size="sm"
                      onClick={() => onExport?.('playwright')}
                    >
                      Export Script
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="primary"
                      onClick={onRun}
                    >
                      Run Test
                    </Button>
                  </HStack>
                </VStack>
              </TabPanel>

              <TabPanel px={0}>
                <VStack align="stretch" spacing={4}>
                  {convertedSteps.map((step, index) => (
                    <Box
                      key={step.id}
                      p={4}
                      bg="gray.50"
                      borderRadius="md"
                    >
                      <Text fontWeight="medium" mb={2}>
                        Step {index + 1}
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        <Box>
                          <Text fontSize="xs" color="gray.600">
                            Description
                          </Text>
                          <Text fontSize="sm">
                            {step.practiTestStep?.description}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.600">
                            Expected Result
                          </Text>
                          <Text fontSize="sm">
                            {step.practiTestStep?.expectedResults}
                          </Text>
                        </Box>
                      </VStack>
                    </Box>
                  ))}
                  <Button
                    size="sm"
                    onClick={() => onExport?.('practitest')}
                  >
                    Export to PractiTest
                  </Button>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </CardBody>
    </Card>
  )
} 