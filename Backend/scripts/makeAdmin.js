import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

const makeUserAdmin = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined in .env file')
      process.exit(1)
    }
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const email = 'sagarika@11gmail.com'
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      console.log(`User with email ${email} not found. Please register first.`)
      process.exit(1)
    }

    // Update to admin
    user.role = 'admin'
    await user.save()

    console.log(`✅ Successfully updated ${email} to admin role`)
    console.log(`User details:`, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    })

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

makeUserAdmin()


