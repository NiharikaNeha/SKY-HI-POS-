import express from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'

const router = express.Router()

// Admin emails
const ADMIN_EMAILS = [
  'sagarika@11gmail.com',
  'admin@sky-hi.com',
]

// Helper function to check if email is admin (case-insensitive)
const isAdminEmail = (email) => {
  if (!email) return false
  const normalizedEmail = email.toLowerCase().trim()
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail)
}

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password, phone } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Determine role based on email
    const role = isAdminEmail(email) ? 'admin' : 'user'
    console.log(`Registering user ${email} with role: ${role}`)

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role
    })

    await user.save()

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.log(`Login attempt failed: User not found for email ${email}`)
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Check password
    try {
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        console.log(`Login attempt failed: Incorrect password for email ${email}`)
        return res.status(401).json({ message: 'Invalid email or password' })
      }
    } catch (passwordError) {
      console.error('Password comparison error:', passwordError)
      console.error('Error details:', {
        email,
        userId: user._id,
        errorMessage: passwordError.message
      })
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Update role if email is in admin list (in case user was registered before being added to admin list)
    if (isAdminEmail(email)) {
      if (user.role !== 'admin') {
        console.log(`Upgrading user ${email} to admin`)
        user.role = 'admin'
        await user.save()
      }
    }
    
    console.log(`User ${email} logged in with role: ${user.role}`)

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

export default router

