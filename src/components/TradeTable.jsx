import React from 'react';

const TradeTable = ({
  entries,
  sortColumn,
  sortDirection,
  handleSort,
  currentPage,
  setCurrentPage,
  entriesPerPage,
  deleteEntry,
}) => {
  const sortEntries = (entries, column, direction) => {
    const sorted = [...entries];
    const multiplier = direction === 'asc' ? 1 : -1;
    sorted.sort((a, b) => {
      switch (column) {
        case 'tradeType':
        case 'ticker':
        case 'feeType':
          return multiplier * a[column].localeCompare(b[column]);
        case 'principal':
        case 'premium':
        case 'fee':
        case 'netProfit':
        case 'weeklyReturn':
        case 'weeks':
          return multiplier * (a[column] - b[column]);
        case 'openDate':
        case 'expiryOrAssignedDate':
          return multiplier * (new Date(a[column] || '9999-12-31') - new Date(b[column] || '9999-12-31'));
        default:
          return 0;
      }
    });
    return sorted;
  };

  const sortedEntries = sortEntries(entries, sortColumn, sortDirection);
  const totalPages = Math.ceil(sortedEntries.length / entriesPerPage);
  const paginatedEntries = sortedEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (entries.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Trade Entries</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 cursor-pointer hover:bg-gray-300" onClick={() => handleSort('tradeType')}>
              Trade Type {sortColumn === 'tradeType' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2 cursor-pointer hover:bg-gray-300" onClick={() => handleSort('ticker')}>
              Ticker {sortColumn === 'ticker' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2 cursor-pointer hover:bg-gray-300" onClick={() => handleSort('principal')}>
              Principal ($) {sortColumn === 'principal' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2 cursor-pointer hover:bg-gray-300" onClick={() => handleSort('premium')}>
              Fill Amount / Premium ($) {sortColumn === 'premium' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2 cursor-pointer hover:bg-gray-300" onClick={() => handleSort('fee')}>
              Fee ($) {sortColumn === 'fee' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2 cursor-pointer hover:bg-gray-300" onClick={() => handleSort('feeType')}>
              Fee Type {sortColumn === 'feeType' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2 cursor-pointer hover:bg-gray-300" onClick={() => handleSort('netProfit')}>
              Net Profit ($) {sortColumn === 'netProfit' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2 cursor-pointer hover:bg-gray-300" onClick={() => handleSort('weeklyReturn')}>
              Weekly ROI (%) {sortColumn === 'weeklyReturn' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2 cursor-pointer hover:bg-gray-300" onClick={() => handleSort('openDate')}>
              Open Date {sortColumn === 'openDate' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2 cursor-pointer hover:bg-gray-300" onClick={() => handleSort('expiryOrAssignedDate')}>
              Expiry/Assigned Date {sortColumn === 'expiryOrAssignedDate' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2 cursor-pointer hover:bg-gray-300" onClick={() => handleSort('weeks')}>
              Weeks {sortColumn === 'weeks' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEntries.map((entry) => (
            <tr key={entry.id} className="border-b">
              <td className="p-2">{entry.tradeType === 'put' ? 'Selling Put' : entry.tradeType === 'call' ? 'Selling Call' : 'Selling Stocks'}</td>
              <td className="p-2">{entry.ticker}</td>
              <td className="p-2">{entry.principal.toFixed(2)}</td>
              <td className="p-2">{entry.premium.toFixed(2)}</td>
              <td className="p-2">{entry.fee.toFixed(2)}</td>
              <td className="p-2">{entry.feeType}</td>
              <td className="p-2">{entry.netProfit.toFixed(2)}</td>
              <td className="p-2">{(entry.weeklyReturn * 100).toFixed(2)}</td>
              <td className="p-2">{entry.openDate}</td>
              <td className="p-2">{entry.expiryOrAssignedDate}</td>
              <td className="p-2">{entry.weeks}</td>
              <td className="p-2">
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TradeTable;