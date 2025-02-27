'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider, extendTheme, type ThemeConfig } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  colors: {
    primary: {
      50: '#f0f7ff',
      100: '#e0f0ff',
      200: '#b9e1ff',
      300: '#7cc5ff',
      400: '#38a8ff',
      500: '#0090ff',
      600: '#0070e0',
      700: '#0057b3',
      800: '#004593',
      900: '#003978',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  fonts: {
    body: 'Inter, -apple-system, system-ui, sans-serif',
    heading: 'Inter, -apple-system, system-ui, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'primary.500',
          color: 'white',
          _hover: {
            bg: 'primary.600',
            _disabled: {
              bg: 'primary.500',
            },
          },
          _active: {
            bg: 'primary.700',
          },
        },
        ghost: {
          color: 'gray.600',
          _hover: {
            bg: 'gray.50',
          },
          _active: {
            bg: 'gray.100',
          },
        },
        outline: {
          color: 'gray.600',
          borderColor: 'gray.200',
          _hover: {
            bg: 'gray.50',
          },
          _active: {
            bg: 'gray.100',
          },
        },
      },
      sizes: {
        sm: {
          fontSize: 'sm',
          px: '3',
          py: '2',
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: 'md',
            borderColor: 'gray.200',
            _hover: {
              borderColor: 'gray.300',
            },
            _focus: {
              borderColor: 'primary.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
            },
          },
        },
      },
      sizes: {
        sm: {
          field: {
            borderRadius: 'md',
            fontSize: 'sm',
            height: '9',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'lg',
          boxShadow: 'sm',
          p: 6,
        },
      },
    },
    Heading: {
      baseStyle: {
        color: 'gray.900',
      },
    },
  },
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }))

  return (
    <CacheProvider>
      <ChakraProvider theme={theme} resetCSS>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ChakraProvider>
    </CacheProvider>
  )
} 