import React, { useState, useEffect, useRef } from 'react';
import DefaultFees from './DefaultFees';
import TradeForm from './TradeForm';
import PerformanceSummary from './PerformanceSummary';
import WeeklyTrends from './WeeklyTrends';
import TradeTable from './TradeTable';
import { calculateWeeks, calculateMetrics, calculateWeeklyPerformance, calculateRangePerformance, calculateWeeklyTrends } from '../utils/calculations';

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
  const [openDate, setOpenDate] = useState('');
  const [expiryOrAssignedDate, setExpiryOrAssignedDate] = useState('');
  const [tradeType, setTradeType] = useState('put');
  const [feeType, setFeeType] = useState('opening');

  // State for default fees
  const [defaultOpenFee, setDefaultOpenFee] = useState(() => localStorage.getItem('defaultOpenFee') || '2.00');
  const [defaultRollFee, setDefaultRollFee] = useState(() => localStorage.getItem('defaultRollFee') || '3.00');
  const [defaultStockFee, setDefaultStockFee] = useState(() => localStorage.getItem('defaultStockFee') || '2.00');

  // State for entries, sort column, sort direction, and pagination
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('tradeEntries');
    return saved ? JSON.parse(saved) : [];
  });
  const [sortColumn, setSortColumn] = useState('openDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // State for performance summary filters
  const [weekDate, setWeekDate] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  // Update feeType when tradeType changes
  useEffect(() => {
    setFeeType(tradeType === 'stock' ? 'stock' : 'opening');
  }, [tradeType]);

  // Save entries and fees to localStorage
  useEffect(() => {
    localStorage.setItem('tradeEntries', JSON.stringify(entries));
    localStorage.setItem('defaultOpenFee', defaultOpenFee);
    localStorage.setItem('defaultRollFee', defaultRollFee);
    localStorage.setItem('defaultStockFee', defaultStockFee);
  }, [entries, defaultOpenFee, defaultRollFee, defaultStockFee]);

  // Handle form submission
  const handleSubmit = (e) => {
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
    const netProfit = parseFloat(premium) - fee;
    const weeklyReturn = netProfit / parseFloat(principal) / weeks;
    const newEntry = {
      id: Date.now(),
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
    };
    setEntries([...entries, newEntry]);
    setCurrentPage(1);
    setTicker('');
    setPrincipal('');
    setPremium('');
    setOpenDate('');
    setExpiryOrAssignedDate('');
    setTradeType('put');
    setFeeType('opening');
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
  const deleteEntry = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
    setCurrentPage(1);
  };

  // Clear all entries
  const clearEntries = () => {
    if (window.confirm('Are you sure you want to clear all entries?')) {
      setEntries([]);
      setCurrentPage(1);
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
      />
    </ErrorBoundary>
  );
};

export default TradeTracker;