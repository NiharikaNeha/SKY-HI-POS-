import express from 'express'
import { authenticate, isAdmin } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

// Make a user admin (Admin only)
router.post('/make-admin', authenticate, isAdmin, async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.role = 'admin'
    await user.save()

    res.json({
      message: 'User upgraded to admin successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Make admin error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Get all users (Admin only)
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

export default router


