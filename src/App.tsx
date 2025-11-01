import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ConnectAPI from './pages/ConnectAPI'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Apps from './pages/Apps'
import Deployments from './pages/Deployments'
import Clusters from './pages/Clusters'
import Nodes from './pages/Nodes'
import Settings from './pages/Settings'
import Layout from './components/Layout'

function App() {
  const [apiUrl, setApiUrl] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if API URL is set
    const storedApiUrl = localStorage.getItem('apiUrl')
    if (storedApiUrl) {
      setApiUrl(storedApiUrl)
    }

    // Check if user is authenticated
    const token = localStorage.getItem('accessToken')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  // If no API URL, show connect page
  if (!apiUrl) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<ConnectAPI onConnect={setApiUrl} />} />
        </Routes>
      </Router>
    )
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    )
  }

  // Authenticated routes
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout onLogout={() => setIsAuthenticated(false)} />}>
          <Route index element={<Dashboard />} />
          <Route path="clusters" element={<Clusters />} />
          <Route path="nodes" element={<Nodes />} />
          <Route path="apps" element={<Apps />} />
          <Route path="deployments" element={<Deployments />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
