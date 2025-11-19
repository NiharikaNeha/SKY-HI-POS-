import React, { useState, useEffect } from 'react'
import { paymentsAPI } from '../utils/api'

const PaymentQR = ({ order, onPaymentSuccess }) => {
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || 'pending')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Poll payment status
    const interval = setInterval(async () => {
      try {
        const status = await paymentsAPI.getStatus(order._id)
        setPaymentStatus(status.paymentStatus)
        if (status.paymentStatus === 'paid' && onPaymentSuccess) {
          onPaymentSuccess()
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }, 3000) // Check every 3 seconds

    return () => clearInterval(interval)
  }, [order._id, onPaymentSuccess])

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Payment Completed'
      case 'failed':
        return 'Payment Failed'
      default:
        return 'Payment Pending'
    }
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border-2 border-gray-100">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg">
          💳
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Payment</h2>
      </div>
      
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl border-2 border-indigo-200">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-gray-700 font-semibold text-sm sm:text-base lg:text-lg">Order Total:</span>
          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ${order.total.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-semibold text-sm sm:text-base">Status:</span>
          <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border-2 ${getStatusColor(paymentStatus)}`}>
            {getStatusText(paymentStatus)}
          </span>
        </div>
      </div>

      {paymentStatus === 'pending' && order.qrCode && (
        <div className="text-center">
          <p className="text-gray-800 font-bold text-base sm:text-lg mb-4 sm:mb-6 flex items-center justify-center gap-2">
            <span>📱</span>
            Scan QR code to pay
          </p>
          <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-4 border-indigo-200 inline-block mb-4 sm:mb-6 shadow-2xl">
            <img src={order.qrCode} alt="Payment QR Code" className="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">
              Order ID: <span className="font-bold text-indigo-600">{order._id.slice(-8).toUpperCase()}</span>
            </p>
            <p className="text-sm text-gray-600 font-medium">
              Table: <span className="font-bold text-indigo-600">{order.tableNumber}</span>
            </p>
          </div>
        </div>
      )}

      {paymentStatus === 'paid' && (
        <div className="text-center py-8 sm:py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
            <span className="text-4xl sm:text-5xl lg:text-6xl">✅</span>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-2 sm:mb-3">Payment Successful!</p>
          <p className="text-gray-600 text-base sm:text-lg">Your order is being prepared 🍽️</p>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="text-center py-8 sm:py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
            <span className="text-4xl sm:text-5xl lg:text-6xl">❌</span>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mb-2 sm:mb-3">Payment Failed</p>
          <p className="text-gray-600 text-base sm:text-lg mb-4 sm:mb-6">Please try again</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl font-bold text-base sm:text-lg transform hover:scale-105"
          >
            🔄 Retry Payment
          </button>
        </div>
      )}
    </div>
  )
}

export default PaymentQR

