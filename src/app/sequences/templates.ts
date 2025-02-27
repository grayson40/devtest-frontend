import { TestNode } from './types'

export interface SequenceTemplate {
  id: string
  name: string
  description: string
  tests: TestNode[]
}

export const sequenceTemplates: SequenceTemplate[] = [
  {
    id: 'user-journey',
    name: 'User Journey',
    description: 'Complete end-to-end user flow from registration to checkout',
    tests: [
      {
        id: 'register',
        title: 'User Registration',
        status: 'not_run',
        duration: 10,
      },
      {
        id: 'verify',
        title: 'Email Verification',
        status: 'not_run',
        dependencies: ['register'],
        duration: 5,
      },
      {
        id: 'profile',
        title: 'Profile Setup',
        status: 'not_run',
        dependencies: ['verify'],
        duration: 8,
      },
      {
        id: 'search',
        title: 'Product Search',
        status: 'not_run',
        dependencies: ['verify'],
        runInParallel: true,
        duration: 12,
      },
      {
        id: 'cart',
        title: 'Add to Cart',
        status: 'not_run',
        dependencies: ['search'],
        duration: 6,
      },
      {
        id: 'checkout',
        title: 'Checkout Process',
        status: 'not_run',
        dependencies: ['profile', 'cart'],
        duration: 15,
      }
    ]
  },
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    description: 'Administrative functions and user management',
    tests: [
      {
        id: 'admin-login',
        title: 'Admin Login',
        status: 'not_run',
        duration: 5,
      },
      {
        id: 'user-list',
        title: 'View User List',
        status: 'not_run',
        dependencies: ['admin-login'],
        duration: 8,
      },
      {
        id: 'user-details',
        title: 'User Details View',
        status: 'not_run',
        dependencies: ['user-list'],
        duration: 10,
      },
      {
        id: 'user-edit',
        title: 'Edit User',
        status: 'not_run',
        dependencies: ['user-details'],
        duration: 12,
      },
      {
        id: 'user-permissions',
        title: 'Manage Permissions',
        status: 'not_run',
        dependencies: ['user-edit'],
        duration: 8,
      }
    ]
  },
  {
    id: 'data-operations',
    name: 'Data Operations',
    description: 'Bulk data import/export and processing',
    tests: [
      {
        id: 'import-validation',
        title: 'Import File Validation',
        status: 'not_run',
        duration: 5,
      },
      {
        id: 'data-import',
        title: 'Data Import Process',
        status: 'not_run',
        dependencies: ['import-validation'],
        duration: 20,
      },
      {
        id: 'data-processing',
        title: 'Data Processing',
        status: 'not_run',
        dependencies: ['data-import'],
        duration: 30,
      },
      {
        id: 'validation',
        title: 'Data Validation',
        status: 'not_run',
        dependencies: ['data-processing'],
        runInParallel: true,
        duration: 15,
      },
      {
        id: 'export',
        title: 'Data Export',
        status: 'not_run',
        dependencies: ['validation'],
        duration: 10,
      }
    ]
  },
  {
    id: 'api-health',
    name: 'API Health Check',
    description: 'Comprehensive API endpoint testing',
    tests: [
      {
        id: 'auth',
        title: 'Authentication Endpoints',
        status: 'not_run',
        duration: 8,
      },
      {
        id: 'users-api',
        title: 'Users API',
        status: 'not_run',
        dependencies: ['auth'],
        runInParallel: true,
        duration: 12,
      },
      {
        id: 'products-api',
        title: 'Products API',
        status: 'not_run',
        dependencies: ['auth'],
        runInParallel: true,
        duration: 10,
      },
      {
        id: 'orders-api',
        title: 'Orders API',
        status: 'not_run',
        dependencies: ['auth'],
        runInParallel: true,
        duration: 15,
      },
      {
        id: 'analytics-api',
        title: 'Analytics API',
        status: 'not_run',
        dependencies: ['auth'],
        runInParallel: true,
        duration: 10,
      }
    ]
  }
] 