import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, authApi } from '@/api/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for saved token on mount
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      setToken(savedToken)
      authApi.getCurrentUser(savedToken)
        .then(user => setUser(user))
        .catch(() => {
          localStorage.removeItem('auth_token')
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('auth_token', response.token)
  }

  const signup = async (name: string, email: string, password: string) => {
    const response = await authApi.signup(name, email, password)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('auth_token', response.token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 