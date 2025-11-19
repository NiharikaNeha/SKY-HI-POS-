import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

dotenv.config()

const resetPassword = async (email, newPassword) => {
  if (!email || !newPassword) {
    console.error('Usage: node scripts/resetPassword.js <email> <newPassword>')
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://nehaniharikaswain07_db_user:FW2wwR4UeuLhfOtJ@cluster0.ntd44ai.mongodb.net/')
    console.log('Connected to MongoDB')

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.log(`User with email ${email} not found.`)
      process.exit(1)
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update password directly (bypassing the pre-save hook)
    user.password = hashedPassword
    await user.save()

    console.log(`Password reset successfully for ${email}`)
  } catch (error) {
    console.error('Error resetting password:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Please provide email and new password')
  console.error('Usage: node scripts/resetPassword.js <email> <newPassword>')
  process.exit(1)
}

resetPassword(email, password)

