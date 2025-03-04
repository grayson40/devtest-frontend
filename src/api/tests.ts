import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export interface TestStep {
  number: number
  description: string
  action: 'click' | 'fill' | 'goto' | 'wait' | 'assert' | 'unknown' | 'view'
  selector?: string
  value?: string
  screenshotUrl?: string
}

export type TestStatus = 'draft' | 'active' | 'archived'

export interface TestCase {
  id?: string
  _id?: string  // MongoDB ID from backend
  title: string
  description?: string
  steps: TestStep[]
  status?: TestStatus
  playwrightTestPath?: string
  practiTestExportPath?: string
}

export interface TestResult {
  id: string
  testCase: string
  sequence?: string
  environment: string
  status: 'passed' | 'failed' | 'error' | 'skipped'
  duration: number
  error?: {
    message: string
    stack: string
  }
  screenshots?: {
    step: number
    path: string
    timestamp: string
  }[]
  startTime: string
  endTime?: string
}

interface ApiResponse<T> {
  status: string
  data: T
  results?: number
}

export const testsApi = {
  // Get all test cases
  getTests: async (): Promise<TestCase[]> => {
    const response = await axios.get<ApiResponse<TestCase[]>>(`${API_BASE_URL}/tests`)
    return response.data.data
  },

  // Get recent test cases
  getRecent: async (): Promise<TestCase[]> => {
    const response = await axios.get<ApiResponse<TestCase[]>>(`${API_BASE_URL}/tests/recent`)
    return response.data.data
  },

  // Get active test executions
  getActiveExecutions: async (): Promise<TestResult[]> => {
    const response = await axios.get<ApiResponse<TestResult[]>>(`${API_BASE_URL}/results/active`)
    return response.data.data
  },

  // Get a test case by ID
  getTest: async (id: string): Promise<TestCase> => {
    const response = await axios.get<ApiResponse<TestCase>>(`${API_BASE_URL}/tests/${id}`)
    return response.data.data
  },

  // Create a test case from Scribe HTML
  createFromScribe: async (html: string): Promise<TestCase> => {
    const response = await axios.post<ApiResponse<TestCase>>(`${API_BASE_URL}/tests`, {
      html
    })
    return response.data.data
  },

  // Update a test case
  updateTest: async (id: string, test: Partial<TestCase>): Promise<TestCase> => {
    const response = await axios.patch<ApiResponse<TestCase>>(`${API_BASE_URL}/tests/${id}`, test)
    return response.data.data
  },

  // Delete a test case
  deleteTest: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/tests/${id}`)
  },

  // Create a new test case
  createTest: async (data: {
    html: string
  }): Promise<TestCase> => {
    const response = await axios.post<ApiResponse<TestCase>>(`${API_BASE_URL}/tests`, data)
    return response.data.data
  },

  // Execute a test case
  executeTest: async (id: string, environment: string): Promise<TestResult> => {
    const response = await axios.post<ApiResponse<TestResult>>(`${API_BASE_URL}/results`, {
      testCase: id,
      environment
    })
    return response.data.data
  },

  // Get test results
  getTestResults: async (params?: {
    testCase?: string
    sequence?: string
    environment?: string
    status?: 'passed' | 'failed' | 'error' | 'skipped'
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<{
    results: TestResult[]
    total: number
    page: number
  }> => {
    const response = await axios.get<ApiResponse<TestResult[]>>(`${API_BASE_URL}/results`, {
      params
    })
    return {
      results: response.data.data,
      total: response.data.results || 0,
      page: params?.page || 1
    }
  },

  // Get a specific test result
  getTestResult: async (id: string): Promise<TestResult> => {
    const response = await axios.get<ApiResponse<TestResult>>(`${API_BASE_URL}/results/${id}`)
    return response.data.data
  },

  // Delete a test result
  deleteTestResult: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/results/${id}`)
  },

  // Export test to PractiTest format
  exportToPractiTest: async (id: string): Promise<void> => {
    await axios.post(`${API_BASE_URL}/tests/${id}/export-practitest`)
  },

  // Get download URL for PractiTest export
  getExportDownloadUrl: (id: string): string => {
    return `${API_BASE_URL}/tests/${id}/download-export`
  },

  // Get download URL for Playwright test file
  getPlaywrightDownloadUrl: (id: string): string => {
    return `${API_BASE_URL}/tests/${id}/download-playwright`
  },

  // Download PractiTest export file
  downloadPractiTestExport: (id: string): void => {
    window.open(`${API_BASE_URL}/tests/${id}/download-export`, '_blank')
  },

  // Download Playwright test file
  downloadPlaywrightTest: (id: string): void => {
    window.open(`${API_BASE_URL}/tests/${id}/download-playwright`, '_blank')
  }
} 