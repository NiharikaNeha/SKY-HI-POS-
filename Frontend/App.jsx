import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { RestaurantProvider } from './context/RestaurantContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import AdminDashboard from './components/admin/AdminDashboard'

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')
  
  if (!token || !savedUser) {
    return <Navigate to="/login" replace />
  }

  try {
    const userData = JSON.parse(savedUser)
    if (requireAdmin && userData.role !== 'admin') {
      return <Navigate to="/dashboard" replace />
    }
    return children
  } catch (error) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return <Navigate to="/login" replace />
  }
}

// Login wrapper component
const LoginWrapper = ({ onLogin }) => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  
  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          if (userData.role === 'admin') {
            navigate('/admin', { replace: true })
          } else {
            navigate('/dashboard', { replace: true })
          }
        } catch (error) {
          // Invalid user data, stay on login
        }
      }
    }
  }, [token, navigate])

  const handleLogin = (userData, admin = false) => {
    onLogin(userData, admin)
    if (userData.role === 'admin' || admin) {
      navigate('/admin', { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return <Login onLogin={handleLogin} />
}

const App = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get user data from localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <RestaurantProvider>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={<LoginWrapper onLogin={handleLogin} />} 
          />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard 
                  username={user?.name || user?.email} 
                  onLogout={handleLogout} 
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard 
                  username={user?.name || user?.email} 
                  onLogout={handleLogout} 
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
      </Router>
    </RestaurantProvider>
  )
}

export default App