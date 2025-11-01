import { Network } from 'lucide-react'

export default function Nodes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nodes</h1>
        <p className="text-gray-600 mt-1">Manage your cluster nodes</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nodes Management</h3>
        <p className="text-gray-600">Node management features coming soon</p>
      </div>
    </div>
  )
}
