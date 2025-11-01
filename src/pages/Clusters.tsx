import { useQuery } from '@tanstack/react-query'
import { Server } from 'lucide-react'
import { clusterService } from '@/services/clusters'

export default function Clusters() {
  const { data: clusters = [], isLoading } = useQuery({
    queryKey: ['clusters'],
    queryFn: () => clusterService.list(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clusters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clusters</h1>
        <p className="text-gray-600 mt-1">Manage your Kubernetes clusters</p>
      </div>

      {clusters.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clusters yet</h3>
          <p className="text-gray-600">Clusters will appear here after installation</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {clusters.map((cluster) => (
            <div key={cluster.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{cluster.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Master IP:</span>
                      <span className="ml-2 font-medium text-gray-900">{cluster.master_ip}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Registry:</span>
                      <span className="ml-2 font-medium text-gray-900">{cluster.registry_location}</span>
                    </div>
                    {cluster.ssl_enabled && (
                      <div>
                        <span className="text-gray-600">SSL:</span>
                        <span className="ml-2 font-medium text-green-600">Enabled</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  cluster.status === 'active' ? 'bg-green-100 text-green-700' :
                  cluster.status === 'installing' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {cluster.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
