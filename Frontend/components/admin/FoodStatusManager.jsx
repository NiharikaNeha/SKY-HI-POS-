import React from 'react'
import { useRestaurant } from '../../context/RestaurantContext'

const FoodStatusManager = () => {
  const { menuItems, updateMenuItem } = useRestaurant()

  const handleStatusChange = (id, newStatus) => {
    updateMenuItem(id, { status: newStatus })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Food Status Management</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Food Item</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Current Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-700">{item.category}</td>
                <td className="py-4 px-4 font-semibold text-gray-800">${item.price}</td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                    {item.status === 'available' ? 'Available' : 
                     item.status === 'unavailable' ? 'Unavailable' : 'Low Stock'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(item.id, 'available')}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                        item.status === 'available'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'low_stock')}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                        item.status === 'low_stock'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                      }`}
                    >
                      Low Stock
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'unavailable')}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                        item.status === 'unavailable'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                      }`}
                    >
                      Unavailable
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FoodStatusManager

