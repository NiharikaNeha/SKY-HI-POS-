import React, { useState, useEffect } from 'react'
import { useRestaurant } from '../../context/RestaurantContext'
import { ordersAPI } from '../../utils/api'

const OrderViewer = () => {
  const { menuItems } = useRestaurant()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedDate, setSelectedDate] = useState('all')

  useEffect(() => {
    fetchAllOrders()
  }, [])

  const fetchAllOrders = async () => {
    try {
      setLoading(true)
      // Try to fetch all orders (admin endpoint)
      try {
        const response = await ordersAPI.getAllOrders()
        setOrders(response.orders || [])
      } catch (adminError) {
        // If admin endpoint fails, fall back to user's orders
        console.warn('Admin endpoint failed, using user orders:', adminError)
        const response = await ordersAPI.getMyOrders()
        setOrders(response.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = (orders || []).filter(order => {
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false
    }
    
    if (selectedDate === 'all') {
      return true
    }
    
    const orderDate = order.createdAt 
      ? new Date(order.createdAt).toLocaleDateString()
      : order.date || order.timestamp
        ? new Date(order.date || order.timestamp).toLocaleDateString()
        : null
    
    const selectedDateStr = new Date(selectedDate).toLocaleDateString()
    return orderDate === selectedDateStr
  })

  const getOrderTotal = (order) => {
    if (order.total) {
      return order.total
    }
    const subtotal = (order.items || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
    const tax = subtotal * 0.1
    return subtotal + tax
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mb-4"></div>
            <div className="text-gray-600 text-lg font-medium">Loading orders...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Order History</h2>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            <option value="all">All Dates</option>
            <option value={new Date().toISOString().split('T')[0]}>Today</option>
            <option value={new Date(Date.now() - 86400000).toISOString().split('T')[0]}>Yesterday</option>
          </select>
          <button
            onClick={fetchAllOrders}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-sm transform hover:scale-105"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id || order.id}
              className="border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-xl hover:border-indigo-300 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-lg sm:text-xl font-bold text-gray-800">
                      Order #{order._id ? order._id.slice(-8).toUpperCase() : order.id || 'N/A'}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full text-xs sm:text-sm font-bold border-2 border-indigo-200">
                      🪑 Table {order.tableNumber || order.table || 'N/A'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                    <span>📅</span>
                    {order.createdAt 
                      ? new Date(order.createdAt).toLocaleString()
                      : order.date || order.timestamp
                        ? new Date(order.date || order.timestamp).toLocaleString()
                        : 'N/A'}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ${getOrderTotal(order).toFixed(2)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">Total</div>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>🍽️</span>
                  Items Ordered:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(order.items || []).map((item, index) => {
                    const menuItem = menuItems.find(mi => (mi._id || mi.id) === (item.menuItemId?._id || item.menuItemId || item.id))
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{menuItem?.emoji || item.menuItemId?.emoji || '🍽️'}</span>
                          <div>
                            <div className="font-bold text-gray-800">{item.name || item.menuItemId?.name || 'Item'}</div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              ${item.price || 0} × {item.quantity || 0}
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-indigo-600">
                          ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t-2 border-gray-200 flex flex-col sm:flex-row justify-between gap-2 text-sm bg-gray-50 rounded-lg p-3">
                <div>
                  <span className="text-gray-600">Subtotal: </span>
                  <span className="font-bold text-gray-800">
                    ${(order.subtotal || (getOrderTotal(order) / 1.1)).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Tax (10%): </span>
                  <span className="font-bold text-gray-800">
                    ${(order.tax || (getOrderTotal(order) * 0.1 / 1.1)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-xl font-bold mb-2">No orders found</p>
          <p className="text-gray-400 text-sm">Try selecting a different date or status</p>
        </div>
      )}
    </div>
  )
}

export default OrderViewer

