import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Boxes, Plus, Info } from 'lucide-react'
import { clusterService } from '@/services/clusters'
import { deploymentService } from '@/services/deployments'
import DeploymentDetails from '@/components/DeploymentDetails'
import type { Deployment } from '@/types'

export default function Deployments() {
  const queryClient = useQueryClient()
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)

  // Fetch clusters
  const { data: clusters = [] } = useQuery({
    queryKey: ['clusters'],
    queryFn: () => clusterService.list(),
  })

  // Select first cluster by default
  const clusterId = selectedCluster || clusters[0]?.id

  // Fetch deployments
  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ['deployments', clusterId],
    queryFn: () => deploymentService.list(clusterId!),
    enabled: !!clusterId,
  })

  const handleViewDetails = (deployment: Deployment) => {
    setSelectedDeployment(deployment)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deployments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deployments</h1>
          <p className="text-gray-600 mt-1">Manage your deployed applications</p>
        </div>
        <a
          href="/apps"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Deploy App
        </a>
      </div>

      {/* Cluster Selector */}
      {clusters.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Cluster
          </label>
          <select
            value={selectedCluster || ''}
            onChange={(e) => setSelectedCluster(Number(e.target.value))}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {clusters.map((cluster) => (
              <option key={cluster.id} value={cluster.id}>
                {cluster.name} ({cluster.master_ip})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Deployments List */}
      {deployments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Boxes className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deployments yet</h3>
          <p className="text-gray-600 mb-6">Start by deploying an application from the marketplace</p>
          <a
            href="/apps"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Browse Apps
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {deployments.map((deployment) => (
            <div key={deployment.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                {/* Deployment Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{deployment.name}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      deployment.status === 'running' ? 'bg-green-100 text-green-700' :
                      deployment.status === 'deploying' ? 'bg-yellow-100 text-yellow-700' :
                      deployment.status === 'stopped' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {deployment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Namespace:</span>
                      <span className="ml-2 font-medium text-gray-900">{deployment.namespace}</span>
                    </div>
                    {deployment.domain && (
                      <div>
                        <span className="text-gray-600">Domain:</span>
                        <span className="ml-2 font-medium text-gray-900">{deployment.domain}</span>
                      </div>
                    )}
                  </div>

                  {deployment.url && (
                    <p className="mt-3 text-sm text-gray-500">
                      🌐 {deployment.url}
                    </p>
                  )}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => handleViewDetails(deployment)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Info className="w-4 h-4" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deployment Details Modal */}
      {selectedDeployment && clusterId && (
        <DeploymentDetails
          deployment={selectedDeployment}
          clusterId={clusterId}
          onClose={() => setSelectedDeployment(null)}
        />
      )}
    </div>
  )
}
