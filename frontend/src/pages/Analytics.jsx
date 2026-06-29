import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  Layers, 
  DollarSign, 
  Users, 
  ArrowRight,
  HardHat,
  Calendar
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [chartData, setChartData] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');

  const fetchAnalytics = async () => {
    try {
      const [chartRes, kpiRes, sitesRes] = await Promise.all([
        axios.get('/api/analytics/charts'),
        axios.get('/api/analytics/kpis'),
        axios.get('/api/sites')
      ]);
      setChartData(chartRes.data);
      setKpis(kpiRes.data);
      setSites(sitesRes.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div className="rounded-2xl bg-rose-50 p-6 text-rose-500 dark:bg-rose-950/15">
        {error || 'Error loading dashboard datasets.'}
      </div>
    );
  }

  // Setup Charts configurations
  const materialChart = {
    labels: chartData.materials.map(m => m.name),
    datasets: [
      {
        label: 'Received Stock',
        data: chartData.materials.map(m => m.received),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Used Stock',
        data: chartData.materials.map(m => m.used),
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderColor: 'rgb(244, 63, 94)',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Current Balance',
        data: chartData.materials.map(m => m.balance),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1.5,
        borderRadius: 6,
      }
    ]
  };

  const expenseChart = {
    labels: chartData.expenses.map(e => e.category),
    datasets: [
      {
        data: chartData.expenses.map(e => e.amount),
        backgroundColor: [
          'rgba(99, 102, 241, 0.75)',  // Materials
          'rgba(16, 185, 129, 0.75)',  // Labour
          'rgba(245, 158, 11, 0.75)',  // Equipment
          'rgba(14, 165, 233, 0.75)',  // Transport
          'rgba(244, 63, 94, 0.75)',   // Misc
        ],
        borderWidth: 1.5,
        borderColor: '#1e293b'
      }
    ]
  };

  const laborChart = {
    labels: chartData.laborTimeline.map(l => l.date),
    datasets: [
      {
        label: 'Active Workforce Count',
        data: chartData.laborTimeline.map(l => l.headcount),
        fill: true,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        borderWidth: 2.5,
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          Analytics Control Console
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Live statistics, materials inventory, and expenses auditing datasets
        </p>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Material Stock Levels (2/3 width) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers size={14} className="text-accent-500" /> Material Stock Levels
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Consolidated Stock Summary</span>
          </div>
          <div className="h-72 flex items-center justify-center">
            <Bar data={materialChart} options={{ 
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                y: { grid: { color: 'rgba(148, 163, 184, 0.08)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
              }
            }} />
          </div>
        </div>

        {/* Expenses categories (1/3 width) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-500" /> Expense Cost Distribution
            </h3>
            <div className="h-52 flex justify-center">
              <Doughnut data={expenseChart} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 9 } } } }
              }} />
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-xs font-bold text-slate-500">
            <span>Expenses: $ {kpis?.totalExpenses.toLocaleString()}</span>
            <span>Allocated: $ {kpis?.totalBudget.toLocaleString()}</span>
          </div>
        </div>

        {/* Labor Force Attendance (Full width) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users size={14} className="text-indigo-500" /> Daily Workforce Attendance Trend
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Consolidated Attendance Logs</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Line data={laborChart} options={{ 
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                y: { grid: { color: 'rgba(148, 163, 184, 0.08)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
              }
            }} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
