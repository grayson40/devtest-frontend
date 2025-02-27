'use client'

import React from 'react'
import { Box, Grid, GridItem, Heading, Text, Card, CardBody, VStack } from '@chakra-ui/react'
import { AppLayout } from '@/components/layout'
import { QuickActions } from '@/components/dashboard/QuickActions'

export default function Home() {
  return (
    <AppLayout>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Welcome to DevTest</Heading>
          <Text color="gray.600">Manage and automate your testing workflow</Text>
        </Box>

        <Box>
          <Heading size="md" mb={4}>Quick Actions</Heading>
          <QuickActions />
        </Box>

        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          {/* Stats Grid */}
          <GridItem colSpan={[12, 6, 3]}>
            <Card>
              <CardBody>
                <VStack align="start">
                  <Text color="gray.500" fontSize="sm">Total Tests</Text>
                  <Heading size="lg">24</Heading>
                  <Text color="green.500" fontSize="sm">↑ 12% from last week</Text>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem colSpan={[12, 6, 3]}>
            <Card>
              <CardBody>
                <VStack align="start">
                  <Text color="gray.500" fontSize="sm">Pass Rate</Text>
                  <Heading size="lg">87%</Heading>
                  <Text color="green.500" fontSize="sm">↑ 4% from last week</Text>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem colSpan={[12, 6, 3]}>
            <Card>
              <CardBody>
                <VStack align="start">
                  <Text color="gray.500" fontSize="sm">Active Sequences</Text>
                  <Heading size="lg">8</Heading>
                  <Text color="gray.500" fontSize="sm">Last run 2h ago</Text>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem colSpan={[12, 6, 3]}>
            <Card>
              <CardBody>
                <VStack align="start">
                  <Text color="gray.500" fontSize="sm">Jira Tickets</Text>
                  <Heading size="lg">12</Heading>
                  <Text color="orange.500" fontSize="sm">4 with failing tests</Text>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </VStack>
    </AppLayout>
  )
}
