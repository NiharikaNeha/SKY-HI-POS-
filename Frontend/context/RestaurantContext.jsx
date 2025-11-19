import React, { createContext, useContext, useState, useEffect } from 'react'
import { menuAPI } from '../utils/api'

const RestaurantContext = createContext()

export const useRestaurant = () => {
  const context = useContext(RestaurantContext)
  if (!context) {
    throw new Error('useRestaurant must be used within RestaurantProvider')
  }
  return context
}

export const RestaurantProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getAll()
      setMenuItems(response.menuItems)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      // Fallback to default items if API fails
      setMenuItems([
        { _id: 1, name: 'Caesar Salad', category: 'Salads', price: 12.99, description: 'Fresh romaine lettuce with caesar dressing', emoji: '🥗', status: 'available', cost: 5.00 },
        { _id: 2, name: 'Greek Salad', category: 'Salads', price: 11.99, description: 'Mixed greens with feta and olives', emoji: '🥙', status: 'available', cost: 4.50 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const updateMenuItem = (id, updates) => {
    setMenuItems(menuItems.map(item => 
      (item._id || item.id) === id ? { ...item, ...updates } : item
    ))
  }

  const addMenuItem = (item) => {
    setMenuItems([...menuItems, item])
  }

  const deleteMenuItem = (id) => {
    setMenuItems(menuItems.filter(item => (item._id || item.id) !== id))
  }

  const value = {
    menuItems,
    setMenuItems,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    loading,
    fetchMenuItems
  }

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  )
}

