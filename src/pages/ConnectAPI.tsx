import { useState } from 'react'
import { Link2, AlertCircle, Loader2 } from 'lucide-react'
import { updateApiUrl } from '@/services/api'
import api from '@/services/api'

interface ConnectAPIProps {
  onConnect: (url: string) => void
}

export default function ConnectAPI({ onConnect }: ConnectAPIProps) {
  const [apiUrl, setApiUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate URL format
      let url = apiUrl.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }

      // Test connection
      const tempApi = api
      tempApi.defaults.baseURL = url
      
      await tempApi.get('/health', { timeout: 5000 })

      // Connection successful
      updateApiUrl(url)
      onConnect(url)
    } catch (err: any) {
      console.error('Connection error:', err)
      setError(
        err.code === 'ECONNABORTED'
          ? 'Connection timeout. Please check the URL and try again.'
          : err.response?.status === 404
          ? 'API endpoint not found. Make sure the backend is running.'
          : 'Failed to connect to the API. Please check the URL and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Link2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connect to API
          </h1>
          <p className="text-gray-600">
            Enter your Kubernetes cluster's API URL to get started
          </p>
        </div>

        {/* Connection form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleConnect} className="space-y-6">
            <div>
              <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-2">
                API URL
              </label>
              <input
                id="apiUrl"
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.your-cluster.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
              <p className="mt-2 text-xs text-gray-500">
                This is the URL you received when installing the cluster
              </p>
            </div>

            {error && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !apiUrl}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link2 className="w-5 h-5 mr-2" />
                  Connect
                </>
              )}
            </button>
          </form>

          {/* Help section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              <strong>Don't have a cluster yet?</strong>
            </p>
            <a
              href="https://github.com/Mehrdad-Hooshmand/k8s-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Learn how to install Kubernetes Platform →
            </a>
          </div>
        </div>

        {/* Example */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Example: https://api.my-cluster.example.com
          </p>
        </div>
      </div>
    </div>
  )
}
