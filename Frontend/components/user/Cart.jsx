import React from 'react'

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, onPlaceOrder, selectedTable, orderType = 'dining' }) => {
  const subtotal = cart.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0
    const quantity = parseInt(item.quantity) || 0
    return sum + (price * quantity)
  }, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 lg:sticky lg:top-24 scroll-smooth">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl font-bold">
          🛒
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">Order Summary</h2>
      </div>
      
      {orderType === 'dining' && !selectedTable && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm font-medium flex items-center gap-2">
            <span>⚠️</span>
            Please select a table first
          </p>
        </div>
      )}
      
      {orderType === 'parcel' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
            <span>📦</span>
            Takeaway order - No table selection required
          </p>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
          <p className="text-gray-400 text-sm mt-2">Add items from the menu</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2 scroll-smooth">
            {cart.map((item) => {
              const itemId = item._id || item.id
              return (
              <div
                key={itemId}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 hover:shadow-sm hover:border-gray-300 transition-all duration-200"
              >
                <div className="flex-1 w-full sm:w-auto">
                  <h3 className="font-bold text-gray-800 text-base sm:text-lg">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">₹{item.price} each</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onUpdateQuantity(itemId, item.quantity - 1)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700 transition-all hover:scale-110"
                  >
                    −
                  </button>
                  <span className="w-8 sm:w-10 text-center font-bold text-base sm:text-lg text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(itemId, item.quantity + 1)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700 transition-all"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onRemoveItem(itemId)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-700 transition-all flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              )
            })}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Tax (10%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t border-gray-300">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onPlaceOrder}
            disabled={(orderType === 'dining' && !selectedTable) || cart.length === 0}
            className={`w-full mt-4 sm:mt-6 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 ${
              (orderType === 'dining' && !selectedTable) || cart.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-900'
            }`}
          >
            {orderType === 'dining' && !selectedTable 
              ? 'Select Table First' 
              : cart.length === 0 
                ? 'Cart Empty' 
                : orderType === 'parcel'
                  ? '📦 Place Parcel Order'
                  : '🚀 Place Order'}
          </button>
        </>
      )}
    </div>
  )
}

export default Cart

