import React from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  Textarea,
  Input,
  Select,
  FormControl,
  FormLabel,
  HStack,
  Circle,
  Switch,
  InputGroup,
  InputLeftAddon,
  Code,
  useClipboard,
  Badge,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'

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
  const [step, setStep] = React.useState(1)
  const [formData, setFormData] = React.useState({
    html: '',
    gitConfig: {
      repository: '',
      branch: 'main'
    },
    environment: {
      name: 'local',
      os: 'current',
      memory: 4,
      cpu: 2
    },
    localConfig: {
      useLocalBrowser: true,
      saveCredentials: true,
      debugMode: false
    }
  })

  const { onCopy, hasCopied } = useClipboard("npm install -g @compass/cli")

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleComplete = () => {
    onComplete(formData)
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Step Indicator */}
      <HStack spacing={4} justify="space-between" position="relative">
        {/* Progress Line */}
        <Box
          position="absolute"
          height="2px"
          bg="whiteAlpha.200"
          left="0"
          right="0"
          top="50%"
          transform="translateY(-50%)"
          zIndex={0}
        />
        <Box
          position="absolute"
          height="2px"
          bg="blue.400"
          left="0"
          width={`${((step - 1) / 2) * 100}%`}
          top="50%"
          transform="translateY(-50%)"
          zIndex={0}
          transition="width 0.3s ease-in-out"
        />
        
        {/* Step Circles */}
        {[1, 2, 3].map((stepNumber) => (
          <Circle
            key={stepNumber}
            size="40px"
            bg={step >= stepNumber ? 'blue.400' : 'whiteAlpha.200'}
            color="white"
            fontWeight="bold"
            position="relative"
            zIndex={1}
            transition="all 0.2s"
            _hover={{
              transform: 'scale(1.1)',
              boxShadow: 'lg'
            }}
          >
            {stepNumber}
          </Circle>
        ))}
      </HStack>

      {/* Step Labels */}
      <HStack justify="space-between" px={2}>
        <Text
          color={step >= 1 ? 'white' : 'whiteAlpha.600'}
          fontSize="sm"
          fontWeight="medium"
        >
          Import Test
        </Text>
        <Text
          color={step >= 2 ? 'white' : 'whiteAlpha.600'}
          fontSize="sm"
          fontWeight="medium"
        >
          Configure Local
        </Text>
        <Text
          color={step >= 3 ? 'white' : 'whiteAlpha.600'}
          fontSize="sm"
          fontWeight="medium"
        >
          Setup Runner
        </Text>
      </HStack>

      {/* Step Content */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        key={step}
      >
        {step === 1 && (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="lg" fontWeight="semibold" color="white" mb={1}>
                Import Your Test
              </Text>
              <Text fontSize="sm" color="whiteAlpha.700">
                Paste your Scribe HTML content to create your first test
              </Text>
            </Box>
            <FormControl>
              <Textarea
                value={formData.html}
                onChange={(e) => setFormData({ ...formData, html: e.target.value })}
                placeholder="Paste your Scribe HTML here..."
                minH="200px"
                bg="gray.700"
                border="1px"
                borderColor="whiteAlpha.200"
                _hover={{ borderColor: 'blue.400' }}
                _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
                color="white"
                resize="vertical"
              />
            </FormControl>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={handleNext}
              isDisabled={!formData.html}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Continue to Local Setup
            </Button>
          </VStack>
        )}

        {step === 2 && (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="lg" fontWeight="semibold" color="white" mb={1}>
                Configure Local Environment
              </Text>
              <Text fontSize="sm" color="whiteAlpha.700">
                Set up your local test execution environment
              </Text>
            </Box>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="local-browser" color="whiteAlpha.900" mb={0}>
                Use Local Browser
              </FormLabel>
              <Switch
                id="local-browser"
                isChecked={formData.localConfig.useLocalBrowser}
                onChange={(e) => setFormData({
                  ...formData,
                  localConfig: { ...formData.localConfig, useLocalBrowser: e.target.checked }
                })}
                colorScheme="blue"
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="save-creds" color="whiteAlpha.900" mb={0}>
                Save Browser Profile
              </FormLabel>
              <Switch
                id="save-creds"
                isChecked={formData.localConfig.saveCredentials}
                onChange={(e) => setFormData({
                  ...formData,
                  localConfig: { ...formData.localConfig, saveCredentials: e.target.checked }
                })}
                colorScheme="blue"
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="debug-mode" color="whiteAlpha.900" mb={0}>
                Debug Mode
              </FormLabel>
              <Switch
                id="debug-mode"
                isChecked={formData.localConfig.debugMode}
                onChange={(e) => setFormData({
                  ...formData,
                  localConfig: { ...formData.localConfig, debugMode: e.target.checked }
                })}
                colorScheme="blue"
              />
            </FormControl>

            <Box bg="whiteAlpha.100" p={4} borderRadius="md">
              <Text fontSize="sm" color="whiteAlpha.800" mb={2}>
                Local Configuration Summary:
              </Text>
              <VStack align="stretch" spacing={2}>
                <Text fontSize="xs" color="whiteAlpha.600">
                  • {formData.localConfig.useLocalBrowser ? 'Using local Chrome browser' : 'Using containerized browser'}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.600">
                  • {formData.localConfig.saveCredentials ? 'Saving browser profile' : 'Using fresh profile each time'}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.600">
                  • {formData.localConfig.debugMode ? 'Debug mode enabled' : 'Debug mode disabled'}
                </Text>
              </VStack>
            </Box>

            <Button
              colorScheme="blue"
              size="lg"
              onClick={handleNext}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Continue to Runner Setup
            </Button>
          </VStack>
        )}

        {step === 3 && (
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="lg" fontWeight="semibold" color="white" mb={1}>
                Set Up Test Runner
              </Text>
              <Text fontSize="sm" color="whiteAlpha.700">
                Install and configure the Compass CLI to run tests locally
              </Text>
            </Box>

            <Box bg="whiteAlpha.100" p={4} borderRadius="md">
              <Text fontSize="sm" color="whiteAlpha.800" mb={4}>
                1. Install the Compass CLI:
              </Text>
              <HStack spacing={4}>
                <Code p={2} borderRadius="md" bg="gray.700" flex={1}>
                  npm install -g @compass/cli
                </Code>
                <Button size="sm" onClick={onCopy}>
                  {hasCopied ? 'Copied!' : 'Copy'}
                </Button>
              </HStack>
            </Box>

            <Box bg="whiteAlpha.100" p={4} borderRadius="md">
              <Text fontSize="sm" color="whiteAlpha.800" mb={2}>
                2. Configure your environment:
              </Text>
              <VStack align="stretch" spacing={4} mt={2}>
                <Badge colorScheme="green" alignSelf="flex-start">
                  Ready to run locally
                </Badge>
                <Text fontSize="xs" color="whiteAlpha.600">
                  Your test will run with the following configuration:
                </Text>
                <Code p={2} borderRadius="md" bg="gray.700" fontSize="xs">
                  {JSON.stringify({
                    browser: formData.localConfig.useLocalBrowser ? 'local-chrome' : 'container-chrome',
                    saveProfile: formData.localConfig.saveCredentials,
                    debug: formData.localConfig.debugMode,
                    workspace: process.cwd()
                  }, null, 2)}
                </Code>
              </VStack>
            </Box>

            <Button
              colorScheme="blue"
              size="lg"
              onClick={handleComplete}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Create and Run Test
            </Button>
          </VStack>
        )}
      </MotionBox>
    </VStack>
  )
} 