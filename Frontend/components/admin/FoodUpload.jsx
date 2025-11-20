import React, { useState } from 'react'
import { useRestaurant } from '../../context/RestaurantContext'
import { menuAPI } from '../../utils/api'

const FoodUpload = () => {
  const { menuItems, fetchMenuItems } = useRestaurant()
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: ''
  })

  const processImageFile = (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    try {
      setUploadingImage(true)
      
      // Convert image to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64Image = reader.result
        setFormData({ ...formData, image: base64Image })
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
      setUploadingImage(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    processImageFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    processImageFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price)
      }

      if (isEditing && editingItem) {
        await menuAPI.update(editingItem._id || editingItem.id, itemData)
        setIsEditing(false)
        setEditingItem(null)
      } else {
        await menuAPI.create(itemData)
      }
      
      // Refresh menu items from backend
      await fetchMenuItems()
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        price: '',
        description: '',
        image: ''
      })
    } catch (error) {
      console.error('Error saving menu item:', error)
      alert(`Error: ${error.message || 'Failed to save menu item'}`)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setIsEditing(true)
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description,
      image: item.image || ''
    })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await menuAPI.delete(id)
        // Refresh menu items from backend
        await fetchMenuItems()
      } catch (error) {
        console.error('Error deleting menu item:', error)
        alert(`Error: ${error.message || 'Failed to delete menu item'}`)
      }
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingItem(null)
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      image: ''
    })
  }

  return (
    <div className="space-y-6 scroll-smooth">
      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Appetizers, Main Course, Desserts, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Food Image</label>
              <div className="flex flex-col gap-3">
                {formData.image && (
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-gray-800 bg-gray-100 scale-105'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <label className="flex flex-col items-center cursor-pointer w-full">
                    <div className="flex flex-col items-center">
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mb-2"></div>
                          <span className="text-sm text-gray-600 font-medium">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <svg className={`w-8 h-8 mb-2 transition-colors ${isDragging ? 'text-gray-800' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className={`text-sm font-medium transition-colors ${isDragging ? 'text-gray-800' : 'text-gray-600'}`}>
                            {formData.image ? 'Change Image' : isDragging ? 'Drop Image Here' : 'Drag & Drop or Click to Upload'}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {formData.image && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove Image
                  </button>
                )}
              </div>
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
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-medium"
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">Existing Menu Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div key={item._id || item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-3">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : item.emoji ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl">{item.emoji}</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{item.category}</p>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900">₹{item.price}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id || item.id)}
                  className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm font-medium"
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

