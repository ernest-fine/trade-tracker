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
  handleEdit,
}) => {
  const sortedEntries = [...entries].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    if (sortColumn === 'openDate' || sortColumn === 'expiryOrAssignedDate') {
      return sortDirection === 'asc'
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    }
    return sortDirection === 'asc'
      ? aValue - bValue
      : bValue - aValue;
  });

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = sortedEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(entries.length / entriesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Trade Entries</h2>
      {entries.length === 0 ? (
        <p className="text-gray-600">No trades entered yet.</p>
      ) : (
        <>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                {[
                  'ticker',
                  'principal',
                  'premium',
                  'fee',
                  'feeType',
                  'openDate',
                  'expiryOrAssignedDate',
                  'weeks',
                  'netProfit',
                  'weeklyReturn',
                  'tradeType',
                  'isAssigned',
                  'actions',
                ].map((column) => (
                  <th
                    key={column}
                    onClick={() =>
                      ['ticker', 'principal', 'premium', 'fee', 'weeks', 'netProfit', 'weeklyReturn', 'openDate', 'expiryOrAssignedDate', 'tradeType', 'isAssigned'].includes(column) && handleSort(column)
                    }
                    className="px-4 py-2 border cursor-pointer"
                  >
                    {column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1')}
                    {sortColumn === column && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className={
                    entry.tradeType !== 'stock' && entry.isAssigned
                      ? entry.tradeType === 'put'
                        ? 'bg-pink-200'
                        : 'bg-green-200'
                      : ''
                  }
                >
                  <td className="px-4 py-2 border">{entry.ticker}</td>
                  <td className="px-4 py-2 border">${entry.principal.toFixed(2)}</td>
                  <td className="px-4 py-2 border">${entry.premium.toFixed(2)}</td>
                  <td className="px-4 py-2 border">${entry.fee.toFixed(2)}</td>
                  <td className="px-4 py-2 border">{entry.feeType}</td>
                  <td className="px-4 py-2 border">{entry.openDate}</td>
                  <td className="px-4 py-2 border">{entry.expiryOrAssignedDate}</td>
                  <td className="px-4 py-2 border">{entry.weeks.toFixed(2)}</td>
                  <td className="px-4 py-2 border">${entry.netProfit.toFixed(2)}</td>
                  <td className="px-4 py-2 border">{(entry.weeklyReturn * 100).toFixed(2)}%</td>
                  <td className="px-4 py-2 border">{entry.tradeType}</td>
                  <td className="px-4 py-2 border">{entry.isAssigned ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 border flex space-x-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`mx-1 px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TradeTable;