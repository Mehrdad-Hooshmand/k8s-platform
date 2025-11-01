import api from './api'
import type { Application, AppCategory, APIResponse } from '@/types'

export const appService = {
  // List all applications
  list: async (): Promise<Application[]> => {
    const response = await api.get<APIResponse<Application[]>>('/api/v1/applications')
    return response.data.data || []
  },

  // Get application by ID
  get: async (id: number): Promise<Application> => {
    const response = await api.get<APIResponse<Application>>(`/api/v1/applications/${id}`)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Application not found')
  },

  // Get categories
  getCategories: async (): Promise<AppCategory[]> => {
    const response = await api.get<APIResponse<AppCategory[]>>('/api/v1/applications/categories')
    return response.data.data || []
  },

  // Filter by category
  filterByCategory: async (category: string): Promise<Application[]> => {
    const apps = await appService.list()
    return apps.filter(app => app.category === category)
  },

  // Search applications
  search: async (query: string): Promise<Application[]> => {
    const apps = await appService.list()
    const lowerQuery = query.toLowerCase()
    return apps.filter(app => 
      app.display_name.toLowerCase().includes(lowerQuery) ||
      app.description.toLowerCase().includes(lowerQuery) ||
      app.category.toLowerCase().includes(lowerQuery)
    )
  },
}

export default appService
