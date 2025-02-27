export interface TestNode {
  id: string
  title: string
  status: 'passed' | 'failed' | 'not_run' | 'running'
  runInParallel?: boolean
  dependencies?: string[]
  progress?: number
  duration?: number
}

export interface Sequence {
  id: string
  name: string
  description?: string
  tests: TestNode[]
  lastRun?: string
  totalDuration?: number
  parallelTests: number
} 