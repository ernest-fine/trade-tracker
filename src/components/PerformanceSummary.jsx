import React from 'react';

const PerformanceSummary = ({
  weekDate,
  setWeekDate,
  rangeStart,
  setRangeStart,
  rangeEnd,
  setRangeEnd,
  weekMetrics,
  rangeMetrics,
  metrics,
  clearEntries,
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Weekly Performance</h3>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Date in Week
        </label>
        <input
          type="date"
          value={weekDate}
          onChange={(e) => setWeekDate(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-2">Total Invested (Week): ${weekMetrics.weekPrincipal}</p>
        <p>Total Profit (Week): ${weekMetrics.weekProfit}</p>
        <p>Weekly ROI: {weekMetrics.weekROI}%</p>
        <p>Number of Trades: {weekMetrics.tradeCount}</p>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Custom Range Performance</h3>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Date
        </label>
        <input
          type="date"
          value={rangeStart}
          onChange={(e) => setRangeStart(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">
          End Date
        </label>
        <input
          type="date"
          value={rangeEnd}
          onChange={(e) => setRangeEnd(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-2">Total Invested (Range): ${rangeMetrics.rangePrincipal}</p>
        <p>Total Profit (Range): ${rangeMetrics.rangeProfit}</p>
        <p>Range ROI: {rangeMetrics.rangeROI}%</p>
        <p>Number of Trades: {rangeMetrics.tradeCount}</p>
      </div>
    </div>
    <h3 className="text-lg font-medium mb-2">Overall Performance</h3>
    <p>Total Principal Invested: ${metrics.totalPrincipal}</p>
    <p>Total Net Profit: ${metrics.totalNetProfit}</p>
    <p>Total Return: ${metrics.totalReturn}%</p>
    <p>Annualized Return: {metrics.annualizedReturn}% (based on {metrics.totalWeeks} weeks, {metrics.totalTrades} trades)</p>
    <button
      onClick={clearEntries}
      className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
    >
      Clear All Entries
    </button>
  </div>
);

export default PerformanceSummary;