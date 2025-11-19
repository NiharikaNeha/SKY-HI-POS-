import React, { useState, useEffect } from 'react'
import { ordersAPI } from '../utils/api'
import OrderStatus from './OrderStatus'
import PaymentQR from './PaymentQR'

const OrderHistory = () => {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
        <div className="text-gray-600 text-lg font-medium">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-lg">
            📦
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">My Orders</h2>
        </div>
        <button
          onClick={fetchOrders}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="text-7xl mb-4">🛒</div>
          <p className="text-gray-500 text-xl font-bold mb-2">No orders yet</p>
          <p className="text-gray-400 text-sm">Start ordering to see your history here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-gray-100 hover:shadow-2xl hover:border-indigo-300 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-lg">
                    #
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-2">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full text-xs sm:text-sm font-bold border-2 border-indigo-200 inline-block">
                        🪑 Table {order.tableNumber}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                      <span>📅</span>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    ${order.total.toFixed(2)}
                  </div>
                  <OrderStatus order={order} />
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-4 sm:pt-6 mb-4 sm:mb-6">
                <h4 className="font-bold text-gray-800 text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                  <span>🍽️</span>
                  Items Ordered:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {item.menuItemId?.emoji || '🍽️'}
                        </span>
                        <div>
                          <div className="font-bold text-gray-800">{item.name}</div>
                          <div className="text-sm text-gray-500 font-medium">
                            ${item.price} × {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-indigo-600 text-lg">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pt-4 sm:pt-6 border-t-2 border-gray-200 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-700 font-semibold flex flex-col sm:flex-row gap-1 sm:gap-0">
                  <span>Subtotal: <span className="text-gray-900">${order.subtotal.toFixed(2)}</span></span>
                  <span className="sm:ml-4">Tax: <span className="text-gray-900">${order.tax.toFixed(2)}</span></span>
                </div>
                {order.paymentStatus === 'pending' && order.qrCode && (
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg sm:rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-bold text-sm sm:text-base transform hover:scale-105"
                  >
                    {selectedOrder?._id === order._id ? '❌ Hide' : '💳 Pay Now'}
                  </button>
                )}
              </div>

              {selectedOrder?._id === order._id && (
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
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

