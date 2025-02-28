import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export interface Environment {
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

interface CreateEnvironmentPayload {
  name: string
  gitConfig: {
    repository: string
    branch: string
  }
  vmConfig: {
    os: string
    memory: number
    cpu: number
    disk: number
  }
}

interface ApiResponse<T> {
  status: string
  data: T
}

export const environmentsApi = {
  // Get all environments
  getEnvironments: async (): Promise<Environment[]> => {
    const response = await axios.get<ApiResponse<Environment[]>>(`${API_BASE_URL}/environments`)
    return response.data.data
  },

  // Get environment by ID
  getEnvironment: async (id: string): Promise<Environment> => {
    const response = await axios.get<ApiResponse<Environment>>(`${API_BASE_URL}/environments/${id}`)
    return response.data.data
  },

  // Create new environment
  createEnvironment: async (environment: CreateEnvironmentPayload): Promise<Environment> => {
    const response = await axios.post<ApiResponse<Environment>>(`${API_BASE_URL}/environments`, environment)
    return response.data.data
  },

  // Update environment
  updateEnvironment: async (id: string, environment: Partial<Environment>): Promise<Environment> => {
    const response = await axios.patch<ApiResponse<Environment>>(`${API_BASE_URL}/environments/${id}`, environment)
    return response.data.data
  },

  // Delete environment
  deleteEnvironment: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/environments/${id}`)
  },

  // Sync environment with GitHub
  syncEnvironment: async (id: string): Promise<Environment> => {
    const response = await axios.post<ApiResponse<Environment>>(`${API_BASE_URL}/environments/${id}/sync`)
    return response.data.data
  },

  // Get environment status
  getEnvironmentStatus: async (id: string): Promise<{
    status: Environment['status']
    lastSync: string
    currentOperation?: string
  }> => {
    const response = await axios.get<ApiResponse<{
      status: Environment['status']
      lastSync: string
      currentOperation?: string
    }>>(`${API_BASE_URL}/environments/${id}/status`)
    return response.data.data
  }
} 