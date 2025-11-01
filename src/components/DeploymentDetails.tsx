import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ExternalLink, 
  Copy, 
  Eye, 
  EyeOff, 
  RotateCw, 
  Square,
  Play,
  Trash2,
  CheckCircle2,
  Database,
  Server
} from 'lucide-react'
import { deploymentService } from '@/services/deployments'
import { openExternal, copyToClipboard, showNotification, showDeleteDialog } from '@/lib/electron'
import type { Deployment } from '@/types'

interface DeploymentDetailsProps {
  deployment: Deployment
  clusterId: number
  onClose: () => void
}

// App metadata (credentials, installation type, etc.)
const appMetadata: Record<string, {
  hasAutoCredentials: boolean
  needsSetup: boolean
  defaultUsername?: string
  features?: string[]
}> = {
  'webtop': {
    hasAutoCredentials: true,
    needsSetup: false,
    defaultUsername: 'admin',
    features: ['Full Linux Desktop', 'Firefox, LibreOffice, VLC', 'File Manager & Terminal']
  },
  'wordpress': {
    hasAutoCredentials: false,
    needsSetup: true,
    features: ['Complete CMS', 'MySQL Database', 'Auto-updates']
  },
  'nextcloud': {
    hasAutoCredentials: true,
    needsSetup: false,
    defaultUsername: 'admin',
    features: ['File Storage & Sync', 'Office Apps', 'Calendar & Contacts']
  },
  'uptime-kuma': {
    hasAutoCredentials: true,
    needsSetup: false,
    defaultUsername: 'admin',
    features: ['Monitor Services', 'Status Page', 'Notifications']
  },
  'gitea': {
    hasAutoCredentials: true,
    needsSetup: false,
    defaultUsername: 'admin',
    features: ['Git Hosting', 'Pull Requests', 'CI/CD Integration']
  },
}

