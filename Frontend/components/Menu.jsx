import React from 'react'

const Menu = ({ menuItems, searchTerm, onAddToCart }) => {
  const categories = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Salads']

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const isAvailable = item.status === 'available' || !item.status
    return matchesSearch && isAvailable
  })

  const activeCategory = 'All'

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-lg sm:text-xl font-bold">
          🍽️
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Menu</h2>
      </div>
      
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-gray-100 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
              activeCategory === category
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item._id || item.id}
              className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 transform hover:scale-105"
            >
              <div className="mb-3 sm:mb-4">
                <div className="w-full h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-inner">
                  <span className="text-4xl sm:text-5xl lg:text-6xl">{item.emoji}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">{item.name}</h3>
                <p className="text-xs font-semibold text-indigo-600 mb-1 sm:mb-2 uppercase tracking-wide">{item.category}</p>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{item.description}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-200">
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ${item.price}
                </span>
                <button
                  onClick={() => onAddToCart(item)}
                  disabled={item.status === 'unavailable'}
                  className={`w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 ${
                    item.status === 'unavailable'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-110'
                  }`}
                >
                  {item.status === 'unavailable' ? 'Unavailable' : '➕ Add'}
                </button>
              </div>
              {item.status === 'low_stock' && (
                <div className="mt-3 text-xs text-yellow-700 font-semibold bg-yellow-100 px-3 py-1.5 rounded-lg inline-block">
                  ⚠️ Low Stock
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-xl font-medium">No items found matching your search.</p>
            <p className="text-gray-400 text-sm mt-2">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Menu

