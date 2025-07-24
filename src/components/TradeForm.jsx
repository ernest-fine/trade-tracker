import React from 'react';

const TradeForm = ({
  ticker,
  setTicker,
  principal,
  setPrincipal,
  premium,
  setPremium,
  openDate,
  setOpenDate,
  expiryOrAssignedDate,
  setExpiryOrAssignedDate,
  tradeType,
  setTradeType,
  feeType,
  setFeeType,
  defaultOpenFee,
  defaultRollFee,
  defaultStockFee,
  handleSubmit,
  fieldType
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 className="text-xl font-semibold mb-4">Add Trade</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Ticker</label>
        <input
          type="text"
          placeholder="Stock Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Principal ($)</label>
        <input
          type="number"
          placeholder="Principal ($)"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {tradeType === 'stock' ? 'Fill Amount ($)' : 'Premium Received ($)'}
        </label>
        <input
          type="number"
          placeholder={tradeType === 'stock' ? 'Fill Amount ($)' : 'Premium Received ($)'}
          value={premium}
          onChange={(e) => setPremium(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Position Open Date
        </label>
        <input
          type="date"
          placeholder="Position Open Date"
          value={openDate}
          onChange={(e) => setOpenDate(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {tradeType === 'stock' ? 'Assigned Date' : 'Option Expiry Date'}
        </label>
        <input
          type="date"
          placeholder={tradeType === 'stock' ? 'Assigned Date' : 'Option Expiry Date'}
          value={expiryOrAssignedDate}
          onChange={(e) => setExpiryOrAssignedDate(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Trade Type</h3>
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="tradeType"
            value="put"
            checked={tradeType === 'put'}
            onChange={(e) => setTradeType(e.target.value)}
            className="mr-2"
          />
          Selling Put
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="tradeType"
            value="call"
            checked={tradeType === 'call'}
            onChange={(e) => setTradeType(e.target.value)}
            className="mr-2"
          />
          Selling Call
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="tradeType"
            value="stock"
            checked={tradeType === 'stock'}
            onChange={(e) => setTradeType(e.target.value)}
            className="mr-2"
          />
          Selling Stocks
        </label>
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Fee Type</h3>
      <div className="flex flex-wrap space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="feeType"
            value="opening"
            checked={feeType === 'opening'}
            onChange={(e) => setFeeType(e.target.value)}
            className="mr-2"
            disabled={tradeType === 'stock'}
          />
          Opening Fee (${defaultOpenFee})
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="feeType"
            value="rolling"
            checked={feeType === 'rolling'}
            onChange={(e) => setFeeType(e.target.value)}
            className="mr-2"
            disabled={tradeType === 'stock'}
          />
          Rolling Fee (${defaultRollFee})
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="feeType"
            value="stock"
            checked={feeType === 'stock'}
            onChange={(e) => setFeeType(e.target.value)}
            className="mr-2"
            disabled={tradeType !== 'stock'}
          />
          Stock Selling Fee (${defaultStockFee})
        </label>
      </div>
    </div>
    <button
      onClick={handleSubmit}
      className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
    >
      Add Trade
    </button>
  </div>
);

export default TradeForm;