export const calculateWeeks = (openDate, expiryOrAssignedDate) => {
  try {
    const open = new Date(openDate);
    const end = new Date(expiryOrAssignedDate);
    if (isNaN(open) || isNaN(end)) return 1;
    const diffTime = Math.abs(end - open);
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Math.max(1, diffWeeks);
  } catch (e) {
    console.error('Error calculating weeks:', e);
    return 1;
  }
};

export const calculateMetrics = (entries) => {
  try {
    if (entries.length === 0) {
      return {
        totalPrincipal: '0.00',
        totalNetProfit: '0.00',
        totalReturn: '0.00',
        annualizedReturn: '0.00',
        totalTrades: 0,
        totalWeeks: 0,
      };
    }
    const totalPrincipal = entries.reduce((sum, entry) => sum + entry.principal, 0);
    const totalNetProfit = entries.reduce((sum, entry) => sum + entry.netProfit, 0);
    const dates = entries.map(entry => ({
      open: new Date(entry.openDate),
      end: new Date(entry.expiryOrAssignedDate),
    }));
    const earliestOpen = new Date(Math.min(...dates.map(d => d.open)));
    const latestEnd = new Date(Math.max(...dates.map(d => d.end)));
    const diffTime = Math.abs(latestEnd - earliestOpen);
    const totalWeeks = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)));
    const totalReturn = totalPrincipal > 0 ? (totalNetProfit / totalPrincipal) * 100 : 0;
    const annualizedReturn = totalWeeks > 0 ? (totalNetProfit / totalPrincipal) * (52 / totalWeeks) * 100 : 0;
    return {
      totalPrincipal: totalPrincipal.toFixed(2),
      totalNetProfit: totalNetProfit.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      annualizedReturn: annualizedReturn.toFixed(2),
      totalTrades: entries.length,
      totalWeeks,
    };
  } catch (e) {
    console.error('Error calculating metrics:', e);
    return {
      totalPrincipal: '0.00',
      totalNetProfit: '0.00',
      totalReturn: '0.00',
      annualizedReturn: '0.00',
      totalTrades: 0,
      totalWeeks: 0,
    };
  }
};

export const calculateWeeklyPerformance = (entries, selectedDate) => {
  if (!selectedDate) return { weekPrincipal: '0.00', weekProfit: '0.00', weekROI: '0.00', tradeCount: 0 };
  try {
    const date = new Date(selectedDate);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - (date.getDay() || 7) + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    let weekPrincipal = 0;
    let weekProfit = 0;
    let tradeCount = 0;
    entries.forEach(entry => {
      const open = new Date(entry.openDate);
      const end = new Date(entry.expiryOrAssignedDate);
      // Include principal and prorated profit if active during the week
      if (open <= weekEnd && end >= weekStart) {
        weekPrincipal += entry.principal;
        const weeks = entry.weeks || 1;
        weekProfit += entry.netProfit / weeks;
      }
      // Count trades opened in the week
      if (open >= weekStart && open <= weekEnd) {
        tradeCount += 1;
      }
    });
    const weekROI = weekPrincipal > 0 ? (weekProfit / weekPrincipal) * 100 : 0;
    return {
      weekPrincipal: weekPrincipal.toFixed(2),
      weekProfit: weekProfit.toFixed(2),
      weekROI: weekROI.toFixed(2),
      tradeCount,
    };
  } catch (e) {
    console.error('Error calculating weekly performance:', e);
    return { weekPrincipal: '0.00', weekProfit: '0.00', weekROI: '0.00', tradeCount: 0 };
  }
};

export const calculateRangePerformance = (entries, start, end) => {
  if (!start || !end) return { rangePrincipal: '0.00', rangeProfit: '0.00', rangeROI: '0.00', tradeCount: 0 };
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate > endDate) return { rangePrincipal: '0.00', rangeProfit: '0.00', rangeROI: '0.00', tradeCount: 0 };
    const rangeEntries = entries.filter(entry => {
      const open = new Date(entry.openDate);
      return open >= startDate && open <= endDate;
    });
    const rangePrincipal = rangeEntries.reduce((sum, entry) => sum + entry.principal, 0);
    const rangeProfit = rangeEntries.reduce((sum, entry) => sum + entry.netProfit, 0);
    const rangeROI = rangePrincipal > 0 ? (rangeProfit / rangePrincipal) * 100 : 0;
    return {
      rangePrincipal: rangePrincipal.toFixed(2),
      rangeProfit: rangeProfit.toFixed(2),
      rangeROI: rangeROI.toFixed(2),
      tradeCount: rangeEntries.length,
    };
  } catch (e) {
    console.error('Error calculating range performance:', e);
    return { rangePrincipal: '0.00', rangeProfit: '0.00', rangeROI: '0.00', tradeCount: 0 };
  }
};

export const calculateWeeklyTrends = (entries) => {
  const weeks = {};
  entries.forEach(entry => {
    const open = new Date(entry.openDate);
    const end = new Date(entry.expiryOrAssignedDate);
    const weekStart = new Date(open);
    weekStart.setDate(open.getDate() - (open.getDay() || 7) + 1);
    const weekEnd = new Date(end);
    weekEnd.setDate(end.getDate() - (end.getDay() || 7) + 1);
    let currentWeek = new Date(weekStart);
    const weeksCount = entry.weeks || 1;
    const weeklyProfit = entry.netProfit / weeksCount;
    while (currentWeek <= weekEnd) {
      const weekKey = currentWeek.toISOString().split('T')[0];
      if (!weeks[weekKey]) {
        weeks[weekKey] = { principal: 0, profit: 0 };
      }
      weeks[weekKey].principal += entry.principal;
      weeks[weekKey].profit += weeklyProfit;
      currentWeek.setDate(currentWeek.getDate() + 7);
    }
  });
  return Object.keys(weeks)
    .sort()
    .map(week => ({
      week,
      principal: weeks[week].principal,
      profit: weeks[week].profit,
      roi: weeks[week].principal > 0 ? (weeks[week].profit / weeks[week].principal) * 100 : 0,
    }));
};