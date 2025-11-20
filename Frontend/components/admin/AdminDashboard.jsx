import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import FoodStatusManager from './FoodStatusManager'
import FoodUpload from './FoodUpload'
import ProfitLossTracker from './ProfitLossTracker'
import OrderViewer from './OrderViewer'
import UserProfile from '../user/UserProfile'

const AdminDashboard = ({ username, onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  
  // Get active tab from URL - handle /admin and /admin/status cases
  const pathParts = location.pathname.split('/').filter(Boolean)
  let activeTab = 'status'
  if (pathParts.length > 1 && pathParts[0] === 'admin') {
    activeTab = pathParts[1] || 'status'
  }
  
  // Ensure we're on a valid route
  useEffect(() => {
    const validRoutes = ['status', 'upload', 'profit', 'orders', 'profile']
    const currentRoute = pathParts.length > 1 && pathParts[0] === 'admin' ? pathParts[1] : null
    
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/status', { replace: true })
    } else if (currentRoute && !validRoutes.includes(currentRoute)) {
      // Invalid route, redirect to status
      navigate('/admin/status', { replace: true })
    }
  }, [location.pathname, navigate, pathParts])

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

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const tabs = [
    { id: 'status', name: 'Food Status', icon: '📊' },
    { id: 'upload', name: 'Upload Food', icon: '➕' },
    { id: 'profit', name: 'Profit/Loss', icon: '💰' },
    { id: 'orders', name: 'View Orders', icon: '📋' },
    { id: 'profile', name: 'My Profile', icon: '👤' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 scroll-smooth">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-800 rounded-lg flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                ⚙️
              </div>
              <div className="flex-1 sm:flex-none">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                  SKY-HI Admin Panel
                </h1>
                <p className="text-gray-600 text-sm sm:text-base font-medium">Welcome, {username}</p>
              </div>
              {/* Google-style Profile Button - Beside Admin Panel Name */}
              <button
                onClick={() => navigate('/admin/profile')}
                className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 overflow-hidden ml-auto sm:ml-0 ${
                  location.pathname === '/admin/profile'
                    ? 'bg-gray-800 ring-2 ring-gray-400'
                    : 'bg-gray-700 hover:bg-gray-800'
                }`}
                title={user?.name || username}
              >
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user?.name || username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg sm:text-xl flex items-center justify-center w-full h-full">
                    {user?.name ? user.name.charAt(0).toUpperCase() : username?.charAt(0).toUpperCase() || 'A'}
                  </span>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  onLogout()
                  navigate('/login', { replace: true })
                }}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(`/admin/${tab.id}`)}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-white rounded-t-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-t-lg'
                }`}
              >
                <span className="mr-1 sm:mr-2 text-sm sm:text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 scroll-smooth">
        <Routes>
          <Route index element={<Navigate to="status" replace />} />
          <Route path="status" element={<FoodStatusManager />} />
          <Route path="upload" element={<FoodUpload />} />
          <Route path="profit" element={<ProfitLossTracker />} />
          <Route path="orders" element={<OrderViewer />} />
          <Route path="profile" element={<UserProfile user={user} onUpdate={handleUserUpdate} />} />
        </Routes>
      </main>
    </div>
  )
}

export default AdminDashboard

