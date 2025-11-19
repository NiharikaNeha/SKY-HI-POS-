import React from 'react'

const OrderStatus = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'ready':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'preparing':
        return 'Preparing'
      case 'ready':
        return 'Ready'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'ready':
        return '🍽️'
      case 'preparing':
        return '👨‍🍳'
      case 'cancelled':
        return '❌'
      default:
        return '⏳'
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl">{getStatusIcon(order.status)}</span>
      <div className="flex items-center gap-2">
        <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
        {order.paymentStatus === 'paid' && (
          <span className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium">
            Paid
          </span>
        )}
      </div>
    </div>
  )
}

export default OrderStatus

