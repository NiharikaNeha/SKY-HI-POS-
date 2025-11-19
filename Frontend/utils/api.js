const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token')
}

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }

  return data
}

// Auth API
export const authAPI = {
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  login: (email, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

// Menu API
export const menuAPI = {
  getAll: () => apiCall('/menu'),
  create: (item) => apiCall('/menu', {
    method: 'POST',
    body: JSON.stringify(item)
  }),
  update: (id, item) => apiCall(`/menu/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(item)
  }),
  delete: (id) => apiCall(`/menu/${id}`, {
    method: 'DELETE'
  })
}

// Orders API
export const ordersAPI = {
  create: (orderData) => apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  getMyOrders: () => apiCall('/orders/my-orders'),
  getAllOrders: () => apiCall('/orders'), // Admin only - gets all orders
  getOrder: (orderId) => apiCall(`/orders/${orderId}`),
  updateStatus: (orderId, status) => apiCall(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
}

// Payments API
export const paymentsAPI = {
  createIntent: (orderId) => apiCall('/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify({ orderId })
  }),
  confirm: (orderId, paymentIntentId) => apiCall('/payments/confirm', {
    method: 'POST',
    body: JSON.stringify({ orderId, paymentIntentId })
  }),
  getStatus: (orderId) => apiCall(`/payments/status/${orderId}`)
}

export default apiCall

