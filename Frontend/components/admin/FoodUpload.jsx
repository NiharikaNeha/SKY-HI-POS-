import React, { useState } from 'react'
import { useRestaurant } from '../../context/RestaurantContext'

const FoodUpload = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useRestaurant()
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Appetizers',
    price: '',
    description: '',
    emoji: '🍽️',
    cost: '',
    status: 'available'
  })

  const categories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Salads']
  const emojis = ['🍽️', '🥗', '🥙', '🍗', '🧀', '🌯', '🐟', '🥩', '🍝', '🍔', '🍰', '🍨', '🧁', '🥤', '🍹', '☕', '🧊', '💧', '🍕', '🌮', '🍜', '🥘', '🍱']

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isEditing && editingItem) {
      updateMenuItem(editingItem.id, {
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost) || 0
      })
      setIsEditing(false)
      setEditingItem(null)
    } else {
      addMenuItem({
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost) || 0
      })
    }
    setFormData({
      name: '',
      category: 'Appetizers',
      price: '',
      description: '',
      emoji: '🍽️',
      cost: '',
      status: 'available'
    })
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setIsEditing(true)
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description,
      emoji: item.emoji,
      cost: (item.cost || 0).toString(),
      status: item.status || 'available'
    })
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMenuItem(id)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingItem(null)
    setFormData({
      name: '',
      category: 'Appetizers',
      price: '',
      description: '',
      emoji: '🍽️',
      cost: '',
      status: 'available'
    })
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditing ? 'Edit Food Item' : 'Add New Food Item'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Food Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Production cost"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-center text-2xl"
                  maxLength={2}
                />
                <div className="flex-1 overflow-x-auto flex gap-1 p-2 bg-gray-50 rounded-lg">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji })}
                      className="text-2xl hover:scale-125 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="available">Available</option>
                <option value="low_stock">Low Stock</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              rows="3"
              required
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              {isEditing ? 'Update Item' : 'Add Item'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Existing Items List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Existing Menu Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{item.emoji}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.status === 'available' ? 'bg-green-100 text-green-800' :
                  item.status === 'unavailable' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status}
                </span>
              </div>
              <h3 className="font-bold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{item.category}</p>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-indigo-600">${item.price}</span>
                {item.cost && (
                  <span className="text-xs text-gray-500">Cost: ${item.cost}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FoodUpload

