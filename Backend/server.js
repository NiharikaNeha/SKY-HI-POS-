import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import orderRoutes from './routes/orders.js'
import menuRoutes from './routes/menu.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
// CORS configuration - allow both localhost (development) and production URL
const corsOptions = {
  origin: (origin, callback) => {
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'https://sky-hi-pos.vercel.app',
      'https://sky-hi-pos-frontend.vercel.app'
    ]
    
    // Add FRONTEND_URL from env if it exists
    if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
      allowedOrigins.push(process.env.FRONTEND_URL)
    }
    
    console.log('CORS Request from origin:', origin)
    console.log('Allowed origins:', allowedOrigins)
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('No origin, allowing request')
      return callback(null, true)
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      console.log('Origin allowed:', origin)
      callback(null, true)
    } else if (process.env.NODE_ENV !== 'production' && origin && origin.startsWith('http://localhost:')) {
      // In development, allow any localhost port
      console.log('Localhost origin allowed in development:', origin)
      callback(null, true)
    } else {
      console.log('Origin blocked:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/admin', adminRoutes)

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SKY-HI Restaurant Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      menu: '/api/menu',
      orders: '/api/orders',
      admin: '/api/admin',
      health: '/api/health'
    }
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Connect to MongoDB
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in environment variables')
    if (process.env.VERCEL !== '1') {
      process.exit(1)
    }
    return
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    })
    console.log('Connected to MongoDB')
    
    // Only listen on PORT if not in Vercel (serverless)
    if (process.env.VERCEL !== '1') {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
      })
    }
  } catch (error) {
    console.error('MongoDB connection error:', error)
    if (process.env.VERCEL !== '1') {
      process.exit(1)
    }
  }
}

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
})

// Connect to database
connectDB()

// Export for Vercel serverless functions
export default app

