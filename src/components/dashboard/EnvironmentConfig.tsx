import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Badge,
  useToast,
  IconButton,
  Tooltip,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react'
import { RepeatIcon, ExternalLinkIcon } from '@chakra-ui/icons'

interface Environment {
  id: string
  name: string
  status: 'active' | 'inactive' | 'provisioning' | 'error'
  gitConfig: {
    repository: string
    branch: string
    lastSync: string
  }
  vmConfig: {
    os: string
    memory: number
    cpu: number
    disk: number
  }
}

interface EnvironmentConfigProps {
  environments: Environment[]
  onCreateEnvironment?: () => void
  onUpdateEnvironment?: (id: string, config: Partial<Environment>) => void
  onDeleteEnvironment?: (id: string) => void
  onSyncEnvironment?: (id: string) => void
}

export function EnvironmentConfig({
  environments = [],
  onCreateEnvironment,
  onUpdateEnvironment,
  onDeleteEnvironment,
  onSyncEnvironment,
}: EnvironmentConfigProps) {
  const [isCreating, setIsCreating] = useState(false)
  const toast = useToast()

  const statusColors = {
    active: 'green',
    inactive: 'gray',
    provisioning: 'blue',
    error: 'red',
  }

  const handleSync = async (id: string) => {
    try {
      onSyncEnvironment?.(id)
      toast({
        title: 'Environment synced',
        description: 'Successfully pulled latest changes from GitHub',
        status: 'success',
      })
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Failed to sync with GitHub',
        status: 'error',
      })
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Box>
          <Text fontSize="lg" fontWeight="medium" mb={1}>
            Test Environments
          </Text>
          <Text color="gray.600" fontSize="sm">
            Configure and manage your test environments
          </Text>
        </Box>
        <Button
          colorScheme="primary"
          size="sm"
          onClick={() => setIsCreating(true)}
        >
          New Environment
        </Button>
      </HStack>

      {isCreating && (
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="medium">New Environment</Text>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input placeholder="e.g., Development, Staging" />
              </FormControl>

              <Box>
                <Text fontWeight="medium" mb={3}>GitHub Configuration</Text>
                <VStack spacing={3}>
                  <FormControl>
                    <FormLabel>Repository URL</FormLabel>
                    <Input placeholder="https://github.com/username/repo" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Branch</FormLabel>
                    <Input placeholder="main" />
                  </FormControl>
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="medium" mb={3}>VM Configuration</Text>
                <VStack spacing={3}>
                  <FormControl>
                    <FormLabel>Operating System</FormLabel>
                    <Select>
                      <option value="ubuntu-20.04">Ubuntu 20.04</option>
                      <option value="ubuntu-22.04">Ubuntu 22.04</option>
                      <option value="debian-11">Debian 11</option>
                    </Select>
                  </FormControl>
                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel>Memory (GB)</FormLabel>
                      <Select>
                        <option value="2">2 GB</option>
                        <option value="4">4 GB</option>
                        <option value="8">8 GB</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>CPU Cores</FormLabel>
                      <Select>
                        <option value="1">1 Core</option>
                        <option value="2">2 Cores</option>
                        <option value="4">4 Cores</option>
                      </Select>
                    </FormControl>
                  </HStack>
                </VStack>
              </Box>

              <HStack justify="flex-end" spacing={3}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="primary"
                  size="sm"
                >
                  Create Environment
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {environments.map((env) => (
        <Card key={env.id}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <HStack>
                    <Text fontWeight="medium">{env.name}</Text>
                    <Badge colorScheme={statusColors[env.status]}>
                      {env.status}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    Last synced: {new Date(env.gitConfig.lastSync).toLocaleString()}
                  </Text>
                </VStack>
                <HStack>
                  <Tooltip label="Sync with GitHub">
                    <IconButton
                      aria-label="Sync environment"
                      icon={<RepeatIcon />}
                      size="sm"
                      onClick={() => handleSync(env.id)}
                    />
                  </Tooltip>
                  <Button
                    size="sm"
                    variant="outline"
                    rightIcon={<ExternalLinkIcon />}
                    as="a"
                    href={env.gitConfig.repository}
                    target="_blank"
                  >
                    View Repository
                  </Button>
                </HStack>
              </HStack>

              <Divider />

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  GitHub Configuration
                </Text>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm">
                    Repository: {env.gitConfig.repository.split('/').slice(-2).join('/')}
                  </Text>
                  <Text fontSize="sm">
                    Branch: {env.gitConfig.branch}
                  </Text>
                </VStack>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  VM Configuration
                </Text>
                <SimpleGrid columns={2} spacing={4}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">Operating System</Text>
                    <Text fontSize="sm">{env.vmConfig.os}</Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">Memory</Text>
                    <Text fontSize="sm">{env.vmConfig.memory} GB</Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">CPU Cores</Text>
                    <Text fontSize="sm">{env.vmConfig.cpu} Cores</Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">Disk Space</Text>
                    <Text fontSize="sm">{env.vmConfig.disk} GB</Text>
                  </VStack>
                </SimpleGrid>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </VStack>
  )
} 