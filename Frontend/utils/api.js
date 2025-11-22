// API Base URL - uses environment variable or defaults to localhost
// Fix: Ensure we use http:// for localhost, not https://
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (!envUrl) {
    return 'http://localhost:5000'
  }
  // Fix common mistake: https://localhost should be http://localhost
  if (envUrl.includes('localhost') && envUrl.startsWith('https://')) {
    return envUrl.replace('https://', 'http://')
  }
  return envUrl
}

// Helper function to get auth token from Firebase
import { auth } from '../firebase'

const API_BASE_URL = getApiBaseUrl()

const getAuthToken = async () => {
  try {
    const user = auth.currentUser
    if (user) {
      return await user.getIdToken()
    }
    return null
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = await getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}. ${text}`)
      }
      return text
    }

    const data = await response.json()

    if (!response.ok) {
      // Include more details in error message
      const errorMessage = data.message || data.error || 'API request failed'
      const errorDetails = data.details || data.errors || null
      const fullError = new Error(errorMessage)
      fullError.status = response.status
      fullError.details = errorDetails
      fullError.response = data
      throw fullError
    }

    return data
  } catch (error) {
    console.error('API call error:', error)
    // If it's already our custom error, re-throw it
    if (error.status) {
      throw error
    }
    // Otherwise, wrap it
    const wrappedError = new Error(error.message || 'Network error or server unavailable')
    wrappedError.originalError = error
    throw wrappedError
  }
}

// Auth API - Backend doesn't have auth routes, so these will fail gracefully
// Components should handle these errors or use Firebase auth directly
export const authAPI = {
  getMe: async () => {
    // Backend doesn't have /api/auth/me, return mock user data from Firebase
    // Components should use Firebase auth directly instead
    try {
      const user = auth.currentUser
      if (user) {
        return {
          user: {
            id: user.uid,
            firebaseUid: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: 'user' // Default role, can be checked from backend if needed
          }
        }
      }
      throw new Error('No user logged in')
    } catch (error) {
      console.error('Error getting user:', error)
      throw error
    }
  },
  makeAdmin: async (email) => {
    // Backend doesn't have this route
    console.warn('makeAdmin API not available in backend')
    throw new Error('Admin management not available')
  }
}

// Menu API - Maps to /api/foods in backend
export const menuAPI = {
  getAll: async () => {
    // Backend returns array directly, but frontend expects { menuItems: [...] }
    const foods = await apiCall('/api/foods')
    return Array.isArray(foods) ? { menuItems: foods } : foods
  },
  getById: (id) => apiCall(`/api/foods/${id}`),
  create: async (itemData) => {
    // Backend expects FormData for image upload, but we'll handle base64 images
    // Backend route is /api/foods/add
    const formData = new FormData()
    
    // Add text fields
    formData.append('name', itemData.name || '')
    formData.append('category', itemData.category || '')
    formData.append('type', itemData.vegType === 'non-veg' ? 'Non-Veg' : itemData.vegType === 'veg' ? 'Veg' : 'Other')
    formData.append('price', itemData.price || 0)
    formData.append('available', itemData.status !== 'unavailable' ? 'true' : 'false')
    
    // Handle image - if it's base64, convert to blob
    if (itemData.image && itemData.image.startsWith('data:')) {
      const response = await fetch(itemData.image)
      const blob = await response.blob()
      formData.append('image', blob, 'image.jpg')
    }
    
    const token = await getAuthToken()
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const apiUrl = getApiBaseUrl()
    const res = await fetch(`${apiUrl}/api/foods/add`, {
      method: 'POST',
      headers,
      body: formData
    })
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to create menu item' }))
      throw new Error(error.message || 'Failed to create menu item')
    }
    
    return await res.json()
  },
  update: async (id, itemData) => {
    // Backend uses PUT /api/foods/:id
    const formData = new FormData()
    
    // Add text fields
    if (itemData.name) formData.append('name', itemData.name)
    if (itemData.category) formData.append('category', itemData.category)
    if (itemData.vegType) {
      formData.append('type', itemData.vegType === 'non-veg' ? 'Non-Veg' : itemData.vegType === 'veg' ? 'Veg' : 'Other')
    }
    if (itemData.price !== undefined) formData.append('price', itemData.price)
    if (itemData.status !== undefined) {
      formData.append('available', itemData.status !== 'unavailable' ? 'true' : 'false')
    } else if (itemData.available !== undefined) {
      formData.append('available', itemData.available ? 'true' : 'false')
    }
    
    // Handle image - if it's base64, convert to blob
    if (itemData.image && itemData.image.startsWith('data:') && !itemData.image.includes('http')) {
      const response = await fetch(itemData.image)
      const blob = await response.blob()
      formData.append('image', blob, 'image.jpg')
    }
    
    const token = await getAuthToken()
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const apiUrl = getApiBaseUrl()
    const res = await fetch(`${apiUrl}/api/foods/${id}`, {
      method: 'PUT',
      headers,
      body: formData
    })
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to update menu item' }))
      throw new Error(error.message || 'Failed to update menu item')
    }
    
    return await res.json()
  },
  delete: (id) => apiCall(`/api/foods/${id}`, {
    method: 'DELETE'
  })
}

// Orders API - Maps to backend /api/orders routes
export const ordersAPI = {
  create: async (orderData) => {
    // Get current user info for order
    const user = auth.currentUser
    const userEmail = user?.email || orderData.userEmail || orderData.user?.email || ''
    const userName = user?.displayName || orderData.userName || orderData.user?.name || userEmail?.split('@')[0] || 'User'
    const userId = user?.uid || orderData.userId || orderData.user?.id || ''
    
    // Backend expects /api/orders/create for single order or /api/orders/create-multiple for array
    // Check if orderData.items is an array (multiple items) or single order
    if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
      // Multiple items - transform to backend format
      // Items might have menuItemId, so we need to get full item details
      const orders = orderData.items.map(item => {
        // If item has menuItemId, we need to get the full item details
        // For now, use what's available in the item object
        const foodName = item.name || item.menuItemId?.name || 'Food Item'
        const category = item.category || item.menuItemId?.category || ''
        const vegType = item.vegType || item.menuItemId?.vegType || item.type || 'veg'
        const price = item.price || item.menuItemId?.price || 0
        const image = item.image || item.menuItemId?.image || ''
        
        return {
          userEmail,
          userName,
          userId,
          tableNumber: orderData.tableNumber || orderData.tables?.[0] || 0,
          foodName,
          category,
          type: vegType === 'non-veg' ? 'Non-Veg' : vegType === 'veg' ? 'Veg' : 'Other',
          quantity: item.quantity || 1,
          price: price * (item.quantity || 1), // Total price for this quantity
          image
        }
      })
      
      const response = await apiCall('/api/orders/create-multiple', {
        method: 'POST',
        body: JSON.stringify(orders)
      })
      
      // Backend returns { success: true, orders: [...] }
      return {
        order: response.orders?.[0] || response.order || response,
        orders: response.orders || [response.order || response]
      }
    } else {
      // Single order - transform to backend format
      const foodName = orderData.foodName || orderData.items?.[0]?.name || 'Food Item'
      const category = orderData.category || orderData.items?.[0]?.category || ''
      const vegType = orderData.vegType || orderData.items?.[0]?.vegType || orderData.items?.[0]?.type || 'veg'
      const price = orderData.price || orderData.items?.[0]?.price || 0
      const image = orderData.image || orderData.items?.[0]?.image || ''
      
      const backendOrder = {
        userEmail,
        userName,
        userId,
        tableNumber: orderData.tableNumber || orderData.tables?.[0] || 0,
        foodName,
        category,
        type: vegType === 'non-veg' ? 'Non-Veg' : vegType === 'veg' ? 'Veg' : 'Other',
        quantity: orderData.quantity || orderData.items?.[0]?.quantity || 1,
        price: price * (orderData.quantity || orderData.items?.[0]?.quantity || 1),
        image
      }
      
      const response = await apiCall('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify(backendOrder)
      })
      
      // Backend returns { success: true, order: {...} }
      return {
        order: response.order || response,
        orders: [response.order || response]
      }
    }
  },
  getMyOrders: async () => {
    // Backend doesn't have /my-orders, so we get all and filter by userEmail
    // This requires user email to be available
    const allOrders = await apiCall('/api/orders')
    const orders = Array.isArray(allOrders) ? allOrders : []
    
    // Filter by current user - we'll need to get user email from auth
    // For now, return all orders and let components filter
    return { orders }
  },
  getAllOrders: async () => {
    // Backend GET /api/orders returns all orders
    const orders = await apiCall('/api/orders')
    return { orders: Array.isArray(orders) ? orders : [] }
  },
  getById: (id) => {
    // Backend doesn't have this route, but we can filter from all orders
    // For now, return error or implement client-side filtering
    return apiCall(`/api/orders/${id}`)
  },
  updateStatus: (id, status) => {
    // Backend uses PUT /api/orders/:id with { status } in body
    // Backend expects status values: "Pending", "Cooking", "Ready", "Served", "Completed"
    // Map frontend status to backend status
    const statusMap = {
      'pending': 'Pending',
      'preparing': 'Cooking',
      'ready': 'Ready',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    }
    
    const backendStatus = statusMap[status?.toLowerCase()] || status
    
    return apiCall(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: backendStatus })
    })
  },
  delete: (id) => apiCall(`/api/orders/${id}`, {
    method: 'DELETE'
  })
}

// Upload API (for Cloudinary image uploads)
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const token = await getAuthToken()
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
      method: 'POST',
      headers,
      body: formData
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to upload image')
      } else {
        const text = await response.text()
        throw new Error(`Server error: ${response.status} ${response.statusText}. ${text}`)
      }
    }

    return await response.json()
  },
  deleteImage: (publicId) => apiCall('/api/upload/image', {
    method: 'DELETE',
    body: JSON.stringify({ publicId })
  })
}

// Admin API
export const adminAPI = {
  getStats: () => apiCall('/api/admin/stats'),
  getUsers: () => apiCall('/api/admin/users'),
  updateUser: (id, userData) => apiCall(`/api/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  deleteUser: (id) => apiCall(`/api/admin/users/${id}`, {
    method: 'DELETE'
  })
}

