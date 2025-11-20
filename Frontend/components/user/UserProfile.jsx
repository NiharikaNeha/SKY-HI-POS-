import React, { useState, useEffect } from 'react'
import { ordersAPI } from '../../utils/api'

const UserProfile = ({ user, onUpdate }) => {
  const [userData, setUserData] = useState(user || {})
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0
  })

  useEffect(() => {
    if (user) {
      setUserData(user)
    } else {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          setUserData(JSON.parse(savedUser))
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
    }
    fetchUserStats()
  }, [user])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    try {
      setUploadingImage(true)
      
      // Convert image to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Image = reader.result
        
        // Update local state immediately for better UX
        const updatedUser = { ...userData, profileImage: base64Image }
        setUserData(updatedUser)
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // If there's an update callback, call it
        if (onUpdate) {
          onUpdate(updatedUser)
        }
        
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
      setUploadingImage(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getMyOrders()
      const userOrders = response.orders || []
      
      setOrders(userOrders)
      
      // Calculate statistics
      const totalOrders = userOrders.length
      const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      const pendingOrders = userOrders.filter(order => 
        order.status !== 'completed' && order.status !== 'cancelled'
      ).length

      setStats({
        totalOrders,
        totalSpent,
        pendingOrders
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          Administrator
        </span>
      )
    }
    return (
      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
        Customer
      </span>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 scroll-smooth">
      {/* Profile Header */}
      <div className="bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">My Profile</h2>
          {getRoleBadge(userData.role)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3 sm:mb-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gray-700 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl lg:text-5xl font-bold border-4 border-gray-600 overflow-hidden">
                {userData.profileImage ? (
                  <img 
                    src={userData.profileImage} 
                    alt={userData.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              {/* Image Upload Button */}
              <label className="absolute bottom-0 right-0 sm:right-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 sm:p-2.5 cursor-pointer transition-all duration-200 border-2 border-gray-500">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">{userData.name || 'User'}</h3>
            <p className="text-gray-300 text-sm sm:text-base break-all">{userData.email}</p>
            {uploadingImage && (
              <p className="text-gray-400 text-xs mt-1">Uploading...</p>
            )}
          </div>

          {/* User Details */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Full Name</label>
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 rounded-lg border border-gray-600">
                <p className="text-white font-medium text-sm sm:text-base">{userData.name || 'Not provided'}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Email Address</label>
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 rounded-lg border border-gray-600">
                <p className="text-white font-medium text-sm sm:text-base break-all">{userData.email || 'Not provided'}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Phone Number</label>
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 rounded-lg border border-gray-600">
                <p className="text-white font-medium text-sm sm:text-base">{userData.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 scroll-smooth">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Total Orders</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl opacity-60">📦</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Total Spent</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">₹{stats.totalSpent.toFixed(2)}</p>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl opacity-60">💰</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Pending Orders</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl opacity-60">⏳</div>
          </div>
        </div>
      </div>

      {/* Recent Orders Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Recent Orders</h3>
          <button
            onClick={fetchUserStats}
            className="w-full sm:w-auto px-4 sm:px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200 font-medium text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mb-4"></div>
            <p className="text-gray-500 text-lg">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg font-medium">No orders yet</p>
            <p className="text-gray-400 text-sm mt-2">Start ordering to see your history here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order._id || order.id}
                className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    #
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">
                      Order
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt || order.timestamp).toLocaleDateString()} • 
                      Table {order.tableNumber || order.table}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-bold text-gray-900 text-xl">₹{order.total?.toFixed(2) || '0.00'}</p>
                    <p className={`text-xs px-3 py-1 rounded-full font-medium mt-1 ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status || 'pending'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile

