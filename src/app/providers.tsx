'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider, extendTheme, type ThemeConfig } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

// Define the blue-purple gradient theme
const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'gray.100',
      },
    },
  },
  colors: {
    primary: {
      50: '#eef4ff',
      100: '#d9e5ff',
      200: '#b8c7ff',
      300: '#96a8ff',
      400: '#7889ff',
      500: '#5a6af9',
      600: '#4a4eef',
      700: '#3f3dd0',
      800: '#3333a6',
      900: '#2c2e83',
    },
    secondary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
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
          bg: 'blue.500',
          color: 'white',
          _hover: {
            bg: 'blue.600',
            _disabled: {
              bg: 'blue.500',
            },
          },
          _active: {
            bg: 'blue.700',
          },
        },
        gradient: {
          bgGradient: 'linear(to-r, blue.400, purple.500)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, blue.500, purple.600)',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            bgGradient: 'linear(to-r, blue.600, purple.700)',
            transform: 'translateY(0)',
          },
        },
        ghost: {
          color: 'gray.300',
          _hover: {
            bg: 'whiteAlpha.200',
          },
          _active: {
            bg: 'whiteAlpha.300',
          },
        },
        outline: {
          color: 'gray.300',
          borderColor: 'gray.600',
          _hover: {
            bg: 'whiteAlpha.100',
          },
          _active: {
            bg: 'whiteAlpha.200',
          },
        },
      },
      defaultProps: {
        variant: 'solid',
        colorScheme: 'blue',
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: 'md',
            borderColor: 'gray.600',
            bg: 'gray.700',
            color: 'white',
            _hover: {
              borderColor: 'gray.500',
            },
            _focus: {
              borderColor: 'primary.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)',
            },
            _placeholder: {
              color: 'gray.400',
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
      defaultProps: {
        variant: 'outline',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'md',
          overflow: 'hidden',
          bg: 'gray.800',
          borderColor: 'gray.700',
        },
      },
      variants: {
        elevated: {
          container: {
            bg: 'gray.800',
            boxShadow: 'lg',
            _hover: {
              transform: 'translateY(-2px)',
              boxShadow: 'xl',
              transition: 'all 0.2s',
            },
          },
        },
        gradient: {
          container: {
            position: 'relative',
            bg: 'gray.800',
            color: 'white',
            borderRadius: 'xl',
            overflow: 'hidden',
            _before: {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 'xl',
              background: 'linear-gradient(45deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)',
              pointerEvents: 'none',
            },
          },
        },
        solid: {
          container: {
            bg: 'gray.800',
            borderColor: 'gray.700',
            borderWidth: '1px',
          }
        }
      },
      defaultProps: {
        variant: 'solid',
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '600',
        color: 'white',
      },
      variants: {
        gradient: {
          bgGradient: 'linear(to-r, blue.400, purple.500)',
          bgClip: 'text',
          fontWeight: 'bold',
          letterSpacing: '-0.02em',
        },
        default: {
          color: 'white',
          letterSpacing: '-0.02em',
        },
      },
      defaultProps: {
        variant: 'default',
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        textTransform: 'none',
        fontWeight: 'medium',
      },
      variants: {
        gradient: {
          bgGradient: 'linear(to-r, blue.400, purple.400)',
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: 'full',
          textTransform: 'none',
        },
        solid: {
          bg: 'blue.500',
          color: 'white',
        },
        subtle: {
          bg: 'whiteAlpha.200',
          color: 'gray.100',
        },
        outline: {
          borderColor: 'gray.600',
          color: 'gray.300',
        },
      },
      defaultProps: {
        variant: 'subtle',
      },
    },
    Progress: {
      baseStyle: {
        track: {
          bg: 'gray.700',
        },
      },
      variants: {
        gradient: {
          filledTrack: {
            bgGradient: 'linear(to-r, blue.400, purple.500)',
          },
        },
        solid: {
          filledTrack: {
            bg: 'blue.500',
          },
        },
      },
      defaultProps: {
        colorScheme: 'blue',
        size: 'md',
        variant: 'solid',
      },
    },
    Tabs: {
      variants: {
        'soft-rounded': {
          tab: {
            borderRadius: 'full',
            fontWeight: 'medium',
            color: 'gray.400',
            _selected: {
              color: 'white',
              bg: 'blue.500',
            },
            _hover: {
              bg: 'whiteAlpha.100',
            },
          },
        },
        line: {
          tablist: {
            borderColor: 'gray.700',
          },
          tab: {
            color: 'gray.400',
            _selected: {
              color: 'blue.400',
              borderColor: 'blue.400',
            },
            _hover: {
              color: 'gray.200',
            },
          },
        },
      },
      defaultProps: {
        colorScheme: 'blue',
        variant: 'line',
      },
    },
  },
  shadows: {
    xs: '0 0 0 1px rgba(255, 255, 255, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    gradient: '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(147, 51, 234, 0.2)',
  },
  layerStyles: {
    gradientBg: {
      bgGradient: 'linear(165deg, blue.900, purple.900)',
      color: 'white',
    },
    card: {
      bg: 'gray.800',
      borderRadius: 'lg',
      boxShadow: 'md',
      p: 6,
      borderColor: 'gray.700',
      borderWidth: '1px',
    },
    gradientCard: {
      bg: 'gray.800',
      borderRadius: 'xl',
      boxShadow: 'xl',
      p: 6,
      position: 'relative',
      _before: {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 'xl',
        background: 'linear-gradient(45deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)',
        pointerEvents: 'none',
      },
    },
    darkSection: {
      bg: 'gray.900',
      borderRadius: 'lg',
      p: 6,
      boxShadow: 'md',
    },
    subtleAccent: {
      bg: 'whiteAlpha.100',
      borderRadius: 'md',
      p: 4,
    },
    adminPanel: {
      bg: 'gray.800',
      borderRadius: 'lg',
      p: 6,
      borderColor: 'gray.700',
      borderWidth: '1px',
      boxShadow: 'md',
    },
  },
  textStyles: {
    gradient: {
      bgGradient: 'linear(to-r, blue.400, purple.500)',
      bgClip: 'text',
      fontWeight: 'bold',
    },
    heading: {
      color: 'white',
      fontWeight: 'bold',
      letterSpacing: '-0.02em',
    },
    subheading: {
      color: 'gray.300',
      fontWeight: 'medium',
    },
    body: {
      color: 'gray.300',
    },
    muted: {
      color: 'gray.500',
      fontSize: 'sm',
    },
    accent: {
      color: 'blue.400',
      fontWeight: 'medium',
    },
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