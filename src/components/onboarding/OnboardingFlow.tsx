import React from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  Textarea,
  FormControl,
  Badge,
  HStack,
  Icon,
  useClipboard,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  FormLabel,
  Flex,
  Tooltip,
  Divider,
  useColorModeValue,
  Collapse,
  IconButton,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiClipboard, FiCheckCircle, FiInfo, FiChevronDown, FiChevronUp } from 'react-icons/fi'

const MotionBox = motion(Box)

interface OnboardingFlowProps {
  onComplete: (data: {
    html: string
    gitConfig: {
      repository: string
      branch: string
    }
    environment: {
      name: string
      os: string
      memory: number
      cpu: number
    }
    localConfig: {
      useLocalBrowser: boolean
      saveCredentials: boolean
      debugMode: boolean
    }
  }) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [html, setHtml] = React.useState('')
  const { onCopy, hasCopied } = useClipboard("// Paste your Scribe HTML here")
  const [isLoading, setIsLoading] = React.useState(false)
  const [showHelp, setShowHelp] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState(0)

  // Default values for other required fields
  const defaultConfig = {
    gitConfig: {
      repository: '',
      branch: 'main'
    },
    environment: {
      name: 'cloud',
      os: 'linux',
      memory: 4,
      cpu: 2
    },
    localConfig: {
      useLocalBrowser: false,
      saveCredentials: true,
      debugMode: false
    }
  }

  const handleSubmit = () => {
    setIsLoading(true)
    // Use default values for other fields
    onComplete({
      html,
      ...defaultConfig
    })
  }

  const exampleHtml = `<html>
  <head>
    <title>Scribe Recording</title>
  </head>
  <body>
    <div class="scribe-step" data-step="1">
      <div class="scribe-action">Navigate to https://example.com</div>
    </div>
    <div class="scribe-step" data-step="2">
      <div class="scribe-action">Click on login button</div>
      <div class="scribe-selector">#login-button</div>
    </div>
    <!-- More steps would be here -->
  </body>
</html>`

  const handlePasteExample = () => {
    setHtml(exampleHtml)
    onCopy()
  }

  const renderHelpSection = () => (
    <Collapse in={showHelp} animateOpacity>
      <Box bg="whiteAlpha.100" p={4} borderRadius="md" mt={4}>
        <Text fontSize="sm" fontWeight="medium" color="white" mb={2}>
          How to get your Scribe HTML:
        </Text>
        <VStack align="stretch" spacing={2}>
          <Text fontSize="xs" color="whiteAlpha.800">
            1. Create a recording in Scribe (Chrome extension)
          </Text>
          <Text fontSize="xs" color="whiteAlpha.800">
            2. Click "Export" in the Scribe editor
          </Text>
          <Text fontSize="xs" color="whiteAlpha.800">
            3. Select "HTML" as the export format
          </Text>
          <Text fontSize="xs" color="whiteAlpha.800">
            4. Copy the HTML content and paste it here
          </Text>
        </VStack>
        <Divider my={3} borderColor="whiteAlpha.300" />
        <Text fontSize="xs" color="whiteAlpha.600">
          Don't have Scribe? <Button variant="link" size="xs" color="blue.300" onClick={handlePasteExample}>Use our example</Button> to see how it works.
        </Text>
      </Box>
    </Collapse>
  )

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <HStack spacing={2} mb={2}>
          <Badge colorScheme="blue" px={2} py={1} borderRadius="full">
            Quick Start
          </Badge>
          <Text fontSize="lg" fontWeight="semibold" color="white">
            Create Your First Test
          </Text>
          <Tooltip label="Show help">
            <IconButton
              aria-label="Show help"
              icon={showHelp ? <FiChevronUp /> : <FiChevronDown />}
              size="xs"
              variant="ghost"
              color="whiteAlpha.700"
              onClick={() => setShowHelp(!showHelp)}
            />
          </Tooltip>
        </HStack>
        <Text fontSize="sm" color="whiteAlpha.700">
          Paste your Scribe HTML below to instantly generate and run a test
        </Text>
      </Box>

      {renderHelpSection()}

      <Tabs variant="soft-rounded" colorScheme="blue" size="sm" index={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab color="whiteAlpha.700" _selected={{ color: 'white', bg: 'whiteAlpha.200' }}>Paste HTML</Tab>
          <Tab color="whiteAlpha.700" _selected={{ color: 'white', bg: 'whiteAlpha.200' }}>Upload File</Tab>
        </TabList>
        <TabPanels mt={4}>
          <TabPanel p={0}>
            <FormControl>
              <Textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Paste your Scribe HTML here..."
                minH="200px"
                bg="gray.700"
                border="1px"
                borderColor="whiteAlpha.200"
                _hover={{ borderColor: 'blue.400' }}
                _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
                color="white"
                resize="vertical"
                fontSize="sm"
                fontFamily="mono"
              />
            </FormControl>
          </TabPanel>
          <TabPanel p={0}>
            <Box
              border="2px"
              borderStyle="dashed"
              borderColor="whiteAlpha.300"
              borderRadius="md"
              p={8}
              textAlign="center"
              bg="gray.700"
              cursor="pointer"
              _hover={{ borderColor: 'blue.400' }}
              onClick={() => {
                // This would normally trigger a file upload
                // For now, just switch to the paste tab and use the example
                setActiveTab(0)
                handlePasteExample()
              }}
            >
              <VStack spacing={3}>
                <Icon as={FiClipboard} boxSize={8} color="whiteAlpha.600" />
                <Text color="whiteAlpha.800" fontSize="sm">
                  Click to upload a Scribe HTML file
                </Text>
                <Text color="whiteAlpha.600" fontSize="xs">
                  or drag and drop here
                </Text>
              </VStack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <HStack spacing={4} justify="space-between">
        <Button
          size="sm"
          leftIcon={<Icon as={hasCopied ? FiCheckCircle : FiClipboard} />}
          variant="ghost"
          color="whiteAlpha.700"
          onClick={handlePasteExample}
        >
          {hasCopied ? 'Example Copied!' : 'Use Example'}
        </Button>

        <Button
          colorScheme="blue"
          size="md"
          onClick={handleSubmit}
          isDisabled={!html.trim()}
          isLoading={isLoading}
          loadingText="Creating Test..."
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          transition="all 0.2s"
          bgGradient="linear(to-r, blue.400, purple.500)"
        >
          Create & Run Test
        </Button>
      </HStack>

      <Box bg="whiteAlpha.100" p={4} borderRadius="md">
        <Text fontSize="sm" color="whiteAlpha.800" mb={2}>
          What happens next:
        </Text>
        <VStack align="stretch" spacing={2}>
          <Text fontSize="xs" color="whiteAlpha.600">
            • Your Scribe recording will be converted to a test case
          </Text>
          <Text fontSize="xs" color="whiteAlpha.600">
            • The test will run automatically in our cloud environment
          </Text>
          <Text fontSize="xs" color="whiteAlpha.600">
            • You'll see real-time results with screenshots and logs
          </Text>
          <Text fontSize="xs" color="whiteAlpha.600">
            • No account needed to try it out - sign up to save your results
          </Text>
        </VStack>
      </Box>
    </VStack>
  )
} 