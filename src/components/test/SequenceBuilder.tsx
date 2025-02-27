'use client'

import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Card,
  CardBody,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { DragHandleIcon, ChevronDownIcon, AddIcon } from '@chakra-ui/icons'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { TestCase } from '@/api/tests'
import { TestNode } from '@/app/sequences/types'

interface SequenceBuilderProps {
  availableTests: TestCase[]
  initialSequence?: TestNode[]
  onSave?: (sequence: TestNode[]) => void
}

export function SequenceBuilder({ 
  availableTests, 
  initialSequence = [], 
  onSave 
}: SequenceBuilderProps) {
  const [sequence, setSequence] = useState<TestNode[]>(initialSequence)
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set())

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(sequence)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSequence(items)
  }

  const addTest = (test: TestCase) => {
    if (!test.id) return

    const newTest: TestNode = {
      id: test.id,
      title: test.title,
      status: 'not_run',
      dependencies: [],
      runInParallel: false
    }

    setSequence([...sequence, newTest])
    setSelectedTests(new Set([...selectedTests, test.id]))
  }

  const removeTest = (index: number) => {
    const test = sequence[index]
    const newSequence = sequence.filter((_, i) => i !== index)
    setSequence(newSequence)
    if (test.id) {
      const newSelected = new Set(selectedTests)
      newSelected.delete(test.id)
      setSelectedTests(newSelected)
    }
  }

  const toggleParallel = (index: number) => {
    const newSequence = [...sequence]
    newSequence[index] = {
      ...newSequence[index],
      runInParallel: !newSequence[index].runInParallel
    }
    setSequence(newSequence)
  }

  const addDependency = (testIndex: number, dependencyId: string) => {
    const newSequence = [...sequence]
    const test = newSequence[testIndex]
    if (!test.dependencies?.includes(dependencyId)) {
      newSequence[testIndex] = {
        ...test,
        dependencies: [...(test.dependencies || []), dependencyId]
      }
      setSequence(newSequence)
    }
  }

  const removeDependency = (testIndex: number, dependencyId: string) => {
    const newSequence = [...sequence]
    const test = newSequence[testIndex]
    newSequence[testIndex] = {
      ...test,
      dependencies: test.dependencies?.filter(id => id !== dependencyId) || []
    }
    setSequence(newSequence)
  }

  const handleSave = () => {
    onSave?.(sequence)
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Menu>
          <MenuButton
            as={Button}
            leftIcon={<AddIcon />}
            rightIcon={<ChevronDownIcon />}
          >
            Add Test
          </MenuButton>
          <MenuList maxH="300px" overflowY="auto">
            {availableTests
              .filter(test => test.id && !selectedTests.has(test.id))
              .map(test => (
                <MenuItem
                  key={test.id}
                  onClick={() => addTest(test)}
                >
                  {test.title}
                </MenuItem>
              ))}
          </MenuList>
        </Menu>
        <Button
          colorScheme="primary"
          onClick={handleSave}
        >
          Save Sequence
        </Button>
      </HStack>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sequence">
          {(provided) => (
            <VStack
              spacing={4}
              align="stretch"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {sequence.map((test, index) => (
                <Draggable
                  key={test.id}
                  draggableId={test.id}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <CardBody>
                        <HStack spacing={4}>
                          <IconButton
                            {...provided.dragHandleProps}
                            aria-label="Drag handle"
                            icon={<DragHandleIcon />}
                            variant="ghost"
                            cursor="grab"
                          />
                          <VStack align="start" flex={1} spacing={2}>
                            <HStack width="full" justify="space-between">
                              <Text fontWeight="medium">{test.title}</Text>
                              <HStack>
                                <FormControl display="flex" alignItems="center">
                                  <FormLabel htmlFor={`parallel-${test.id}`} mb="0" fontSize="sm">
                                    Run in Parallel
                                  </FormLabel>
                                  <Switch
                                    id={`parallel-${test.id}`}
                                    isChecked={test.runInParallel}
                                    onChange={() => toggleParallel(index)}
                                  />
                                </FormControl>
                                <Menu>
                                  <MenuButton
                                    as={Button}
                                    size="sm"
                                    variant="outline"
                                    rightIcon={<ChevronDownIcon />}
                                  >
                                    Dependencies
                                  </MenuButton>
                                  <MenuList>
                                    {sequence
                                      .filter((t, i) => i < index && t.id !== test.id)
                                      .map(t => (
                                        <MenuItem
                                          key={t.id}
                                          onClick={() => {
                                            if (test.dependencies?.includes(t.id)) {
                                              removeDependency(index, t.id)
                                            } else {
                                              addDependency(index, t.id)
                                            }
                                          }}
                                        >
                                          <HStack justify="space-between" width="full">
                                            <Text>{t.title}</Text>
                                            {test.dependencies?.includes(t.id) && (
                                              <Badge colorScheme="green">Selected</Badge>
                                            )}
                                          </HStack>
                                        </MenuItem>
                                      ))}
                                    {sequence.filter((t, i) => i < index).length === 0 && (
                                      <MenuItem isDisabled>
                                        No available dependencies
                                      </MenuItem>
                                    )}
                                  </MenuList>
                                </Menu>
                                <IconButton
                                  aria-label="Remove test"
                                  icon={<span>🗑️</span>}
                                  variant="ghost"
                                  onClick={() => removeTest(index)}
                                />
                              </HStack>
                            </HStack>
                            {test.dependencies && test.dependencies.length > 0 && (
                              <HStack spacing={2}>
                                <Text fontSize="sm" color="gray.500">
                                  Depends on:
                                </Text>
                                {test.dependencies.map(depId => {
                                  const dep = sequence.find(t => t.id === depId)
                                  return dep ? (
                                    <Badge
                                      key={depId}
                                      colorScheme="blue"
                                      variant="subtle"
                                    >
                                      {dep.title}
                                    </Badge>
                                  ) : null
                                })}
                              </HStack>
                            )}
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {sequence.length === 0 && (
                <Box
                  p={8}
                  textAlign="center"
                  bg="gray.50"
                  borderRadius="lg"
                  borderWidth={2}
                  borderStyle="dashed"
                  borderColor="gray.200"
                >
                  <Text color="gray.500">
                    Add tests to create your sequence
                  </Text>
                </Box>
              )}
            </VStack>
          )}
        </Droppable>
      </DragDropContext>
    </VStack>
  )
} 