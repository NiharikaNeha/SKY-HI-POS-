import express from 'express'
import { authenticate, isAdmin } from '../middleware/auth.js'
import Order from '../models/Order.js'
import MenuItem from '../models/MenuItem.js'
import QRCode from 'qrcode'

const router = express.Router()

// Create order
router.post('/', authenticate, async (req, res) => {
  try {
    const { tableNumber, tables, memberCount, orderType = 'dining', items } = req.body

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' })
    }

    // Validate order type
    if (!['dining', 'parcel'].includes(orderType)) {
      return res.status(400).json({ message: 'Invalid order type. Must be "dining" or "parcel"' })
    }

    // For dining orders, require table information
    if (orderType === 'dining') {
      if (!tableNumber && (!tables || tables.length === 0)) {
        return res.status(400).json({ message: 'Table number or tables array is required for dining orders' })
      }
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId)
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item ${item.menuItemId} not found` })
      }

      const itemTotal = menuItem.price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      })
    }

    const tax = subtotal * 0.1
    const total = subtotal + tax

    // Create order
    const orderData = {
      userId: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      orderType,
      memberCount
    }

    // Add table information based on order type
    if (orderType === 'dining') {
      if (tables && tables.length > 0) {
        orderData.tables = tables
        // Use first table as tableNumber for backward compatibility
        orderData.tableNumber = tables[0]
      } else if (tableNumber) {
        orderData.tableNumber = tableNumber
        orderData.tables = [tableNumber]
      }
    }

    const order = new Order(orderData)

    await order.save()

    // Generate QR code for payment
    const qrCodeData = JSON.stringify({
      orderId: order._id.toString(),
      total: total,
      orderType: orderType,
      tableNumber: orderData.tableNumber || null,
      tables: orderData.tables || null
    })

    const qrCodeImage = await QRCode.toDataURL(qrCodeData)

    order.qrCode = qrCodeImage
    order.qrCodeData = qrCodeData
    await order.save()

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        ...order.toObject(),
        qrCode: qrCodeImage
      }
    })
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Get user orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.menuItemId', 'name emoji')
      .sort({ createdAt: -1 })

    res.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Get all orders (Admin only) - This route is placed after /my-orders to avoid conflicts
// Note: Express matches routes in order, so /my-orders must come before /:orderId
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.menuItemId', 'name emoji')
      .sort({ createdAt: -1 })

    res.json({ orders })
  } catch (error) {
    console.error('Get all orders error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Get single order
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.menuItemId', 'name emoji category')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Check if user owns the order or is admin
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json({ order })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Update order status (Admin only)
router.patch('/:orderId/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.body

    if (!['pending', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    ).populate('items.menuItemId', 'name emoji')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json({ message: 'Order status updated', order })
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Delete order (User can delete their own orders, Admin can delete any)
router.delete('/:orderId', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Check if user owns the order or is admin
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Only allow deletion of pending or cancelled orders
    if (!['pending', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: 'Can only delete pending or cancelled orders' })
    }

    await Order.findByIdAndDelete(req.params.orderId)

    res.json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error('Delete order error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

export default router

