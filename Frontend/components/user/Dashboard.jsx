import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useRestaurant } from '../../context/RestaurantContext'
import { ordersAPI } from '../../utils/api'
import SearchBar from './SearchBar'
import TableSelector from './TableSelector'
import Menu from './Menu'
import Cart from './Cart'
import OrderHistory from '../common/OrderHistory'
import UserProfile from './UserProfile'

const Dashboard = ({ username, onLogout }) => {
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
  const [orderType, setOrderType] = useState('dining') // 'dining' or 'parcel'

  useEffect(() => {
    // Get user data from localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
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

  const handleOrderTypeChange = (type) => {
    setOrderType(type)
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
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-800 rounded-lg flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                🍽️
              </div>
              <div className="flex-1 sm:flex-none">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                  SKY-HI Restaurant
                </h1>
                <p className="text-gray-600 text-sm sm:text-base font-medium">Welcome, {username}</p>
              </div>
              {/* Google-style Profile Button - Beside Restaurant Name */}
              <button
                onClick={() => navigate('/dashboard/profile')}
                className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 overflow-hidden ml-auto sm:ml-0 ${
                  location.pathname === '/dashboard/profile'
                    ? 'bg-gray-800 ring-2 ring-gray-400'
                    : 'bg-gray-700 hover:bg-gray-800'
                }`}
                title={user?.name || username}
              >
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user?.name || username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg sm:text-xl flex items-center justify-center w-full h-full">
                    {user?.name ? user.name.charAt(0).toUpperCase() : username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </button>
            </div>
            <div className="flex items-center flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Order Type Toggle */}
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-full p-1.5">
                <button
                  onClick={() => handleOrderTypeChange('dining')}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 ${
                    orderType === 'dining'
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Dining In"
                >
                  🍽️ <span className="hidden sm:inline ml-1">Dining</span>
                </button>
                <button
                  onClick={() => handleOrderTypeChange('parcel')}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 ${
                    orderType === 'parcel'
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Takeaway"
                >
                  📦 <span className="hidden sm:inline ml-1">Parcel</span>
                </button>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base ${
                  location.pathname === '/dashboard' || location.pathname === '/dashboard/'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-800'
                }`}
              >
                Menu
              </button>
              <button
                onClick={() => navigate('/dashboard/orders')}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base ${
                  location.pathname === '/dashboard/orders'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-800'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => {
                  onLogout()
                  navigate('/login', { replace: true })
                }}
                className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

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

