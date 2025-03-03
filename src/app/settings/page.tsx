'use client'

import React, { useState } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Button,
  Divider,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  Icon,
  Flex,
  Spacer,
  useBreakpointValue
} from '@chakra-ui/react'
import { useAuth } from '@/context/AuthContext'
import { FiUser, FiSettings, FiKey, FiGlobe, FiServer, FiGitBranch, FiSlack, FiMail } from 'react-icons/fi'

export default function SettingsPage() {
  const toast = useToast()
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const isMobile = useBreakpointValue({ base: true, md: false })
  
  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    defaultBrowser: 'chrome',
    defaultViewport: '1280x720',
    defaultNetwork: 'broadband',
    defaultRegion: 'us-east',
    autoRunTests: false,
    saveScreenshots: true,
    debugMode: false
  })
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    slackNotifications: false,
    slackWebhook: '',
    notifyOnFailure: true,
    notifyOnSuccess: false,
    dailyDigest: true
  })
  
  const [integrationSettings, setIntegrationSettings] = useState({
    jiraEnabled: false,
    jiraUrl: '',
    jiraApiKey: '',
    githubEnabled: false,
    githubRepo: '',
    githubToken: ''
  })

  const handleSaveSettings = async () => {
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: 'Settings saved',
      description: 'Your settings have been updated successfully',
      status: 'success',
      duration: 3000,
      isClosable: true
    })
    
    setIsSaving(false)
  }

  return (
    <>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2} color="white">
          Settings
        </Heading>
        <Text color="gray.400">
          Configure your account and test environment preferences
        </Text>
      </Box>

      <Tabs 
        variant="line" 
        colorScheme="blue"
        orientation={isMobile ? 'vertical' : 'horizontal'}
        isLazy
      >
        <TabList 
          mb={6}
          overflowX={isMobile ? 'visible' : 'auto'}
          overflowY={isMobile ? 'auto' : 'visible'}
          flexDirection={isMobile ? 'column' : 'row'}
          alignItems="flex-start"
          position={isMobile ? 'sticky' : 'relative'}
          top={isMobile ? '0' : 'auto'}
          maxH={isMobile ? 'calc(100vh - 200px)' : 'auto'}
          w={isMobile ? '100%' : 'auto'}
        >
          <Tab justifyContent="flex-start" width={isMobile ? 'full' : 'auto'}>
            <HStack><Icon as={FiUser} mr={2} />Account</HStack>
          </Tab>
          <Tab justifyContent="flex-start" width={isMobile ? 'full' : 'auto'}>
            <HStack><Icon as={FiSettings} mr={2} />General</HStack>
          </Tab>
          <Tab justifyContent="flex-start" width={isMobile ? 'full' : 'auto'}>
            <HStack><Icon as={FiServer} mr={2} />Environments</HStack>
          </Tab>
          <Tab justifyContent="flex-start" width={isMobile ? 'full' : 'auto'}>
            <HStack><Icon as={FiGlobe} mr={2} />Integrations</HStack>
          </Tab>
          <Tab justifyContent="flex-start" width={isMobile ? 'full' : 'auto'}>
            <HStack><Icon as={FiMail} mr={2} />Notifications</HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Account Settings */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                <CardHeader>
                  <Heading size="md" color="white">Profile Information</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel color="gray.300">Name</FormLabel>
                      <Input 
                        defaultValue={user?.name || ''} 
                        bg="gray.700" 
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel color="gray.300">Email</FormLabel>
                      <Input 
                        defaultValue={user?.email || ''} 
                        isReadOnly
                        bg="gray.700" 
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel color="gray.300">Company</FormLabel>
                      <Input 
                        placeholder="Your company name" 
                        bg="gray.700" 
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                    
                    <Button colorScheme="blue" mt={2}>
                      Update Profile
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                <CardHeader>
                  <Heading size="md" color="white">Security</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel color="gray.300">Current Password</FormLabel>
                      <Input 
                        type="password" 
                        placeholder="Enter current password" 
                        bg="gray.700" 
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel color="gray.300">New Password</FormLabel>
                      <Input 
                        type="password" 
                        placeholder="Enter new password" 
                        bg="gray.700" 
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel color="gray.300">Confirm New Password</FormLabel>
                      <Input 
                        type="password" 
                        placeholder="Confirm new password" 
                        bg="gray.700" 
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                    
                    <Button colorScheme="blue" mt={2}>
                      Change Password
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* General Settings */}
          <TabPanel px={0}>
            <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
              <CardHeader>
                <Heading size="md" color="white">Test Execution Defaults</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel color="gray.300">Default Browser</FormLabel>
                    <Select 
                      value={generalSettings.defaultBrowser}
                      onChange={(e) => setGeneralSettings({...generalSettings, defaultBrowser: e.target.value})}
                      bg="gray.700" 
                      borderColor="gray.600"
                      _hover={{ borderColor: "gray.500" }}
                      _focus={{ borderColor: "blue.400" }}
                    >
                      <option value="chrome">Chrome</option>
                      <option value="firefox">Firefox</option>
                      <option value="safari">Safari</option>
                      <option value="edge">Edge</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel color="gray.300">Default Viewport</FormLabel>
                    <Select 
                      value={generalSettings.defaultViewport}
                      onChange={(e) => setGeneralSettings({...generalSettings, defaultViewport: e.target.value})}
                      bg="gray.700" 
                      borderColor="gray.600"
                      _hover={{ borderColor: "gray.500" }}
                      _focus={{ borderColor: "blue.400" }}
                    >
                      <option value="1280x720">1280x720 (HD)</option>
                      <option value="1920x1080">1920x1080 (Full HD)</option>
                      <option value="375x667">375x667 (Mobile)</option>
                      <option value="768x1024">768x1024 (Tablet)</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel color="gray.300">Default Network</FormLabel>
                    <Select 
                      value={generalSettings.defaultNetwork}
                      onChange={(e) => setGeneralSettings({...generalSettings, defaultNetwork: e.target.value})}
                      bg="gray.700" 
                      borderColor="gray.600"
                      _hover={{ borderColor: "gray.500" }}
                      _focus={{ borderColor: "blue.400" }}
                    >
                      <option value="broadband">Broadband</option>
                      <option value="4g">4G</option>
                      <option value="3g">3G</option>
                      <option value="slow">Slow 2G</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel color="gray.300">Default Region</FormLabel>
                    <Select 
                      value={generalSettings.defaultRegion}
                      onChange={(e) => setGeneralSettings({...generalSettings, defaultRegion: e.target.value})}
                      bg="gray.700" 
                      borderColor="gray.600"
                      _hover={{ borderColor: "gray.500" }}
                      _focus={{ borderColor: "blue.400" }}
                    >
                      <option value="us-east">US East</option>
                      <option value="us-west">US West</option>
                      <option value="eu-west">EU West</option>
                      <option value="ap-south">Asia Pacific</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                <Divider my={6} borderColor="gray.700" />
                
                <VStack spacing={4} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="auto-run" mb="0" color="gray.300">
                      Auto-run tests after import
                    </FormLabel>
                    <Spacer />
                    <Switch 
                      id="auto-run" 
                      isChecked={generalSettings.autoRunTests}
                      onChange={(e) => setGeneralSettings({...generalSettings, autoRunTests: e.target.checked})}
                      colorScheme="blue"
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="save-screenshots" mb="0" color="gray.300">
                      Save screenshots for each step
                    </FormLabel>
                    <Spacer />
                    <Switch 
                      id="save-screenshots" 
                      isChecked={generalSettings.saveScreenshots}
                      onChange={(e) => setGeneralSettings({...generalSettings, saveScreenshots: e.target.checked})}
                      colorScheme="blue"
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="debug-mode" mb="0" color="gray.300">
                      Debug mode
                    </FormLabel>
                    <Spacer />
                    <Switch 
                      id="debug-mode" 
                      isChecked={generalSettings.debugMode}
                      onChange={(e) => setGeneralSettings({...generalSettings, debugMode: e.target.checked})}
                      colorScheme="blue"
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Environments Settings */}
          <TabPanel px={0}>
            <Card bg="gray.800" borderColor="gray.700" borderWidth="1px" mb={6}>
              <CardHeader>
                <Flex>
                  <Heading size="md" color="white">Test Environments</Heading>
                  <Spacer />
                  <Button size="sm" colorScheme="blue">Add Environment</Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Box p={4} bg="gray.700" borderRadius="md">
                    <Flex align="center">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Heading size="sm" color="white">Production</Heading>
                          <Badge colorScheme="green">Active</Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.400">https://app.example.com</Text>
                      </VStack>
                      <Spacer />
                      <HStack>
                        <Button size="sm" variant="ghost">Edit</Button>
                        <Button size="sm" variant="ghost" colorScheme="red">Delete</Button>
                      </HStack>
                    </Flex>
                  </Box>
                  
                  <Box p={4} bg="gray.700" borderRadius="md">
                    <Flex align="center">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Heading size="sm" color="white">Staging</Heading>
                          <Badge colorScheme="blue">Active</Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.400">https://staging.example.com</Text>
                      </VStack>
                      <Spacer />
                      <HStack>
                        <Button size="sm" variant="ghost">Edit</Button>
                        <Button size="sm" variant="ghost" colorScheme="red">Delete</Button>
                      </HStack>
                    </Flex>
                  </Box>
                  
                  <Box p={4} bg="gray.700" borderRadius="md">
                    <Flex align="center">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Heading size="sm" color="white">Development</Heading>
                          <Badge colorScheme="yellow">Inactive</Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.400">https://dev.example.com</Text>
                      </VStack>
                      <Spacer />
                      <HStack>
                        <Button size="sm" variant="ghost">Edit</Button>
                        <Button size="sm" variant="ghost" colorScheme="red">Delete</Button>
                      </HStack>
                    </Flex>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
            
            <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
              <CardHeader>
                <Heading size="md" color="white">Git Configuration</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel color="gray.300">Default Repository</FormLabel>
                    <Input 
                      placeholder="username/repository" 
                      bg="gray.700" 
                      borderColor="gray.600"
                      _hover={{ borderColor: "gray.500" }}
                      _focus={{ borderColor: "blue.400" }}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel color="gray.300">Default Branch</FormLabel>
                    <Input 
                      defaultValue="main" 
                      bg="gray.700" 
                      borderColor="gray.600"
                      _hover={{ borderColor: "gray.500" }}
                      _focus={{ borderColor: "blue.400" }}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="auto-sync" mb="0" color="gray.300">
                      Auto-sync test changes to Git
                    </FormLabel>
                    <Spacer />
                    <Switch id="auto-sync" colorScheme="blue" />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Integrations Settings */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                <CardHeader>
                  <Flex align="center">
                    <Heading size="md" color="white">Jira Integration</Heading>
                    <Spacer />
                    <Switch 
                      isChecked={integrationSettings.jiraEnabled}
                      onChange={(e) => setIntegrationSettings({...integrationSettings, jiraEnabled: e.target.checked})}
                      colorScheme="blue"
                    />
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl isDisabled={!integrationSettings.jiraEnabled}>
                      <FormLabel color="gray.300">Jira URL</FormLabel>
                      <Input 
                        placeholder="https://your-domain.atlassian.net" 
                        value={integrationSettings.jiraUrl}
                        onChange={(e) => setIntegrationSettings({...integrationSettings, jiraUrl: e.target.value})}
                        bg="gray.700" 
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                    
                    <FormControl isDisabled={!integrationSettings.jiraEnabled}>
                      <FormLabel color="gray.300">API Key</FormLabel>
                      <Input 
                        type="password" 
                        placeholder="Enter your Jira API key" 
                        value={integrationSettings.jiraApiKey}
                        onChange={(e) => setIntegrationSettings({...integrationSettings, jiraApiKey: e.target.value})}
                        bg="gray.700" 
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                    
                    <Button 
                      colorScheme="blue" 
                      isDisabled={!integrationSettings.jiraEnabled || !integrationSettings.jiraUrl || !integrationSettings.jiraApiKey}
                    >
                      Test Connection
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                <CardHeader>
                  <Flex align="center">
                    <Heading size="md" color="white">GitHub Integration</Heading>
                    <Spacer />
                    <Switch 
                      isChecked={integrationSettings.githubEnabled}
                      onChange={(e) => setIntegrationSettings({...integrationSettings, githubEnabled: e.target.checked})}
                      colorScheme="blue"
                    />
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl isDisabled={!integrationSettings.githubEnabled}>
                      <FormLabel color="gray.300">GitHub Repository</FormLabel>
                      <Input 
                        placeholder="username/repository" 
                        value={integrationSettings.githubRepo}
                        onChange={(e) => setIntegrationSettings({...integrationSettings, githubRepo: e.target.value})}
                        bg="gray.700" 
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                    
                    <FormControl isDisabled={!integrationSettings.githubEnabled}>
                      <FormLabel color="gray.300">Personal Access Token</FormLabel>
                      <Input 
                        type="password" 
                        placeholder="Enter your GitHub token" 
                        value={integrationSettings.githubToken}
                        onChange={(e) => setIntegrationSettings({...integrationSettings, githubToken: e.target.value})}
                        bg="gray.700" 
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                    
                    <Button 
                      colorScheme="blue" 
                      isDisabled={!integrationSettings.githubEnabled || !integrationSettings.githubRepo || !integrationSettings.githubToken}
                    >
                      Test Connection
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Notifications Settings */}
          <TabPanel px={0}>
            <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
              <CardHeader>
                <Heading size="md" color="white">Notification Preferences</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <HStack>
                      <Icon as={FiMail} color="gray.400" />
                      <FormLabel htmlFor="email-notifications" mb="0" color="gray.300">
                        Email Notifications
                      </FormLabel>
                    </HStack>
                    <Spacer />
                    <Switch 
                      id="email-notifications" 
                      isChecked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                      colorScheme="blue"
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <HStack>
                      <Icon as={FiSlack} color="gray.400" />
                      <FormLabel htmlFor="slack-notifications" mb="0" color="gray.300">
                        Slack Notifications
                      </FormLabel>
                    </HStack>
                    <Spacer />
                    <Switch 
                      id="slack-notifications" 
                      isChecked={notificationSettings.slackNotifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, slackNotifications: e.target.checked})}
                      colorScheme="blue"
                    />
                  </FormControl>
                  
                  {notificationSettings.slackNotifications && (
                    <FormControl>
                      <FormLabel color="gray.300">Slack Webhook URL</FormLabel>
                      <Input 
                        placeholder="https://hooks.slack.com/services/..." 
                        value={notificationSettings.slackWebhook}
                        onChange={(e) => setNotificationSettings({...notificationSettings, slackWebhook: e.target.value})}
                        bg="gray.700" 
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.400" }}
                      />
                    </FormControl>
                  )}
                  
                  <Divider borderColor="gray.700" />
                  
                  <Heading size="sm" color="white">Notification Events</Heading>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="notify-failure" mb="0" color="gray.300">
                      Test Failures
                    </FormLabel>
                    <Spacer />
                    <Switch 
                      id="notify-failure" 
                      isChecked={notificationSettings.notifyOnFailure}
                      onChange={(e) => setNotificationSettings({...notificationSettings, notifyOnFailure: e.target.checked})}
                      colorScheme="blue"
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="notify-success" mb="0" color="gray.300">
                      Test Successes
                    </FormLabel>
                    <Spacer />
                    <Switch 
                      id="notify-success" 
                      isChecked={notificationSettings.notifyOnSuccess}
                      onChange={(e) => setNotificationSettings({...notificationSettings, notifyOnSuccess: e.target.checked})}
                      colorScheme="blue"
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="daily-digest" mb="0" color="gray.300">
                      Daily Test Summary
                    </FormLabel>
                    <Spacer />
                    <Switch 
                      id="daily-digest" 
                      isChecked={notificationSettings.dailyDigest}
                      onChange={(e) => setNotificationSettings({...notificationSettings, dailyDigest: e.target.checked})}
                      colorScheme="blue"
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Flex mt={8} justify="flex-end">
        <Button 
          colorScheme="blue" 
          size="lg" 
          onClick={handleSaveSettings} 
          isLoading={isSaving}
          loadingText="Saving..."
          w={{ base: 'full', md: 'auto' }}
        >
          Save All Settings
        </Button>
      </Flex>
    </>
  )
} 