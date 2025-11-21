import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { useRestaurant } from '../../context/RestaurantContext'
import { ordersAPI } from '../../utils/api'
import SearchBar from './SearchBar'
import TableSelector from './TableSelector'
import Menu from './Menu'
import Cart from './Cart'
import OrderHistory from '../common/OrderHistory'
import UserProfile from './UserProfile'

const Dashboard = () => {
  const [firebaseUser, firebaseLoading] = useAuthState(auth)
  const { menuItems } = useRestaurant()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTable, setSelectedTable] = useState(null)
  const [memberCount, setMemberCount] = useState(null)
  const [memberCountInput, setMemberCountInput] = useState('')
  const [cart, setCart] = useState([])
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [user, setUser] = useState(null)
  // Get orderType from localStorage (set by Navbar)
  const [orderType, setOrderType] = useState(() => {
    return localStorage.getItem('orderType') || 'dining'
  })

  useEffect(() => {
    // Get user data from backend
    const fetchUser = async () => {
      if (firebaseUser && !firebaseLoading) {
        try {
          const token = await firebaseUser.getIdToken()
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
          }
        } catch (error) {
          console.error('Error fetching user:', error)
        }
      }
    }
    fetchUser()
  }, [firebaseUser, firebaseLoading])

  // Listen for orderType changes from Navbar
  useEffect(() => {
    const handleOrderTypeChange = (e) => {
      setOrderType(e.detail)
      // Reset table selection and member count when switching to parcel
      if (e.detail === 'parcel') {
        setSelectedTable(null)
        setMemberCount(null)
        setMemberCountInput('')
      }
    }
    window.addEventListener('orderTypeChanged', handleOrderTypeChange)
    return () => window.removeEventListener('orderTypeChanged', handleOrderTypeChange)
  }, [])

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const handleAddToCart = (item) => {
    // Allow adding to cart without table selection
    const itemId = item._id || item.id
    const existingItem = cart.find((cartItem) => (cartItem._id || cartItem.id) === itemId)
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          (cartItem._id || cartItem.id) === itemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      )
    } else {
      setCart([...cart, { ...item, _id: item._id || item.id, quantity: 1 }])
    }
  }

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId)
      return
    }
    setCart(
      cart.map((item) =>
        (item._id || item.id) === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const handleRemoveItem = (itemId) => {
    setCart(cart.filter((item) => (item._id || item.id) !== itemId))
  }

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return
    
    // For dining, require table selection
    if (orderType === 'dining' && !selectedTable) {
      alert('Please select a table before placing your order')
      return
    }
    
    try {
      const orderData = {
        orderType: orderType,
        items: cart.map(item => ({
          menuItemId: item._id || item.id,
          quantity: item.quantity
        }))
      }

      // Add table information only for dining orders
      if (orderType === 'dining') {
        const tableNumber = Array.isArray(selectedTable) ? selectedTable[0] : selectedTable
        orderData.tableNumber = tableNumber
        orderData.tables = Array.isArray(selectedTable) ? selectedTable : [selectedTable]
        orderData.memberCount = memberCount
      }

      const response = await ordersAPI.create(orderData)
      setCurrentOrder(response.order)
      setCart([])
      setOrderPlaced(true)
      navigate('/dashboard/orders')
      setTimeout(() => setOrderPlaced(false), 5000)
    } catch (error) {
      alert(`Error placing order: ${error.message}`)
    }
  }

  // This function is kept for backward compatibility but orderType is now managed by Navbar
  const handleOrderTypeChange = (type) => {
    setOrderType(type)
    localStorage.setItem('orderType', type)
    window.dispatchEvent(new CustomEvent('orderTypeChanged', { detail: type }))
    // Reset table selection and member count when switching to parcel
    if (type === 'parcel') {
      setSelectedTable(null)
      setMemberCount(null)
      setMemberCountInput('')
    }
  }

  const handleTableSelect = (table) => {
    setSelectedTable(table)
  }

  const handleMemberCountSubmit = (e) => {
    e.preventDefault()
    if (memberCountInput && parseInt(memberCountInput) > 0) {
      setMemberCount(parseInt(memberCountInput))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 scroll-smooth">
      {/* Header removed - now handled by Navbar component */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 scroll-smooth">
        {orderPlaced && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-5 bg-green-50 border border-green-200 rounded-lg shadow-sm">
            <p className="text-green-800 font-medium text-sm sm:text-base flex items-center gap-2">
              <span>✓</span>
              <span className="flex-1">Order placed successfully! Check "My Orders" to pay.</span>
            </p>
          </div>
        )}

        <Routes>
          <Route 
            path="/" 
            element={
              <>
                {/* Step 1: Menu and Cart - At the Top */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                  {/* Menu Section */}
                  <div className="lg:col-span-2 order-2 lg:order-1">
                    <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                    <Menu
                      menuItems={menuItems}
                      searchTerm={searchTerm}
                      onAddToCart={handleAddToCart}
                    />
                  </div>

                  {/* Cart Section */}
                  <div className="lg:col-span-1 order-1 lg:order-2">
                    <Cart
                      cart={cart}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                      onPlaceOrder={handlePlaceOrder}
                      selectedTable={selectedTable}
                      orderType={orderType}
                    />
                  </div>
                </div>

                {/* Step 2: Member Count Input - Between Menu and Table Selection (Only for Dining) */}
                {orderType === 'dining' && (
                  <div className="mb-6 sm:mb-8">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border-2 border-blue-200 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
                            👥
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Enter Number of Guests</h3>
                            <p className="text-xs sm:text-sm text-gray-600">Please enter the number of members before selecting tables</p>
                          </div>
                        </div>
                        {memberCount ? (
                          <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-white rounded-lg border-2 border-blue-300">
                              <p className="text-sm font-medium text-gray-600">Members</p>
                              <p className="text-xl font-bold text-gray-900">{memberCount}</p>
                            </div>
                            <button
                              onClick={() => {
                                setMemberCount(null)
                                setMemberCountInput('')
                                setSelectedTable(null)
                              }}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleMemberCountSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={memberCountInput}
                              onChange={(e) => setMemberCountInput(e.target.value)}
                              placeholder="Enter number of guests"
                              className="px-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-base sm:text-lg font-medium w-full sm:w-48"
                              required
                            />
                            <button
                              type="submit"
                              className="px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
                            >
                              Continue
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Table Selection - At the Bottom (Only for Dining and if member count is entered) */}
                {orderType === 'dining' && (
                  memberCount ? (
                    <div className="mb-4 sm:mb-6 lg:mb-8">
                      <TableSelector
                        selectedTable={selectedTable}
                        onTableSelect={handleTableSelect}
                        memberCount={memberCount}
                        disabled={!memberCount}
                      />
                    </div>
                  ) : (
                    <div className="mb-4 sm:mb-6 lg:mb-8 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <div className="text-4xl mb-3">🪑</div>
                        <p className="text-gray-600 font-medium text-base sm:text-lg mb-1">Table Selection</p>
                        <p className="text-gray-500 text-sm">Please enter the number of members above to select your table(s)</p>
                      </div>
                    </div>
                  )
                )}
              </>
            } 
          />
          <Route 
            path="/orders" 
            element={<OrderHistory />} 
          />
          <Route 
            path="/profile" 
            element={<UserProfile user={user} onUpdate={handleUserUpdate} />} 
          />
        </Routes>
      </main>
    </div>
  )
}

export default Dashboard

