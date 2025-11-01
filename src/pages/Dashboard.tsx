import { useQuery } from '@tanstack/react-query'
import { Server, Network, Boxes, Package, Activity } from 'lucide-react'
import { clusterService } from '@/services/clusters'
import { deploymentService } from '@/services/deployments'
import { appService } from '@/services/apps'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  // Fetch clusters
  const { data: clusters = [], isLoading: clustersLoading } = useQuery({
    queryKey: ['clusters'],
    queryFn: () => clusterService.list(),
  })

  // Fetch apps
  const { data: apps = [] } = useQuery({
    queryKey: ['apps'],
    queryFn: () => appService.list(),
  })

  // Fetch deployments for first cluster
  const firstCluster = clusters[0]
  const { data: deployments = [] } = useQuery({
    queryKey: ['deployments', firstCluster?.id],
    queryFn: () => deploymentService.list(firstCluster!.id),
    enabled: !!firstCluster,
  })

  // Mock metrics data
  const metricsData = [
    { time: '00:00', cpu: 45, memory: 62, disk: 38 },
    { time: '04:00', cpu: 38, memory: 58, disk: 39 },
    { time: '08:00', cpu: 62, memory: 71, disk: 40 },
    { time: '12:00', cpu: 78, memory: 85, disk: 42 },
    { time: '16:00', cpu: 65, memory: 73, disk: 41 },
    { time: '20:00', cpu: 52, memory: 66, disk: 40 },
  ]

  const stats = [
    {
      name: 'Clusters',
      value: clusters.length,
      icon: Server,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Nodes',
      value: clusters.reduce((sum, c) => sum + (c.status === 'active' ? 1 : 0), 0),
      icon: Network,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Deployments',
      value: deployments.length,
      icon: Boxes,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Apps Available',
      value: apps.length,
      icon: Package,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  if (clustersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your Kubernetes infrastructure</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Usage Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Resource Usage</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} name="CPU %" />
              <Line type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} name="Memory %" />
              <Line type="monotone" dataKey="disk" stroke="#10b981" strokeWidth={2} name="Disk %" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">CPU</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Memory</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Disk</span>
            </div>
          </div>
        </div>

        {/* Cluster Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Clusters</h2>
            <Server className="w-5 h-5 text-gray-400" />
          </div>
          {clusters.length === 0 ? (
            <div className="text-center py-12">
              <Server className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No clusters yet</p>
              <a
                href="/clusters"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Cluster
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {clusters.map((cluster) => (
                <div key={cluster.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      cluster.status === 'active' ? 'bg-green-500' :
                      cluster.status === 'installing' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{cluster.name}</p>
                      <p className="text-sm text-gray-500">{cluster.master_ip}</p>
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Deployments */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Deployments</h2>
          <Boxes className="w-5 h-5 text-gray-400" />
        </div>
        {deployments.length === 0 ? (
          <div className="text-center py-12">
            <Boxes className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No deployments yet</p>
            <a
              href="/apps"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Apps
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-sm font-medium text-gray-600">Name</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Namespace</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">URL</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {deployments.slice(0, 5).map((deployment) => (
                  <tr key={deployment.id}>
                    <td className="py-3 text-sm font-medium text-gray-900">{deployment.name}</td>
                    <td className="py-3 text-sm text-gray-600">{deployment.namespace}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        deployment.status === 'running' ? 'bg-green-100 text-green-700' :
                        deployment.status === 'deploying' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {deployment.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {deployment.url ? (
                        <a
                          href={deployment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {deployment.url}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
