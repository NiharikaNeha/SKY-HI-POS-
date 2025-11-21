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

// Auth API
export const authAPI = {
  getMe: () => apiCall('/api/auth/me'),
  makeAdmin: (email) => apiCall('/api/auth/make-admin', {
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

// Menu API
export const menuAPI = {
  getAll: () => apiCall('/api/menu'),
  getById: (id) => apiCall(`/api/menu/${id}`),
  create: (itemData) => apiCall('/api/menu', {
    method: 'POST',
    body: JSON.stringify(itemData)
  }),
  update: (id, itemData) => apiCall(`/api/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData)
  }),
  delete: (id) => apiCall(`/api/menu/${id}`, {
    method: 'DELETE'
  })
}

// Orders API
export const ordersAPI = {
  create: (orderData) => apiCall('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  getMyOrders: () => apiCall('/api/orders/my-orders'),
  getAllOrders: () => apiCall('/api/orders/all'),
  getById: (id) => apiCall(`/api/orders/${id}`),
  updateStatus: (id, status) => apiCall(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
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

