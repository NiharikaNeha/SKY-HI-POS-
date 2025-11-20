import React, { useState, useEffect } from 'react'

const TableSelector = ({ selectedTable, onTableSelect, memberCount, disabled = false }) => {
  const [selectedTables, setSelectedTables] = useState(Array.isArray(selectedTable) ? selectedTable : selectedTable ? [selectedTable] : [])
  const [showTableSelection, setShowTableSelection] = useState(!!memberCount)
  
  const tables = Array.from({ length: 20 }, (_, i) => i + 1)
  
  // Simulate some occupied tables (for demo purposes)
  const occupiedTables = [3, 7, 12, 18]

  // Update showTableSelection when memberCount prop changes
  useEffect(() => {
    if (memberCount) {
      setShowTableSelection(true)
    } else {
      setShowTableSelection(false)
      setSelectedTables([])
      onTableSelect(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberCount])

  const handleTableToggle = (tableNumber) => {
    if (occupiedTables.includes(tableNumber)) {
      return // Can't select occupied tables
    }
    
    const newSelectedTables = selectedTables.includes(tableNumber)
      ? selectedTables.filter(t => t !== tableNumber)
      : [...selectedTables, tableNumber]
    
    setSelectedTables(newSelectedTables)
    // Pass array or single value based on selection
    if (newSelectedTables.length === 1) {
      onTableSelect(newSelectedTables[0])
    } else if (newSelectedTables.length > 1) {
      onTableSelect(newSelectedTables)
    } else {
      onTableSelect(null)
    }
  }

  const getTableStatus = (tableNumber) => {
    if (occupiedTables.includes(tableNumber)) {
      return 'occupied'
    }
    if (selectedTables.includes(tableNumber)) {
      return 'selected'
    }
    return 'available'
  }

  const getTableClass = (status) => {
    switch (status) {
      case 'selected':
        return 'bg-green-600 text-white border-green-700 shadow-lg ring-2 ring-green-400 ring-offset-2 transform scale-105'
      case 'occupied':
        return 'bg-red-500 text-white border-red-600 hover:bg-red-600 hover:border-red-700 hover:shadow-md hover:scale-105'
      default:
        return 'bg-gray-400 text-white border-gray-600 hover:bg-gray-600 hover:border-gray-700 hover:shadow-md hover:scale-105 cursor-pointer'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
          🪑
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Select Your Table</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Enter number of members and choose your table(s)</p>
        </div>
      </div>


      {/* Table Selection Section */}
      {showTableSelection && memberCount && (
        <>
          {/* Member Count Display */}
          <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm sm:text-base font-bold flex-shrink-0">
                👥
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Number of Members</p>
                <p className="text-base sm:text-lg font-bold text-gray-900">{memberCount} {parseInt(memberCount) === 1 ? 'Member' : 'Members'}</p>
              </div>
            </div>
          </div>

          {/* Screen/View Indicator */}
          <div className="mb-4 sm:mb-6 text-center">
            <div className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md">
              <span className="text-xs sm:text-sm font-semibold">📺 Restaurant View</span>
            </div>
          </div>

          {/* Table Grid - Movie Theater Style */}
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4 lg:p-6 xl:p-8 mb-4 sm:mb-6 overflow-x-auto">
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 lg:gap-4 min-w-max sm:min-w-0 max-w-full sm:max-w-4xl mx-auto">
              {tables.map((table) => {
                const status = getTableStatus(table)
                return (
                  <button
                    key={table}
                    onClick={() => !disabled && handleTableToggle(table)}
                    disabled={status === 'occupied' || disabled}
                    className={`
                      relative w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg font-bold text-xs sm:text-sm md:text-base
                      border-2 transition-all duration-200 flex items-center justify-center
                      ${getTableClass(status)}
                      ${status === 'available' && !disabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                    `}
                    title={disabled ? 'Enter member count first' : status === 'occupied' ? 'Table occupied' : `Table ${table}`}
                  >
                    <span>{table}</span>
                    {status === 'selected' && (
                      <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full border-2 border-white"></span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Legend */}
      {showTableSelection && (
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 rounded-lg border-2 border-green-700 ring-2 ring-green-400 ring-offset-1"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">Selected</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-lg border-2 border-red-600"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">Booked</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-400 rounded-lg border-2 border-gray-600"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">Available</span>
          </div>
        </div>
      )}

      {/* Selected Table Info */}
      {showTableSelection && selectedTables.length > 0 && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center text-white text-base sm:text-lg font-bold flex-shrink-0">
                ✓
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  {selectedTables.length === 1 ? 'Selected Table' : 'Selected Tables'}
                </p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                  {selectedTables.length === 1 
                    ? `Table ${selectedTables[0]}`
                    : `Tables ${selectedTables.sort((a, b) => a - b).join(', ')}`
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {memberCount} {parseInt(memberCount) === 1 ? 'member' : 'members'} • {selectedTables.length} {selectedTables.length === 1 ? 'table' : 'tables'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedTables([])
                onTableSelect(null)
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableSelector

