import React from 'react'

const Menu = ({ menuItems, searchTerm, onAddToCart }) => {
  const categories = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Salads']

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const activeCategory = 'All'

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 scroll-smooth mt-10">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl font-bold">
          🍽️
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">Menu</h2>
      </div>
      
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
              activeCategory === category
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 scroll-smooth">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item._id || item.id}
              className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300"
            >
              {/* Image Section */}
              <div className="w-full h-28 sm:h-32 lg:h-36 bg-gray-50 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : item.emoji ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <span className="text-4xl sm:text-5xl lg:text-6xl">{item.emoji}</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5">{item.name}</h3>
                <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">{item.category}</p>
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{item.description}</p>
              </div>

              {/* Price and Button Section */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-100">
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  ₹{item.price}
                </span>
                <button
                  onClick={() => onAddToCart(item)}
                  className="px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  Add to Cart
                </button>
              </div>
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

