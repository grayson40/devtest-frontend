'use client'

import React, { useCallback, useState } from 'react'
import { Box, VStack, Text, Button, Icon, useColorModeValue, Progress } from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

export function ScribeUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    
    setIsUploading(true)
    // Simulate upload progress - replace with actual API call
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)
        // TODO: Call API to parse HTML
      }
    }, 200)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html']
    },
    maxFiles: 1
  })

  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const bgColor = useColorModeValue('gray.50', 'gray.700')
  const activeBg = useColorModeValue('gray.100', 'gray.600')

  return (
    <VStack spacing={4} w="full">
      <MotionBox
        {...getRootProps()}
        w="full"
        h="200px"
        border="2px"
        borderStyle="dashed"
        borderColor={isDragActive ? 'primary.500' : borderColor}
        borderRadius="lg"
        bg={isDragActive ? activeBg : bgColor}
        cursor="pointer"
        transition="all 0.2s"
        display="flex"
        alignItems="center"
        justifyContent="center"
        _hover={{ borderColor: 'primary.500' }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
        <VStack spacing={2}>
          <Icon as={() => <span role="img" aria-label="upload" style={{ fontSize: '2rem' }}>📝</span>} />
          <Text color="gray.600" fontSize="sm" textAlign="center">
            {isDragActive ? (
              'Drop your Scribe HTML file here'
            ) : (
              'Drag and drop your Scribe HTML file here, or click to select'
            )}
          </Text>
          <Text color="gray.400" fontSize="xs">
            Only .html files are supported
          </Text>
        </VStack>
      </MotionBox>

      {isUploading && (
        <Box w="full">
          <Progress 
            value={uploadProgress} 
            size="sm" 
            colorScheme="primary" 
            borderRadius="full"
            hasStripe
            isAnimated
          />
          <Text mt={2} fontSize="sm" color="gray.600" textAlign="center">
            Processing Scribe recording...
          </Text>
        </Box>
      )}

      <Button
        colorScheme="primary"
        size="sm"
        leftIcon={<span>⚡</span>}
        isLoading={isUploading}
      >
        Generate Test Case
      </Button>
    </VStack>
  )
} 