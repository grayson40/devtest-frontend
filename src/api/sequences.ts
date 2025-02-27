import axios from 'axios'
import { Sequence, TestNode } from '@/app/sequences/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface CreateSequencePayload {
  name: string
  description?: string
  tests: {
    testId: string
    order: number
  }[]
}

interface UpdateSequencePayload extends Partial<CreateSequencePayload> {
  status?: 'active' | 'archived' | 'running' | 'completed' | 'failed'
}

interface ApiResponse<T> {
  status: string
  data: T
}

export const sequencesApi = {
  // Get all sequences
  getSequences: async (): Promise<Sequence[]> => {
    const response = await axios.get(`${API_BASE_URL}/sequences`)
    return response.data.data
  },

  // Get a sequence by ID
  getSequence: async (id: string): Promise<Sequence> => {
    const response = await axios.get<ApiResponse<Sequence>>(`${API_BASE_URL}/sequences/${id}`)
    return response.data.data
  },

  // Create a new sequence
  createSequence: async (sequence: CreateSequencePayload): Promise<Sequence> => {
    const response = await axios.post<ApiResponse<Sequence>>(`${API_BASE_URL}/sequences`, sequence)
    return response.data.data
  },

  // Update a sequence
  updateSequence: async (id: string, sequence: UpdateSequencePayload): Promise<Sequence> => {
    const response = await axios.patch<ApiResponse<Sequence>>(`${API_BASE_URL}/sequences/${id}`, sequence)
    return response.data.data
  },

  // Delete a sequence
  deleteSequence: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/sequences/${id}`)
  },

  // Create a sequence from a template
  createFromTemplate: async (template: {
    name: string
    description?: string
    tests: TestNode[]
  }): Promise<Sequence> => {
    // Convert template format to API format
    const payload: CreateSequencePayload = {
      name: template.name,
      description: template.description,
      tests: template.tests.map((test, index) => ({
        testId: test.id,
        order: index + 1
      }))
    }
    return sequencesApi.createSequence(payload)
  }
} 