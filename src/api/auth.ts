import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider?: 'email' | 'github' | 'google'
}

export interface AuthResponse {
  token: string
  user: User
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    })
    return response.data
  },

  signup: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
      name,
      email,
      password
    })
    return response.data
  },

  getCurrentUser: async (token: string): Promise<User> => {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data.user
  },

  // Social auth methods
  getGithubAuthUrl: () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const redirectUri = `${window.location.origin}/api/auth/github/callback`
    const scope = 'read:user user:email'
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
  },

  getGoogleAuthUrl: () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const redirectUri = `${window.location.origin}/api/auth/google/callback`
    const scope = 'profile email'
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`
  },

  handleSocialAuth: async (provider: 'github' | 'google', code: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/${provider}/callback`, { code })
    return response.data
  }
} 