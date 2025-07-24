import React from 'react';

const DefaultFees = ({
  defaultOpenFee,
  setDefaultOpenFee,
  defaultRollFee,
  setDefaultRollFee,
  defaultStockFee,
  setDefaultStockFee,
  handleFeeUpdate,
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 className="text-xl font-semibold mb-4">Set Default Fees</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Opening Fee ($)
        </label>
        <input
          type="number"
          placeholder="Default Opening Fee ($)"
          value={defaultOpenFee}
          onChange={(e) => setDefaultOpenFee(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Rolling Fee ($)
        </label>
        <input
          type="number"
          placeholder="Default Rolling Fee ($)"
          value={defaultRollFee}
          onChange={(e) => setDefaultRollFee(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Stock Selling Fee ($)
        </label>
        <input
          type="number"
          placeholder="Default Stock Selling Fee ($)"
          value={defaultStockFee}
          onChange={(e) => setDefaultStockFee(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.01"
        />
      </div>
    </div>
    <button
      onClick={handleFeeUpdate}
      className="mt-4 w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
    >
      Save Default Fees
    </button>
  </div>
);

export default DefaultFees;