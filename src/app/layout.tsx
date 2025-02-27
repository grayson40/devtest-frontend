import React from 'react'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Box } from '@chakra-ui/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DevTest - Test Management',
  description: 'Developer-focused test management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Box minH="100vh" bg="gray.50">
            {children}
          </Box>
        </Providers>
      </body>
    </html>
  )
}
