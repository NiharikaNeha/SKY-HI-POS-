import React from 'react'

const TableSelector = ({ selectedTable, onTableSelect }) => {
  const tables = Array.from({ length: 20 }, (_, i) => i + 1)

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-lg sm:text-xl font-bold">
          🪑
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Select Table</h2>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
        {tables.map((table) => (
          <button
            key={table}
            onClick={() => onTableSelect(table)}
            className={`py-2.5 sm:py-3 lg:py-4 px-2 sm:px-3 lg:px-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all duration-200 ${
              selectedTable === table
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl transform scale-105 sm:scale-110 ring-2 sm:ring-4 ring-indigo-200'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-indigo-50 hover:to-purple-50 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-indigo-200'
            }`}
          >
            {table}
          </button>
        ))}
      </div>
      {selectedTable && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl border-2 border-indigo-200">
          <p className="text-indigo-700 font-semibold text-sm sm:text-base lg:text-lg flex items-center gap-2">
            <span>✅</span>
            Selected: <span className="font-bold text-indigo-900">Table {selectedTable}</span>
          </p>
        </div>
      )}
    </div>
  )
}

export default TableSelector

