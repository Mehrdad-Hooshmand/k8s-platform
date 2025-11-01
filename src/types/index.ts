// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// User & Auth Types
export interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'user'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

// Cluster Types
export interface Cluster {
  id: number
  user_id: number
  name: string
  master_ip: string
  master_ssh_port: number
  master_ssh_user: string
  k3s_token: string
  registry_location: string
  registry_mirror: string
  ssl_enabled: boolean
  ssl_email: string
  status: 'installing' | 'active' | 'error' | 'offline'
  created_at: string
  updated_at: string
}

export interface CreateClusterRequest {
  name: string
  master_ip: string
  master_ssh_port: number
  master_ssh_user: string
  master_ssh_password: string
  registry_location: string
  registry_mirror?: string
  ssl_enabled: boolean
  ssl_email?: string
}

export interface ClusterStatus {
  status: string
  nodes_count: number
  pods_count: number
  services_count: number
  namespaces_count: number
  version: string
}

// Node Types
export interface Node {
  id: number
  cluster_id: number
  name: string
  ip: string
  ssh_port: number
  ssh_user: string
  role: 'master' | 'worker'
  status: 'installing' | 'active' | 'error' | 'offline'
  resources: NodeResources
  created_at: string
  updated_at: string
}

export interface NodeResources {
  cpu_cores?: number
  memory_mb?: number
  disk_gb?: number
  cpu_usage?: number
  memory_usage?: number
  disk_usage?: number
}

export interface AddNodeRequest {
  ip: string
  ssh_port: number
  ssh_user: string
  ssh_password: string
}

export interface NodeStatus {
  status: string
  conditions: any[]
  addresses: any[]
  capacity: {
    cpu: string
    memory: string
    pods: string
  }
  allocatable: {
    cpu: string
    memory: string
    pods: string
  }
}

// Application Types
export interface Application {
  id: number
  name: string
  display_name: string
  description: string
  category: string
  icon: string
  version: string
  template_id: number
  config_schema: any
  created_at: string
  updated_at: string
}

export interface AppCategory {
  name: string
  display_name: string
  icon: string
  count: number
}

// Deployment Types
export interface Deployment {
  id: number
  cluster_id: number
  application_id: number
  name: string
  namespace: string
  domain?: string
  enable_ssl: boolean
  config: any
  credentials: any
  resources: DeploymentResources
  status: 'deploying' | 'running' | 'error' | 'stopped'
  url?: string
  created_at: string
  updated_at: string
}

export interface DeploymentResources {
  cpu_limit?: string
  memory_limit?: string
  storage?: string
}

export interface DeployRequest {
  application_id: number
  name: string
  namespace?: string
  domain?: string
  enable_ssl?: boolean
  config?: any
  resources?: DeploymentResources
}

export interface DeploymentStatus {
  status: string
  replicas: number
  ready_replicas: number
  conditions: any[]
  pods: any[]
}

// Chart Data Types (for Dashboard)
export interface ResourceMetrics {
  timestamp: string
  cpu: number
  memory: number
  disk: number
}

export interface DashboardStats {
  clusters_count: number
  nodes_count: number
  deployments_count: number
  apps_count: number
}
