import express from 'express'
import Stripe from 'stripe'
import { authenticate } from '../middleware/auth.js'
import Order from '../models/Order.js'

const router = express.Router()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key')

// Create payment intent
router.post('/create-intent', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' })
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' })
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      }
    })

    // Update order with payment intent ID
    order.paymentIntentId = paymentIntent.id
    await order.save()

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Confirm payment
router.post('/confirm', authenticate, async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      order.paymentStatus = 'paid'
      await order.save()

      res.json({
        message: 'Payment confirmed',
        order
      })
    } else {
      order.paymentStatus = 'failed'
      await order.save()

      res.status(400).json({
        message: 'Payment failed',
        status: paymentIntent.status
      })
    }
  } catch (error) {
    console.error('Confirm payment error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Get payment status
router.get('/status/:orderId', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' })
    }

    let paymentStatus = order.paymentStatus

    // If payment intent exists, check Stripe status
    if (order.paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId)
        if (paymentIntent.status === 'succeeded' && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid'
          await order.save()
          paymentStatus = 'paid'
        }
      } catch (error) {
        console.error('Stripe retrieve error:', error)
      }
    }

    res.json({
      paymentStatus,
      orderId: order._id
    })
  } catch (error) {
    console.error('Get payment status error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

export default router

