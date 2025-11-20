import React, { useState, useEffect } from 'react'
import { useRestaurant } from '../../context/RestaurantContext'
import { ordersAPI } from '../../utils/api'
import OrderStatus from './OrderStatus'
import PaymentQR from '../payment/PaymentQR'

const OrderHistory = () => {
  const { menuItems } = useRestaurant()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getMyOrders()
      setOrders(response.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    fetchOrders()
    setSelectedOrder(null)
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }

    try {
      await ordersAPI.delete(orderId)
      // Remove the order from the list
      setOrders(orders.filter(order => order._id !== orderId))
    } catch (error) {
      console.error('Error deleting order:', error)
      alert(`Error: ${error.message || 'Failed to delete order. Only pending or cancelled orders can be deleted.'}`)
    }
  }

  // Auto-refresh orders every 10 seconds to show status updates from admin
  useEffect(() => {
    if (orders.length > 0) {
      const interval = setInterval(() => {
        fetchOrders()
      }, 10000) // Refresh every 10 seconds

      return () => clearInterval(interval)
    }
  }, [orders.length])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-gray-600 mb-4"></div>
        <div className="text-gray-600 text-lg font-medium">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 scroll-smooth">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-800 rounded-lg flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
            📦
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">My Orders</h2>
        </div>
        <button
          onClick={fetchOrders}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200 font-medium text-sm sm:text-base flex items-center justify-center gap-2"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-7xl mb-4">🛒</div>
          <p className="text-gray-500 text-xl font-bold mb-2">No orders yet</p>
          <p className="text-gray-400 text-sm">Start ordering to see your history here</p>
        </div>
      ) : (
        <div className="space-y-6 scroll-smooth">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-all duration-300 scroll-smooth"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded-lg flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                    #
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-2">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                        Order
                      </h3>
                      <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gray-100 text-gray-800 rounded-full text-xs sm:text-sm font-medium border border-gray-300 inline-block">
                        Table {order.tableNumber}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    ₹{order.total.toFixed(2)}
                  </div>
                  <div className="mb-1">
                    <span className="text-xs text-gray-500 font-medium">Cooking Status:</span>
                  </div>
                  <OrderStatus order={order} />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 sm:pt-6 mb-4 sm:mb-6">
                <h4 className="font-bold text-gray-800 text-base sm:text-lg mb-3 sm:mb-4">Items Ordered:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {(() => {
                            const menuItem = menuItems.find(mi => (mi._id || mi.id) === (item.menuItemId?._id || item.menuItemId || item.id))
                            if (menuItem?.image) {
                              return <img src={menuItem.image} alt={item.name} className="w-full h-full object-cover" />
                            } else if (menuItem?.emoji || item.menuItemId?.emoji) {
                              return (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-xl">{menuItem?.emoji || item.menuItemId?.emoji}</span>
                                </div>
                              )
                            } else {
                              return (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <span className="text-gray-400 text-xs">🍽️</span>
                                </div>
                              )
                            }
                          })()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{item.name}</div>
                          <div className="text-sm text-gray-500 font-medium">
                            ₹{item.price} × {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-gray-900 text-lg">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pt-4 sm:pt-6 border-t border-gray-200 bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-700 font-medium flex flex-col sm:flex-row gap-1 sm:gap-0">
                  <span>Subtotal: <span className="text-gray-900">₹{order.subtotal.toFixed(2)}</span></span>
                  <span className="sm:ml-4">Tax: <span className="text-gray-900">₹{order.tax.toFixed(2)}</span></span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {(order.status === 'pending' || order.status === 'cancelled') && (
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold text-sm sm:text-base flex items-center justify-center gap-2"
                      title="Delete this order"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                  {order.paymentStatus === 'pending' && order.qrCode && (
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200 font-semibold text-sm sm:text-base"
                    >
                      {selectedOrder?._id === order._id ? 'Hide' : 'Pay Now'}
                    </button>
                  )}
                </div>
              </div>

              {selectedOrder?._id === order._id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <PaymentQR order={order} onPaymentSuccess={handlePaymentSuccess} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderHistory

