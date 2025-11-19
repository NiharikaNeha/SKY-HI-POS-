import React from 'react'

const TableSelector = ({ selectedTable, onTableSelect }) => {
  const tables = Array.from({ length: 20 }, (_, i) => i + 1)

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 scroll-smooth">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl font-bold">
          🪑
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">Select Table</h2>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
        {tables.map((table) => (
          <button
            key={table}
            onClick={() => onTableSelect(table)}
            className={`py-2.5 sm:py-3 lg:py-4 px-2 sm:px-3 lg:px-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 ${
              selectedTable === table
                ? 'bg-gray-800 text-white shadow-sm ring-2 ring-gray-400'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {table}
          </button>
        ))}
      </div>
      {selectedTable && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-700 font-medium text-sm sm:text-base lg:text-lg flex items-center gap-2">
            <span>✓</span>
            Selected: <span className="font-semibold text-gray-900">Table {selectedTable}</span>
          </p>
        </div>
      )}
    </div>
  )
}

export default TableSelector

