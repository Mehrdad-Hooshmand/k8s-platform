import api from './api'
import type { LoginRequest, LoginResponse, RegisterRequest, User, APIResponse } from '@/types'

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<APIResponse<LoginResponse>>('/api/v1/auth/login', credentials)
    
    if (response.data.data) {
      const { access_token, refresh_token, user } = response.data.data
      localStorage.setItem('accessToken', access_token)
      localStorage.setItem('refreshToken', refresh_token)
      localStorage.setItem('user', JSON.stringify(user))
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Login failed')
  },

  // Register
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post<APIResponse<LoginResponse>>('/api/v1/auth/register', data)
    
    if (response.data.data) {
      const { access_token, refresh_token, user } = response.data.data
      localStorage.setItem('accessToken', access_token)
      localStorage.setItem('refreshToken', refresh_token)
      localStorage.setItem('user', JSON.stringify(user))
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Registration failed')
  },

  // Logout
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<APIResponse<User>>('/api/v1/users/me')
    
    if (response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data))
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to get user')
  },

  // Get stored user
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Check if authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken')
  },
}

export default authService