export default function DeploymentDetails({ deployment, clusterId, onClose }: DeploymentDetailsProps) {
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const [showDbPassword, setShowDbPassword] = useState(false)

  // Get app metadata
  const appName = deployment.application_id?.toString().toLowerCase() || ''
  const metadata = appMetadata[appName] || { hasAutoCredentials: false, needsSetup: false }

  // Mock credentials (in real app, these come from deployment.credentials)
  const credentials = deployment.credentials || {
    username: metadata.defaultUsername || 'admin',
    password: 'auto_generated_' + Math.random().toString(36).substring(7),
    db_host: 'mysql-service',
    db_name: deployment.name,
    db_user: deployment.name,
    db_password: 'db_' + Math.random().toString(36).substring(7)
  }

  // Restart mutation
  const restartMutation = useMutation({
    mutationFn: () => deploymentService.restart(clusterId, deployment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
      showNotification('Service Restarted', `${deployment.name} has been restarted successfully`)
    },
  })

  // Stop mutation (mock - not in API yet)
  const stopMutation = useMutation({
    mutationFn: async () => {
      // TODO: Add stop endpoint to API
      await new Promise(resolve => setTimeout(resolve, 1000))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
      showNotification('Service Stopped', `${deployment.name} has been stopped`)
    },
  })

  // Start mutation (mock - not in API yet)
  const startMutation = useMutation({
    mutationFn: async () => {
      // TODO: Add start endpoint to API
      await new Promise(resolve => setTimeout(resolve, 1000))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
      showNotification('Service Started', `${deployment.name} has been started`)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deploymentService.delete(clusterId, deployment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
      showNotification('Service Deleted', `${deployment.name} has been permanently deleted`)
      onClose()
    },
  })

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      showNotification('Copied!', `${label} copied to clipboard`)
    }
  }

  const handleOpenUrl = () => {
    if (deployment.url) {
      openExternal(deployment.url)
    }
  }

  const handleDelete = async () => {
    const confirmed = await showDeleteDialog(deployment.name)
    if (confirmed) {
      deleteMutation.mutate()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{deployment.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Service Details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                deployment.status === 'running' ? 'bg-green-500' :
                deployment.status === 'deploying' ? 'bg-yellow-500 animate-pulse' :
                deployment.status === 'stopped' ? 'bg-gray-500' :
                'bg-red-500'
              }`} />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-gray-900 capitalize">{deployment.status}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Namespace</p>
              <p className="font-medium text-gray-900">{deployment.namespace}</p>
            </div>
          </div>

          {/* URL */}
          {deployment.url && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">🌐 Access URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={deployment.url}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
                />
                <button
                  onClick={() => handleCopy(deployment.url!, 'URL')}
                  className="p-3 text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-300 transition-colors"
                  title="Copy URL"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  onClick={handleOpenUrl}
                  className="p-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  title="Open in Browser"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Credentials - Auto */}
          {metadata.hasAutoCredentials && !metadata.needsSetup && (
            <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Login Credentials</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">👤 Username</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={credentials.username}
                      readOnly
                      className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg font-mono text-sm"
                    />
                    <button
                      onClick={() => handleCopy(credentials.username, 'Username')}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🔑 Password</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      readOnly
                      className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg font-mono text-sm"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopy(credentials.password, 'Password')}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manual Setup Required */}
          {metadata.needsSetup && (
            <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900">Setup Required</h3>
              </div>
              
              <p className="text-sm text-gray-700">
                Please visit the URL above to complete the installation:
              </p>
              
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Choose your preferred language</li>
                <li>Set admin username & password</li>
                <li>Complete the setup wizard</li>
              </ol>

              {credentials.db_host && (
                <div className="mt-4 pt-4 border-t border-yellow-300">
                  <div className="flex items-center space-x-2 mb-3">
                    <Database className="w-4 h-4 text-yellow-700" />
                    <h4 className="font-medium text-gray-900 text-sm">Database Info (if needed)</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Host:</span>
                      <span className="ml-2 font-mono text-gray-900">{credentials.db_host}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Database:</span>
                      <span className="ml-2 font-mono text-gray-900">{credentials.db_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">User:</span>
                      <span className="ml-2 font-mono text-gray-900">{credentials.db_user}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Password:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type={showDbPassword ? 'text' : 'password'}
                          value={credentials.db_password}
                          readOnly
                          className="flex-1 px-3 py-1 bg-white border border-yellow-300 rounded font-mono text-xs"
                        />
                        <button
                          onClick={() => setShowDbPassword(!showDbPassword)}
                          className="p-1 text-yellow-700 hover:bg-yellow-100 rounded"
                        >
                          {showDbPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(
                      `Host: ${credentials.db_host}\nDatabase: ${credentials.db_name}\nUser: ${credentials.db_user}\nPassword: ${credentials.db_password}`,
                      'Database credentials'
                    )}
                    className="mt-3 w-full px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium transition-colors"
                  >
                    📋 Copy All Database Info
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Resources */}
          {deployment.resources && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">💾 Resources</h3>
              <div className="grid grid-cols-2 gap-4">
                {deployment.resources.cpu_limit && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">CPU Limit</p>
                    <p className="text-lg font-semibold text-gray-900">{deployment.resources.cpu_limit}</p>
                  </div>
                )}
                {deployment.resources.memory_limit && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Memory Limit</p>
                    <p className="text-lg font-semibold text-gray-900">{deployment.resources.memory_limit}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {metadata.features && metadata.features.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">✨ Features</h3>
              <ul className="space-y-1">
                {metadata.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h3 className="font-semibold text-gray-900">⚙️ Actions</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => restartMutation.mutate()}
                disabled={restartMutation.isPending || deployment.status !== 'running'}
                className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCw className={`w-4 h-4 mr-2 ${restartMutation.isPending ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Restart</span>
              </button>

              {deployment.status === 'running' ? (
                <button
                  onClick={() => stopMutation.mutate()}
                  disabled={stopMutation.isPending}
                  className="flex items-center justify-center px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 disabled:opacity-50 transition-colors"
                >
                  <Square className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Stop</span>
                </button>
              ) : (
                <button
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                  className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors"
                >
                  <Play className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Start</span>
                </button>
              )}

              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center justify-center px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
