import React, { useState, useEffect } from 'react';
import DefaultFees from './DefaultFees';
import TradeForm from './TradeForm';
import PerformanceSummary from './PerformanceSummary';
import WeeklyTrends from './WeeklyTrends';
import TradeTable from './TradeTable';
import { calculateWeeks, calculateMetrics, calculateWeeklyPerformance, calculateRangePerformance, calculateWeeklyTrends } from '../utils/calculations';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-4 text-red-600 text-center">
          <h2>Error: {this.state.error.message}</h2>
          <p>Please check the console (F12) for details or try refreshing.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const TradeTracker = () => {
  console.log('Rendering TradeTracker');

  // State for form inputs
  const [ticker, setTicker] = useState('');
  const [principal, setPrincipal] = useState('');
  const [premium, setPremium] = useState('');
  const [openDate, setOpenDate] = useState(() => {
    const savedDate = localStorage.getItem('openDate');
    if (savedDate && !isNaN(new Date(savedDate))) {
      console.log('Loaded openDate from localStorage:', savedDate);
      return savedDate;
    }
    return '';
  });
  const [expiryOrAssignedDate, setExpiryOrAssignedDate] = useState(() => {
    const savedDate = localStorage.getItem('expiryOrAssignedDate');
    if (savedDate && !isNaN(new Date(savedDate))) {
      console.log('Loaded expiryOrAssignedDate from localStorage:', savedDate);
      return savedDate;
    }
    return '';
  });
  const [tradeType, setTradeType] = useState('put');
  const [feeType, setFeeType] = useState('opening');

  // State for default fees
  const [defaultOpenFee, setDefaultOpenFee] = useState(() => localStorage.getItem('defaultOpenFee') || '2.00');
  const [defaultRollFee, setDefaultRollFee] = useState(() => localStorage.getItem('defaultRollFee') || '3.00');
  const [defaultStockFee, setDefaultStockFee] = useState(() => localStorage.getItem('defaultStockFee') || '2.00');

  // State for entries, sort column, sort direction, and pagination
  const [entries, setEntries] = useState([]);
  const [sortColumn, setSortColumn] = useState('openDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // State for performance summary filters
  const [weekDate, setWeekDate] = useState(() => localStorage.getItem('weekDate') || '2025-07-24');

  // State for range filters
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  // Load entries from Firestore and listen for real-time updates
  useEffect(() => {
    try {
      console.log('Setting up Firestore listener');
      const unsubscribe = onSnapshot(collection(db, 'trades'), (snapshot) => {
        const trades = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Fetched trades:', trades);
        setEntries(trades);
      }, (error) => {
        console.error('Error fetching trades:', error);
        alert('Failed to load trades. Check console for details.');
      });
      return () => {
        console.log('Cleaning up Firestore listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('Firestore initialization error:', error);
      alert('Failed to initialize Firestore. Check console for details.');
    }
  }, []);

  // Save openDate and expiryOrAssignedDate to localStorage when they change
  useEffect(() => {
    if (openDate && !isNaN(new Date(openDate))) {
      console.log('Saving openDate to localStorage:', openDate);
      localStorage.setItem('openDate', openDate);
    }
    if (expiryOrAssignedDate && !isNaN(new Date(expiryOrAssignedDate))) {
      console.log('Saving expiryOrAssignedDate to localStorage:', expiryOrAssignedDate);
      localStorage.setItem('expiryOrAssignedDate', expiryOrAssignedDate);
    }
  }, [openDate, expiryOrAssignedDate]);

  // Save weekDate to localStorage when it changes
  useEffect(() => {
    if (weekDate && !isNaN(new Date(weekDate))) {
      console.log('Saving weekDate to localStorage:', weekDate);
      localStorage.setItem('weekDate', weekDate);
    }
  }, [weekDate]);

  // Update feeType when tradeType changes
  useEffect(() => {
    setFeeType(tradeType === 'stock' ? 'stock' : 'opening');
  }, [tradeType]);

  // Save default fees to localStorage
  useEffect(() => {
    localStorage.setItem('defaultOpenFee', defaultOpenFee);
    localStorage.setItem('defaultRollFee', defaultRollFee);
    localStorage.setItem('defaultStockFee', defaultStockFee);
  }, [defaultOpenFee, defaultRollFee, defaultStockFee]);

  // Handle form submission for new trades
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !ticker ||
      !principal ||
      !premium ||
      !openDate ||
      !expiryOrAssignedDate ||
      isNaN(principal) ||
      isNaN(premium)
    ) {
      alert('Please fill in all required fields with valid values.');
      return;
    }
    const open = new Date(openDate);
    const end = new Date(expiryOrAssignedDate);
    if (open > end) {
      alert('Expiry or Assigned date must be after open date.');
      return;
    }
    const weeks = calculateWeeks(openDate, expiryOrAssignedDate);
    const fee = feeType === 'opening' ? parseFloat(defaultOpenFee) :
                feeType === 'rolling' ? parseFloat(defaultRollFee) :
                parseFloat(defaultStockFee);
    const isAssigned = false; // New trades default to not assigned
    const netProfit = (tradeType === 'stock' || isAssigned) ? 
      parseFloat(premium) - parseFloat(principal) - fee :
      parseFloat(premium) - fee;
    const weeklyReturn = netProfit / parseFloat(principal) / weeks;
    const newEntry = {
      ticker,
      principal: parseFloat(principal),
      premium: parseFloat(premium),
      fee,
      feeType,
      openDate,
      expiryOrAssignedDate,
      weeks,
      netProfit,
      weeklyReturn,
      tradeType,
      isAssigned,
    };
    try {
      console.log('Adding trade:', newEntry);
      await addDoc(collection(db, 'trades'), newEntry);
      setCurrentPage(1);
      setTicker('');
      setPrincipal('');
      setPremium('');
      setTradeType('put');
      setFeeType('opening');
    } catch (error) {
      console.error('Error adding trade:', error);
      alert('Failed to add trade. Please try again.');
    }
  };

  // Handle edit button click
  const handleEdit = (entry) => {
    setEditEntry({
      ...entry,
      principal: entry.principal.toString(),
      premium: entry.premium.toString(),
      fee: entry.fee.toString(),
    });
    setIsEditModalOpen(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (
      !editEntry.ticker ||
      !editEntry.principal ||
      !editEntry.premium ||
      !editEntry.openDate ||
      !editEntry.expiryOrAssignedDate ||
      isNaN(editEntry.principal) ||
      isNaN(editEntry.premium)
    ) {
      alert('Please fill in all required fields with valid values.');
      return;
    }
    const open = new Date(editEntry.openDate);
    const end = new Date(editEntry.expiryOrAssignedDate);
    if (open > end) {
      alert('Expiry or Assigned date must be after open date.');
      return;
    }
    const weeks = calculateWeeks(editEntry.openDate, editEntry.expiryOrAssignedDate);
    const fee = parseFloat(editEntry.fee);
    const netProfit = (editEntry.tradeType === 'stock' || editEntry.isAssigned) ?
      parseFloat(editEntry.premium) - parseFloat(editEntry.principal) - fee :
      parseFloat(editEntry.premium) - fee;
    const weeklyReturn = netProfit / parseFloat(editEntry.principal) / weeks;
    const updatedEntry = {
      ticker: editEntry.ticker,
      principal: parseFloat(editEntry.principal),
      premium: parseFloat(editEntry.premium),
      fee,
      feeType: editEntry.feeType,
      openDate: editEntry.openDate,
      expiryOrAssignedDate: editEntry.expiryOrAssignedDate,
      weeks,
      netProfit,
      weeklyReturn,
      tradeType: editEntry.tradeType,
      isAssigned: editEntry.isAssigned,
    };
    try {
      console.log('Updating trade:', updatedEntry);
      await setDoc(doc(db, 'trades', editEntry.id), updatedEntry);
      setIsEditModalOpen(false);
      setEditEntry(null);
    } catch (error) {
      console.error('Error updating trade:', error);
      alert('Failed to update trade. Please try again.');
    }
  };

  // Handle edit modal cancel
  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditEntry(null);
  };

  // Update default fees
  const handleFeeUpdate = (e) => {
    e.preventDefault();
    if (isNaN(defaultOpenFee) || isNaN(defaultRollFee) || isNaN(defaultStockFee)) {
      alert('Please enter valid numbers for default fees.');
      return;
    }
    localStorage.setItem('defaultOpenFee', defaultOpenFee);
    localStorage.setItem('defaultRollFee', defaultRollFee);
    localStorage.setItem('defaultStockFee', defaultStockFee);
    alert('Default fees updated successfully.');
  };

  // Handle entry deletion
  const deleteEntry = async (id) => {
    try {
      console.log('Deleting trade:', id);
      await deleteDoc(doc(db, 'trades', id));
      setCurrentPage(1);
    } catch (error) {
      console.error('Error deleting trade:', error);
      alert('Failed to delete trade. Please try again.');
    }
  };

  // Clear all entries
  const clearEntries = async () => {
    if (window.confirm('Are you sure you want to clear all entries?')) {
      try {
        console.log('Clearing all trades');
        const snapshot = await getDocs(collection(db, 'trades'));
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error clearing trades:', error);
        alert('Failed to clear trades. Please try again.');
      }
    }
  };

  // Sort entries
  const handleSort = (column) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    setCurrentPage(1);
  };

  const metrics = calculateMetrics(entries);
  const weekMetrics = calculateWeeklyPerformance(entries, weekDate);
  const rangeMetrics = calculateRangePerformance(entries, rangeStart, rangeEnd);

  return (
    <ErrorBoundary>
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Trade Performance Tracker
      </h1>
      <DefaultFees
        defaultOpenFee={defaultOpenFee}
        setDefaultOpenFee={setDefaultOpenFee}
        defaultRollFee={defaultRollFee}
        setDefaultRollFee={setDefaultRollFee}
        defaultStockFee={defaultStockFee}
        setDefaultStockFee={setDefaultStockFee}
        handleFeeUpdate={handleFeeUpdate}
      />
      <TradeForm
        ticker={ticker}
        setTicker={setTicker}
        principal={principal}
        setPrincipal={setPrincipal}
        premium={premium}
        setPremium={setPremium}
        openDate={openDate}
        setOpenDate={setOpenDate}
        expiryOrAssignedDate={expiryOrAssignedDate}
        setExpiryOrAssignedDate={setExpiryOrAssignedDate}
        tradeType={tradeType}
        setTradeType={setTradeType}
        feeType={feeType}
        setFeeType={setFeeType}
        defaultOpenFee={defaultOpenFee}
        defaultRollFee={defaultRollFee}
        defaultStockFee={defaultStockFee}
        handleSubmit={handleSubmit}
      />
      <PerformanceSummary
        weekDate={weekDate}
        setWeekDate={setWeekDate}
        rangeStart={rangeStart}
        setRangeStart={setRangeStart}
        rangeEnd={rangeEnd}
        setRangeEnd={setRangeEnd}
        weekMetrics={weekMetrics}
        rangeMetrics={rangeMetrics}
        metrics={metrics}
        clearEntries={clearEntries}
      />
      <WeeklyTrends entries={entries} />
      <TradeTable
        entries={entries}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        handleSort={handleSort}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        entriesPerPage={entriesPerPage}
        deleteEntry={deleteEntry}
        handleEdit={handleEdit}
      />
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Trade</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Ticker</label>
                <input
                  type="text"
                  value={editEntry.ticker}
                  onChange={(e) => setEditEntry({ ...editEntry, ticker: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Principal ($)</label>
                <input
                  type="number"
                  value={editEntry.principal}
                  onChange={(e) => setEditEntry({ ...editEntry, principal: e.target.value })}
                  className="w-full p-2 border rounded"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">{editEntry.tradeType === 'stock' ? 'Fill Amount ($)' : 'Premium ($)'}</label>
                <input
                  type="number"
                  value={editEntry.premium}
                  onChange={(e) => setEditEntry({ ...editEntry, premium: e.target.value })}
                  className="w-full p-2 border rounded"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Open Date</label>
                <input
                  type="date"
                  value={editEntry.openDate}
                  onChange={(e) => setEditEntry({ ...editEntry, openDate: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Expiry/Assigned Date</label>
                <input
                  type="date"
                  value={editEntry.expiryOrAssignedDate}
                  onChange={(e) => setEditEntry({ ...editEntry, expiryOrAssignedDate: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Trade Type</label>
                <select
                  value={editEntry.tradeType}
                  onChange={(e) => {
                    const newTradeType = e.target.value;
                    setEditEntry({
                      ...editEntry,
                      tradeType: newTradeType,
                      feeType: newTradeType === 'stock' ? 'stock' : 'opening',
                      isAssigned: newTradeType === 'stock' ? false : editEntry.isAssigned,
                    });
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="put">Put</option>
                  <option value="call">Call</option>
                  <option value="stock">Stock</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Fee Type</label>
                <select
                  value={editEntry.feeType}
                  onChange={(e) => setEditEntry({ ...editEntry, feeType: e.target.value })}
                  className="w-full p-2 border rounded"
                  disabled={editEntry.tradeType === 'stock'}
                >
                  <option value="opening">Opening (${defaultOpenFee})</option>
                  <option value="rolling">Rolling (${defaultRollFee})</option>
                  <option value="stock">Stock (${defaultStockFee})</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Fee ($)</label>
                <input
                  type="number"
                  value={editEntry.fee}
                  onChange={(e) => setEditEntry({ ...editEntry, fee: e.target.value })}
                  className="w-full p-2 border rounded"
                  step="0.01"
                  required
                />
              </div>
              {editEntry.tradeType !== 'stock' && (
                <div className="mb-4">
                  <label className="block text-gray-700">Assigned</label>
                  <div className="flex items-center">
                    <label className="mr-4">
                      <input
                        type="radio"
                        name="isAssigned"
                        value={true}
                        checked={editEntry.isAssigned === true}
                        onChange={() => setEditEntry({ ...editEntry, isAssigned: true })}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="isAssigned"
                        value={false}
                        checked={editEntry.isAssigned === false}
                        onChange={() => setEditEntry({ ...editEntry, isAssigned: false })}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default TradeTracker;