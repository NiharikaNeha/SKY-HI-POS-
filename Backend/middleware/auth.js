import admin from 'firebase-admin'
import User from '../models/User.js'

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Try to initialize with service account
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
      console.log('Firebase Admin initialized with service account')
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Initialize with project ID (for development)
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      })
      console.log('Firebase Admin initialized with project ID:', process.env.FIREBASE_PROJECT_ID)
    } else {
      // Try to initialize with default project ID from your config
      admin.initializeApp({
        projectId: 'sky-hi-43d01'
      })
      console.log('Firebase Admin initialized with default project ID: sky-hi-43d01')
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error)
    console.warn('Firebase Admin not configured. Authentication will fail.')
  }
}

// Get admin emails from environment variable
const getAdminEmails = () => {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  return adminEmailsEnv.split(',').map(email => email.trim()).filter(Boolean);
};

// Helper function to check if email is admin 
const isAdminEmail = (email) => {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  const adminEmails = getAdminEmails();
  return adminEmails.some(
    (adminEmail) => adminEmail.toLowerCase() === normalizedEmail
  );
};

// Firebase authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authorization token provided' })
    }

    const token = authHeader.split('Bearer ')[1]
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    // Verify Firebase ID token
    let decodedToken
    try {
      decodedToken = await admin.auth().verifyIdToken(token)
    } catch (error) {
      console.error('Firebase token verification error:', error)
      return res.status(401).json({ 
        message: 'Invalid or expired token',
        error: error.message 
      })
    }

    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({ message: 'Invalid token payload' })
    }

    const firebaseUid = decodedToken.uid
    const email = decodedToken.email || ''
    const name = decodedToken.name || decodedToken.email?.split('@')[0] || 'User'

    // Get or create user in our database
    let user = await User.findOne({ firebaseUid })
    
    if (!user) {
      // If user doesn't exist in our DB, create one
      const role = isAdminEmail(email) ? 'admin' : 'user'
      
      user = new User({
        firebaseUid,
        email: email.toLowerCase(),
        name,
        role
      })
      await user.save()
    } else {
      // Update user info if it changed in Firebase
      if (email && user.email !== email.toLowerCase()) {
        user.email = email.toLowerCase()
      }
      if (name && user.name !== name) {
        user.name = name
      }
      // Update role if email is now in admin list
      if (email && isAdminEmail(email) && user.role !== 'admin') {
        user.role = 'admin'
      }
      await user.save()
    }

    req.user = user
    req.firebaseUid = firebaseUid
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(401).json({ 
      message: 'Authentication failed',
      error: error.message || 'Invalid authentication'
    })
  }
}

// Admin check middleware
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Admin access required',
      error: 'You do not have permission to access this resource'
    })
  }
  next()
}
