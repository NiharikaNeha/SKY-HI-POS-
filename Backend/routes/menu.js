import express from 'express'
import { authenticate, isAdmin } from '../middleware/auth.js'
import MenuItem from '../models/MenuItem.js'

const router = express.Router()

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1, name: 1 })
    res.json({ menuItems })
  } catch (error) {
    console.error('Get menu items error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Create menu item (Admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body)
    await menuItem.save()
    res.status(201).json({ message: 'Menu item created', menuItem })
  } catch (error) {
    console.error('Create menu item error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Update menu item (Admin only)
router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' })
    }
    res.json({ message: 'Menu item updated', menuItem })
  } catch (error) {
    console.error('Update menu item error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Delete menu item (Admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id)
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' })
    }
    res.json({ message: 'Menu item deleted' })
  } catch (error) {
    console.error('Delete menu item error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

export default router

