import api from './api'
import type { 
  Cluster, 
  CreateClusterRequest, 
  ClusterStatus, 
  APIResponse 
} from '@/types'

export const clusterService = {
  // List clusters
  list: async (): Promise<Cluster[]> => {
    const response = await api.get<APIResponse<Cluster[]>>('/api/v1/clusters')
    return response.data.data || []
  },

  // Get cluster by ID
  get: async (id: number): Promise<Cluster> => {
    const response = await api.get<APIResponse<Cluster>>(`/api/v1/clusters/${id}`)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Cluster not found')
  },

  // Create cluster
  create: async (data: CreateClusterRequest): Promise<Cluster> => {
    const response = await api.post<APIResponse<Cluster>>('/api/v1/clusters', data)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to create cluster')
  },

  // Update cluster
  update: async (id: number, data: Partial<CreateClusterRequest>): Promise<Cluster> => {
    const response = await api.put<APIResponse<Cluster>>(`/api/v1/clusters/${id}`, data)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to update cluster')
  },

  // Delete cluster
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/clusters/${id}`)
  },

  // Get cluster status
  getStatus: async (id: number): Promise<ClusterStatus> => {
    const response = await api.get<APIResponse<ClusterStatus>>(`/api/v1/clusters/${id}/status`)
    
    if (response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.error || 'Failed to get cluster status')
  },

  // Get kubeconfig
  getKubeconfig: async (id: number): Promise<string> => {
    const response = await api.get<APIResponse<{ kubeconfig: string }>>(`/api/v1/clusters/${id}/kubeconfig`)
    
    if (response.data.data) {
      return response.data.data.kubeconfig
    }
    
    throw new Error(response.data.error || 'Failed to get kubeconfig')
  },
}

export default clusterService
