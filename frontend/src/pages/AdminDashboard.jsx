import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  PlusCircle, 
  HardHat,
  AlertTriangle,
  FolderOpen,
  Calendar,
  X
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import SiteCard from '../components/SiteCard';
import { useAuth } from '../context/AuthContext';

// Chart.js imports
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

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Dashboard Metrics state
  const [kpis, setKpis] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [sites, setSites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);
  
  // Forms State
  const [siteForm, setSiteForm] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    projectId: '',
    engineerId: '',
    status: 'active'
  });

  const [projForm, setProjForm] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'active'
  });

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, chartRes, sitesRes, projRes, usersRes] = await Promise.all([
        axios.get('/api/analytics/kpis'),
        axios.get('/api/analytics/charts'),
        axios.get('/api/sites'),
        axios.get('/api/projects'),
        axios.get('/api/auth/users'),
      ]);

      setKpis(kpiRes.data);
      setChartData(chartRes.data);
      setSites(sitesRes.data);
      setProjects(projRes.data);
      setEngineers(usersRes.data.filter(u => u.role === 'engineer'));
    } catch (err) {
      console.error('Error loading dashboard analytics:', err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateSite = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/sites', siteForm);
      setShowSiteModal(false);
      setSiteForm({ name: '', location: '', latitude: '', longitude: '', projectId: '', engineerId: '', status: 'active' });
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating site.');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', projForm);
      setShowProjModal(false);
      setProjForm({ name: '', description: '', budget: '', startDate: '', endDate: '', status: 'active' });
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Setup Charts configurations
  const materialChart = chartData ? {
    labels: chartData.materials.map(m => m.name),
    datasets: [
      {
        label: 'Received Stock',
        data: chartData.materials.map(m => m.received),
        backgroundColor: 'rgba(99, 102, 241, 0.65)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
      {
        label: 'Used Stock',
        data: chartData.materials.map(m => m.used),
        backgroundColor: 'rgba(244, 63, 94, 0.65)',
        borderColor: 'rgb(244, 63, 94)',
        borderWidth: 1,
      },
      {
        label: 'Current Balance',
        data: chartData.materials.map(m => m.balance),
        backgroundColor: 'rgba(16, 185, 129, 0.65)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      }
    ]
  } : null;

  const expenseChart = chartData ? {
    labels: chartData.expenses.map(e => e.category),
    datasets: [
      {
        data: chartData.expenses.map(e => e.amount),
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',  // Materials
          'rgba(16, 185, 129, 0.7)',  // Labour
          'rgba(245, 158, 11, 0.7)',  // Equipment
          'rgba(14, 165, 233, 0.7)',  // Transport
          'rgba(244, 63, 94, 0.7)',   // Misc
        ],
        borderWidth: 2,
        borderColor: '#1e293b'
      }
    ]
  } : null;

  const laborChart = chartData ? {
    labels: chartData.laborTimeline.map(l => l.date),
    datasets: [
      {
        label: 'Active Workforce Count',
        data: chartData.laborTimeline.map(l => l.headcount),
        fill: true,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        tension: 0.35,
        pointBackgroundColor: 'rgb(99, 102, 241)',
      }
    ]
  } : null;

  return (
    <div className="space-y-8">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Control Room Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Construction tracking, scheduling, and live operations summary
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProjModal(true)}
            className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <FolderOpen size={16} /> New Project
          </button>
          <button
            onClick={() => setShowSiteModal(true)}
            className="flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-700 shadow-lg shadow-accent-600/15 transition-all"
          >
            <PlusCircle size={16} /> New Construction Site
          </button>
        </div>
      </div>

      {/* KPI Cards Panel */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Total Active Sites"
            value={kpis.totalSites}
            icon={Building2}
            trend={`${kpis.activeSites} running, ${kpis.completedSites} completed`}
            color="accent"
          />
          <MetricCard
            title="Delay Warnings Flagged"
            value={kpis.delayedSites}
            icon={AlertTriangle}
            trend={kpis.delayedSites > 0 ? `${kpis.delayedSites} site(s) requiring attention` : 'All sites on schedule'}
            color={kpis.delayedSites > 0 ? 'danger' : 'success'}
          />
          <MetricCard
            title="Total Allocated Budget"
            value={`$${(kpis.totalBudget / 1000000).toFixed(2)}M`}
            icon={DollarSign}
            trend="Global project envelopes"
            color="accent"
          />
          <MetricCard
            title="Avg Completion Progress"
            value={`${kpis.avgProgress}%`}
            icon={TrendingUp}
            trend={`Total Spent: $${(kpis.totalExpenses / 1000).toFixed(0)}k`}
            color="success"
          />
        </div>
      )}

      {/* Charts Panel */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Material Stock Levels */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4">Material Inventory Balances</h4>
            {materialChart && <Bar data={materialChart} options={{ responsive: true }} />}
          </div>

          {/* Expenses categories */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4 font-sans">Expense Distribution Cost</h4>
              {expenseChart && (
                <div className="max-h-56 flex justify-center">
                  <Doughnut data={expenseChart} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              )}
            </div>
            <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-xs font-semibold text-slate-500">
              <span>Expenses: $ {kpis?.totalExpenses.toLocaleString()}</span>
              <span>Budget: $ {kpis?.totalBudget.toLocaleString()}</span>
            </div>
          </div>

          {/* Labor Force Attendance */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4">Daily Workforce Headcount Trend</h4>
            {laborChart && <Line data={laborChart} options={{ responsive: true }} />}
          </div>
        </div>
      )}

      {/* Sites Listing Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">Construction Sites Overview</h3>
        {sites.length === 0 ? (
          <p className="text-xs text-slate-400">No construction sites recorded. Click "New Site" to create one.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map(site => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Add New Site */}
      {showSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Add Construction Site</h4>
              <button onClick={() => setShowSiteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Site Name</label>
                <input
                  type="text"
                  required
                  value={siteForm.name}
                  onChange={(e) => setSiteForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Phase 1 - Concrete Foundation"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location Description</label>
                <input
                  type="text"
                  required
                  value={siteForm.location}
                  onChange={(e) => setSiteForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Downtown Sector C, Block 12"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={siteForm.latitude}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="41.8781"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={siteForm.longitude}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="-87.6298"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Associated Project</label>
                <select
                  required
                  value={siteForm.projectId}
                  onChange={(e) => setSiteForm(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Site Engineer</label>
                <select
                  required
                  value={siteForm.engineerId}
                  onChange={(e) => setSiteForm(prev => ({ ...prev, engineerId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">Select Engineer</option>
                  {engineers.map(eng => (
                    <option key={eng.id} value={eng.id}>{eng.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-accent-600 py-3 text-sm font-bold text-white hover:bg-accent-700 transition-all"
              >
                Create Construction Site
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add New Project */}
      {showProjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Create Construction Project</h4>
              <button onClick={() => setShowProjModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Name</label>
                <input
                  type="text"
                  required
                  value={projForm.name}
                  onChange={(e) => setProjForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Metropolitan Commercial Center"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={projForm.description}
                  onChange={(e) => setProjForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Summarize architectural scope of building..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget Limit (USD)</label>
                <input
                  type="number"
                  required
                  value={projForm.budget}
                  onChange={(e) => setProjForm(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="5000000"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    required
                    value={projForm.startDate}
                    onChange={(e) => setProjForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date (Expected)</label>
                  <input
                    type="date"
                    required
                    value={projForm.endDate}
                    onChange={(e) => setProjForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-accent-600 py-3 text-sm font-bold text-white hover:bg-accent-700 transition-all"
              >
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
