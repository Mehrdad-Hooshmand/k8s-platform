import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Package, Filter, Download } from 'lucide-react'
import { appService } from '@/services/apps'


export default function Apps() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Fetch apps
  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['apps'],
    queryFn: () => appService.list(),
  })

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => appService.getCategories(),
  })

  // Filter apps
  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      web: '🌐',
      database: '🗄️',
      monitoring: '📊',
      devops: '🔧',
      storage: '💾',
      networking: '🌐',
      security: '🔒',
      ai: '🤖',
    }
    return icons[category] || '📦'
  }

  // Get app icon
  const getAppIcon = (appName: string) => {
    const icons: Record<string, string> = {
      wordpress: '📝',
      mysql: '🐬',
      postgresql: '🐘',
      redis: '⚡',
      mongodb: '🍃',
      nextcloud: '☁️',
      gitea: '🦊',
      grafana: '📊',
      prometheus: '🔥',
      nginx: '🚀',
    }
    return icons[appName.toLowerCase()] || '📦'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">App Marketplace</h1>
          <p className="text-gray-600 mt-1">Deploy applications with one click</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{filteredApps.length} apps available</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.display_name} ({cat.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No apps found</h3>
          <p className="text-gray-600">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6 flex flex-col"
            >
              {/* App Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">{getAppIcon(app.name)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.display_name}</h3>
                    <p className="text-sm text-gray-500">v{app.version}</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                  {getCategoryIcon(app.category)} {app.category}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 flex-1">
                {app.description}
              </p>

              {/* Deploy Button */}
              <button
                onClick={() => window.location.href = `/deployments?deploy=${app.id}`}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Deploy Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
