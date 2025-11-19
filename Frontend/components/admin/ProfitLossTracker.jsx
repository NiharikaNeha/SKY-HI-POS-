import React, { useState, useMemo, useEffect } from 'react'
import { useRestaurant } from '../../context/RestaurantContext'
import { ordersAPI } from '../../utils/api'

const ProfitLossTracker = () => {
  const { menuItems } = useRestaurant()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

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

  const dailyData = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        profitMargin: 0,
        orderCount: 0,
        orderDetails: []
      }
    }

    const selectedDateStr = new Date(selectedDate).toLocaleDateString()
    const selectedOrders = (orders || []).filter(order => {
      const orderDate = order.createdAt 
        ? new Date(order.createdAt).toLocaleDateString()
        : order.date || order.timestamp
          ? new Date(order.date || order.timestamp).toLocaleDateString()
          : null
      return orderDate === selectedDateStr
    })
    
    let totalRevenue = 0
    let totalCost = 0
    const orderDetails = []

    selectedOrders.forEach(order => {
      const orderTotal = (order.items || []).reduce((sum, item) => {
        const menuItem = menuItems.find(mi => (mi._id || mi.id) === (item.menuItemId?._id || item.menuItemId || item.id))
        const revenue = (item.price || 0) * (item.quantity || 0)
        const cost = (menuItem?.cost || 0) * (item.quantity || 0)
        totalRevenue += revenue
        totalCost += cost
        return sum + revenue
      }, 0)
      
      const orderTax = orderTotal * 0.1
      const orderTotalWithTax = orderTotal + orderTax
      const orderCost = (order.items || []).reduce((sum, item) => {
        const menuItem = menuItems.find(mi => (mi._id || mi.id) === (item.menuItemId?._id || item.menuItemId || item.id))
        return sum + ((menuItem?.cost || 0) * (item.quantity || 0))
      }, 0)
      const orderProfit = orderTotalWithTax - orderCost

      orderDetails.push({
        ...order,
        revenue: orderTotalWithTax,
        cost: orderCost,
        profit: orderProfit
      })
    })

    const totalProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      orderCount: selectedOrders.length,
      orderDetails
    }
  }, [orders, menuItems, selectedDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mb-4"></div>
          <div className="text-gray-600 text-lg font-medium">Loading profit/loss data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 scroll-smooth">
      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
          <div className="text-3xl font-bold text-blue-600">₹{dailyData.totalRevenue.toFixed(2)}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="text-sm text-gray-600 mb-1">Total Cost</div>
          <div className="text-3xl font-bold text-red-600">₹{dailyData.totalCost.toFixed(2)}</div>
        </div>
        
        <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${dailyData.totalProfit >= 0 ? 'border-green-500' : 'border-red-500'}`}>
          <div className="text-sm text-gray-600 mb-1">Net Profit/Loss</div>
          <div className={`text-3xl font-bold ${dailyData.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{dailyData.totalProfit.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600 mb-1">Profit Margin</div>
          <div className={`text-3xl font-bold ${dailyData.profitMargin >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
            {dailyData.profitMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Order Count */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-gray-800">{dailyData.orderCount}</div>
          </div>
          <div className="text-6xl">📊</div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Details</h2>
        {dailyData.orderDetails.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Table</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cost</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Profit</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.orderDetails.map((order) => (
                  <tr key={order._id || order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-semibold text-gray-800">Order</td>
                    <td className="py-4 px-4 text-gray-700">Table {order.tableNumber || order.table || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-700">
                      {(order.items || []).map(item => `${item.name || item.menuItemId?.name || 'Item'} x${item.quantity || 0}`).join(', ')}
                    </td>
                    <td className="py-4 px-4 font-semibold text-green-600">₹{order.revenue.toFixed(2)}</td>
                    <td className="py-4 px-4 font-semibold text-red-600">₹{order.cost.toFixed(2)}</td>
                    <td className={`py-4 px-4 font-semibold ${order.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{order.profit.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {order.createdAt 
                        ? new Date(order.createdAt).toLocaleTimeString()
                        : order.timestamp 
                          ? new Date(order.timestamp).toLocaleTimeString()
                          : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No orders found for this date.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfitLossTracker

