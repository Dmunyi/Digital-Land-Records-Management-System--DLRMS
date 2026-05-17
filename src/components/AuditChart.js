/**
 * AuditChart
 * Renders audit statistics as a chart using Chart.js (via react-chartjs-2)
 */
import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { auditAPI } from '../services/api';
import './AuditChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

function AuditChart({ days = 30, action = '', compareAction = '', chartType = 'bar' }) {
  const [loading, setLoading] = useState(false);
  const [actionLabels, setActionLabels] = useState([]);
  const [actionValues, setActionValues] = useState([]);
  const [trendLabels, setTrendLabels] = useState([]);
  const [trendDatasets, setTrendDatasets] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, action, compareAction]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const selectedActions = [...new Set([action, compareAction].filter(Boolean))];
      const params = { days };
      if (selectedActions.length > 1) {
        params.actions = selectedActions.join(',');
      } else if (selectedActions.length === 1) {
        params.action = selectedActions[0];
      }

      const res = await auditAPI.getAuditStatistics(params);
      const actionStats = res.data.data.actionStats || [];
      const dailyStats = res.data.data.dailyStats || [];
      const dailyActionStats = res.data.data.dailyActionStats || [];

      setActionLabels(actionStats.map((s) => s._id || 'UNKNOWN'));
      setActionValues(actionStats.map((s) => s.count || 0));

      const labels = dailyStats.map((s) =>
        new Date(`${s._id}T00:00:00`).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })
      );
      setTrendLabels(labels);

      const compareColors = ['#1f6feb', '#ff6f3c', '#2ca58d', '#8e44ad'];

      if (dailyActionStats.length > 1) {
        setTrendDatasets(
          dailyActionStats.map((series, index) => ({
            label: `${series.action} actions per day`,
            data: (series.data || []).map((point) => point.count || 0),
            borderColor: compareColors[index % compareColors.length],
            backgroundColor: `${compareColors[index % compareColors.length]}22`,
            pointBackgroundColor: compareColors[index % compareColors.length],
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false,
            tension: 0.35,
          }))
        );
      } else {
        setTrendDatasets([
          {
            label: selectedActions[0] ? `${selectedActions[0]} actions per day` : 'Actions per day',
            data: dailyStats.map((s) => s.count || 0),
            borderColor: '#1f6feb',
            backgroundColor: 'rgba(31, 111, 235, 0.16)',
            pointBackgroundColor: '#1f6feb',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.35,
          },
        ]);
      }
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pieBarData = {
    labels: actionLabels,
    datasets: [
      {
        label: `Actions (${days} days)`,
        data: actionValues,
        backgroundColor: [
          '#3498db',
          '#27ae60',
          '#f39c12',
          '#e74c3c',
          '#9b59b6',
          '#95a5a6',
          '#16a085',
          '#34495e',
        ],
        borderColor: '#ffffff00',
        borderRadius: chartType === 'bar' ? 8 : 0,
        maxBarThickness: 36,
      },
    ],
  };

  const lineData = {
    labels: trendLabels,
    datasets: trendDatasets,
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: chartType !== 'pie',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y ?? context.parsed} actions`,
        },
      },
    },
  };

  const lineOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        grid: {
          color: 'rgba(27, 31, 35, 0.08)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const pieOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };

  const hasActionData = actionLabels.length > 0;
  const hasTrendData = trendLabels.length > 0 && trendDatasets.length > 0;
  const hasData = chartType === 'line' ? hasTrendData : hasActionData;
  const primaryTrend = trendDatasets[0]?.data || [];
  const totalActions = primaryTrend.reduce((sum, value) => sum + value, 0);
  const peakValue = primaryTrend.length ? Math.max(...primaryTrend) : 0;

  if (loading) return <div className="chart-loading">Loading chart...</div>;
  if (error) return <div className="chart-error">{error}</div>;
  if (!hasData) return <div className="chart-empty">No data to display.</div>;

  return (
    <div className="audit-chart">
      {chartType === 'line' && (
        <div className="chart-summary">
          <span className="summary-chip">Total: {totalActions}</span>
          <span className="summary-chip">Peak/day: {peakValue}</span>
          <span className="summary-chip">Window: {days} days</span>
        </div>
      )}

      <div className="chart-canvas-wrap">
        {chartType === 'bar' && <Bar data={pieBarData} options={barOptions} />}
        {chartType === 'line' && <Line data={lineData} options={lineOptions} />}
        {chartType === 'pie' && <Pie data={pieBarData} options={pieOptions} />}
      </div>
    </div>
  );
}

export default AuditChart;
