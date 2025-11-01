import api from './api'
import type { 
  Deployment, 
  DeployRequest, 
  DeploymentStatus, 
  APIResponse 
} from '@/types'

export const deploymentService = {
  // List deployments for a cluster
  list: async (clusterId: number): Promise<Deployment[]> => {
    const response = await api.get<APIResponse<Deployment[]>>(`/api/v1/clusters/${clusterId}/deployments`)
    return response.data.data || []
  },

  // Get deployment by ID
  get: async (clusterId: number, id: number): Promise<Deployment> => {
    const response = await api.get<APIResponse<Deployment>>(`/api/v1/clusters/${clusterId}/deployments/${id}`)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Deployment not found')
  },

  // Deploy application
  deploy: async (clusterId: number, data: DeployRequest): Promise<Deployment> => {
    const response = await api.post<APIResponse<Deployment>>(`/api/v1/clusters/${clusterId}/deployments`, data)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to deploy application')
  },

  // Update deployment
  update: async (clusterId: number, id: number, data: Partial<DeployRequest>): Promise<Deployment> => {
    const response = await api.put<APIResponse<Deployment>>(`/api/v1/clusters/${clusterId}/deployments/${id}`, data)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to update deployment')
  },

  // Delete deployment
  delete: async (clusterId: number, id: number): Promise<void> => {
    await api.delete(`/api/v1/clusters/${clusterId}/deployments/${id}`)
  },

  // Get deployment status
  getStatus: async (clusterId: number, id: number): Promise<DeploymentStatus> => {
    const response = await api.get<APIResponse<DeploymentStatus>>(`/api/v1/clusters/${clusterId}/deployments/${id}/status`)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to get deployment status')
  },

  // Get deployment logs
  getLogs: async (clusterId: number, id: number, tailLines: number = 100): Promise<string> => {
    const response = await api.get<APIResponse<{ logs: string }>>(`/api/v1/clusters/${clusterId}/deployments/${id}/logs`, {
      params: { tail: tailLines }
    })
    
    if (response.data.data) {
      return response.data.data.logs
    }
    
    throw new Error(response.data.error || 'Failed to get logs')
  },

  // Restart deployment
  restart: async (clusterId: number, id: number): Promise<void> => {
    await api.post(`/api/v1/clusters/${clusterId}/deployments/${id}/restart`)
  },
}

export default deploymentService
