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
  Progress,
} from '@chakra-ui/react'

interface ParsedStep {
  id: string
  action: string
  element?: {
    selector: string
    text?: string
    type?: string
  }
  value?: string
  screenshot?: string
  url?: string
}

interface ProcessedStep {
  id: string
  action: string
  expected: string
  playwrightCode: string
  practiTestStep: {
    description: string
    expectedResults: string
  }
}

interface ScribeHtmlProcessorProps {
  htmlContent: string
  onProcessed?: (steps: ProcessedStep[]) => void
  onExport?: (format: 'playwright' | 'practitest') => void
  onRun?: () => void
}

export function ScribeHtmlProcessor({
  htmlContent,
  onProcessed,
  onExport,
  onRun
}: ScribeHtmlProcessorProps) {
  const [parsedSteps, setParsedSteps] = useState<ParsedStep[]>([])
  const [processedSteps, setProcessedSteps] = useState<ProcessedStep[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const toast = useToast()

  // Parse Scribe HTML export
  const parseScribeHtml = async () => {
    setIsProcessing(true)
    try {
      // Create a DOM parser
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')

      // Find all step elements (this is a simplified example - adjust based on actual Scribe HTML structure)
      const stepElements = doc.querySelectorAll('.scribe-step')
      
      const steps: ParsedStep[] = Array.from(stepElements).map((el, index) => {
        const action = el.querySelector('.action')?.textContent || ''
        const selector = el.querySelector('.selector')?.textContent || ''
        const screenshot = el.querySelector('img')?.src
        
        return {
          id: `step-${index + 1}`,
          action,
          element: selector ? { selector } : undefined,
          screenshot
        }
      })

      setParsedSteps(steps)
      generateProcessedSteps(steps)
    } catch (error) {
      toast({
        title: 'Error parsing HTML',
        description: 'Could not parse the Scribe export file',
        status: 'error',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Generate Playwright code for a step
  const generatePlaywrightCode = (step: ParsedStep): string => {
    if (!step.element?.selector) return '// No selector available for this step'

    // Enhanced selector handling
    const selector = step.element.selector
    const actionLower = step.action.toLowerCase()

    if (actionLower.includes('navigate') && step.url) {
      return `await page.goto('${step.url}');`
    }
    
    if (actionLower.includes('click')) {
      return `await page.click('${selector}');`
    }
    
    if (actionLower.includes('type') || actionLower.includes('enter')) {
      return `await page.fill('${selector}', '${step.value || ''}');`
    }
    
    if (actionLower.includes('select')) {
      return `await page.selectOption('${selector}', '${step.value || ''}');`
    }

    if (actionLower.includes('check') || actionLower.includes('uncheck')) {
      return `await page.${actionLower.includes('un') ? 'uncheck' : 'check'}('${selector}');`
    }

    // Add wait for element if it's an assertion step
    if (actionLower.includes('see') || actionLower.includes('verify')) {
      return `await expect(page.locator('${selector}')).toBeVisible();`
    }

    return `// Custom action: ${step.action}\nawait page.locator('${selector}').waitFor();`
  }

  // Generate PractiTest step
  const generatePractiTestStep = (step: ParsedStep) => {
    const actionLower = step.action.toLowerCase()
    let expectedResult = 'Action completes successfully'

    if (actionLower.includes('click')) {
      expectedResult = 'Element is clicked successfully'
    } else if (actionLower.includes('type')) {
      expectedResult = 'Text is entered correctly'
    } else if (actionLower.includes('see') || actionLower.includes('verify')) {
      expectedResult = 'Element is visible on the page'
    }

    return {
      description: step.action,
      expectedResults: expectedResult
    }
  }

  // Process steps into final format
  const generateProcessedSteps = (steps: ParsedStep[]) => {
    const processed = steps.map(step => ({
      id: step.id,
      action: step.action,
      expected: generatePractiTestStep(step).expectedResults,
      playwrightCode: generatePlaywrightCode(step),
      practiTestStep: generatePractiTestStep(step)
    }))

    setProcessedSteps(processed)
    onProcessed?.(processed)
  }

  // Generate full Playwright test file
  const getFullPlaywrightScript = () => {
    return `import { test, expect } from '@playwright/test';

test('imported scribe test', async ({ page }) => {
  ${processedSteps.map(step => step.playwrightCode).join('\n  ')}
});`
  }

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="medium">
              Scribe Import Processing
            </Text>
            <Button
              colorScheme="primary"
              size="sm"
              onClick={parseScribeHtml}
              isLoading={isProcessing}
            >
              Process HTML
            </Button>
          </HStack>

          {isProcessing && (
            <Progress size="xs" isIndeterminate colorScheme="primary" />
          )}

          <Tabs>
            <TabList>
              <Tab>Parsed Steps</Tab>
              <Tab>Playwright Test</Tab>
              <Tab>PractiTest Export</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <VStack align="stretch" spacing={4}>
                  {parsedSteps.map((step, index) => (
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
                      {step.element?.selector && (
                        <Text fontSize="xs" fontFamily="mono" color="gray.600">
                          Selector: {step.element.selector}
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
                      isDisabled={processedSteps.length === 0}
                    >
                      Export Script
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="primary"
                      onClick={onRun}
                      isDisabled={processedSteps.length === 0}
                    >
                      Run Test
                    </Button>
                  </HStack>
                </VStack>
              </TabPanel>

              <TabPanel px={0}>
                <VStack align="stretch" spacing={4}>
                  {processedSteps.map((step, index) => (
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
                            {step.practiTestStep.description}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.600">
                            Expected Result
                          </Text>
                          <Text fontSize="sm">
                            {step.practiTestStep.expectedResults}
                          </Text>
                        </Box>
                      </VStack>
                    </Box>
                  ))}
                  <Button
                    size="sm"
                    onClick={() => onExport?.('practitest')}
                    isDisabled={processedSteps.length === 0}
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