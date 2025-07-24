import React, { useEffect, useRef } from 'react';
import { calculateWeeklyTrends } from '../utils/calculations';
import Chart from 'chart.js/auto';

const WeeklyTrends = ({ entries }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const weeklyTrends = calculateWeeklyTrends(entries);
      const labels = weeklyTrends.map(trend => trend.week);
      const principalData = weeklyTrends.map(trend => trend.principal);
      const profitData = weeklyTrends.map(trend => trend.profit);
      const roiData = weeklyTrends.map(trend => trend.roi);

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Weekly ROI (%)',
              data: roiData,
              borderColor: 'rgba(75, 192, 192, 1)',
              yAxisID: 'yROI',
              fill: false,
            },
            {
              label: 'Weekly Principal ($)',
              data: principalData,
              borderColor: 'rgba(54, 162, 235, 1)',
              yAxisID: 'yAmount',
              fill: false,
            },
            {
              label: 'Weekly Profit ($)',
              data: profitData,
              borderColor: 'rgba(255, 99, 132, 1)',
              yAxisID: 'yAmount',
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            yROI: {
              type: 'linear',
              display: true,
              position: 'left',
              title: { display: true, text: 'ROI (%)' },
            },
            yAmount: {
              type: 'linear',
              display: true,
              position: 'right',
              title: { display: true, text: 'Amount ($)' },
              grid: { drawOnChartArea: false },
            },
          },
          plugins: {
            legend: { display: true },
            tooltip: { mode: 'index', intersect: false },
          },
        },
      });
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Weekly Performance Trends</h2>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default WeeklyTrends;