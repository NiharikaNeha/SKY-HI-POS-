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
      // Handle different response formats
      let items = []
      if (Array.isArray(response)) {
        items = response
      } else if (response.menuItems && Array.isArray(response.menuItems)) {
        items = response.menuItems
      } else if (response.foods && Array.isArray(response.foods)) {
        items = response.foods
      } else if (response.food && Array.isArray(response.food)) {
        items = response.food
      }
      
      // Map backend food format to frontend menu item format
      const mappedItems = items.map(item => ({
        _id: item._id || item.id,
        name: item.name || '',
        category: item.category || '',
        price: item.price || 0,
        description: item.description || '',
        emoji: item.emoji || '🍽️',
        image: item.image || '',
        vegType: item.type === 'Non-Veg' ? 'non-veg' : item.type === 'Veg' ? 'veg' : item.vegType || 'veg',
        status: item.available === false ? 'unavailable' : item.status || 'available',
        cost: item.cost || 0
      }))
      
      setMenuItems(mappedItems)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      // Fallback to empty array if API fails
      setMenuItems([])
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

