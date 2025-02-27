'use client'

import React from 'react'
import {
  Box,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  Progress,
  Tooltip,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { SettingsIcon, RepeatIcon } from '@chakra-ui/icons'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'running' | 'error'
  currentTest?: string
  lastPing: string
  specs: {
    os: string
    browser: string
    cpu: string
    memory: string
  }
  metrics: {
    testsCompleted: number
    uptime: number
    cpuUsage: number
    memoryUsage: number
  }
}

interface AgentDashboardProps {
  agents: Agent[]
  onRestartAgent: (agentId: string) => void
  onConfigureAgent: (agentId: string) => void
}

export function AgentDashboard({ agents, onRestartAgent, onConfigureAgent }: AgentDashboardProps) {
  const statusColors = {
    idle: 'gray',
    running: 'green',
    error: 'red',
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <SimpleGrid columns={[1, null, 2, 3]} spacing={6}>
      {agents.map(agent => (
        <Card key={agent.id}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <HStack>
                  <Badge
                    colorScheme={statusColors[agent.status]}
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {agent.status}
                  </Badge>
                  <Text fontWeight="medium">{agent.name}</Text>
                </HStack>
                <HStack>
                  <Tooltip label="Restart agent">
                    <IconButton
                      aria-label="Restart agent"
                      icon={<RepeatIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={() => onRestartAgent(agent.id)}
                    />
                  </Tooltip>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Agent settings"
                      icon={<SettingsIcon />}
                      size="sm"
                      variant="ghost"
                    />
                    <MenuList>
                      <MenuItem onClick={() => onConfigureAgent(agent.id)}>
                        Configure
                      </MenuItem>
                      <MenuItem onClick={() => onRestartAgent(agent.id)}>
                        Restart
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
              </HStack>

              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  System Info
                </Text>
                <SimpleGrid columns={2} spacing={2}>
                  <Text fontSize="xs" color="gray.500">OS</Text>
                  <Text fontSize="xs">{agent.specs.os}</Text>
                  <Text fontSize="xs" color="gray.500">Browser</Text>
                  <Text fontSize="xs">{agent.specs.browser}</Text>
                  <Text fontSize="xs" color="gray.500">CPU</Text>
                  <Text fontSize="xs">{agent.specs.cpu}</Text>
                  <Text fontSize="xs" color="gray.500">Memory</Text>
                  <Text fontSize="xs">{agent.specs.memory}</Text>
                </SimpleGrid>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Performance
                </Text>
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      CPU Usage
                    </Text>
                    <Tooltip label={`${agent.metrics.cpuUsage}%`}>
                      <Progress
                        value={agent.metrics.cpuUsage}
                        size="sm"
                        colorScheme={agent.metrics.cpuUsage > 80 ? 'red' : 'blue'}
                        borderRadius="full"
                      />
                    </Tooltip>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Memory Usage
                    </Text>
                    <Tooltip label={`${agent.metrics.memoryUsage}%`}>
                      <Progress
                        value={agent.metrics.memoryUsage}
                        size="sm"
                        colorScheme={agent.metrics.memoryUsage > 80 ? 'red' : 'blue'}
                        borderRadius="full"
                      />
                    </Tooltip>
                  </Box>
                </SimpleGrid>
              </Box>

              <HStack justify="space-between" fontSize="sm" color="gray.600">
                <Text>Tests: {agent.metrics.testsCompleted}</Text>
                <Text>Uptime: {formatUptime(agent.metrics.uptime)}</Text>
              </HStack>

              {agent.currentTest && (
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Current Test
                  </Text>
                  <Text fontSize="sm" noOfLines={1}>
                    {agent.currentTest}
                  </Text>
                </Box>
              )}

              <Text fontSize="xs" color="gray.500">
                Last ping: {new Date(agent.lastPing).toLocaleTimeString()}
              </Text>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  )
} 