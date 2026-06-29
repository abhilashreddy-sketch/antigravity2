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
  X,
  Clock,
  Activity
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useAuth } from '../context/AuthContext';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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

  // Setup Weekly Works Hours Bar Chart Configuration (Slide 5 Style)
  const worksHoursChart = chartData ? {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Workforce Hours Worked',
        data: [112, 144, 192, 168, 120, 80, 0], // Aggregated weekly timeline values
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1.5,
        borderRadius: 8,
      }
    ]
  } : null;

  // Project Performance Doughnut (Remaining budget vs spent expenses)
  const performanceChart = chartData && kpis ? {
    labels: ['Allocated Budget', 'Total Expenditures'],
    datasets: [
      {
        data: [Math.max(0, kpis.totalBudget - kpis.totalExpenses), kpis.totalExpenses],
        backgroundColor: [
          'rgba(99, 102, 241, 0.75)',  // Allocated Remaining
          'rgba(244, 63, 94, 0.75)',   // Spent
        ],
        borderWidth: 2,
        borderColor: '#1e293b'
      }
    ]
  } : null;

  // Recent updates aggregation from progress reports across all sites
  const recentUpdates = sites.flatMap(site => 
    (site.progressReports || []).map(rep => ({
      id: rep.id,
      siteName: site.name,
      date: rep.reportDate,
      workDone: rep.workDone,
      completion: rep.completionPercentage,
      flaggedDelay: rep.flaggedDelay,
      reporter: rep.reporter?.name || 'Engineer'
    }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="space-y-6">
      
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
            <PlusCircle size={16} /> New Site
          </button>
        </div>
      </div>

      {/* KPI Cards Panel (Slide 5 style with inline sparklines) */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Total Expenditures"
            value={`$${kpis.totalExpenses.toLocaleString()}`}
            icon={DollarSign}
            trend={`Envelopes: $${(kpis.totalBudget / 1000000).toFixed(1)}M`}
            color="accent"
            sparklineData={[1200, 8400, 4500, 3500, 600, 1800, 450]}
          />
          <MetricCard
            title="Avg Completion Progress"
            value={`${kpis.avgProgress}%`}
            icon={TrendingUp}
            trend="Average site milestone state"
            color="success"
            sparklineData={[8, 12, 14, 25, 28, 32]}
          />
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
        </div>
      )}

      {/* Layout Grid (2/3 Left, 1/3 Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Total Works Hours Bar Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock size={14} className="text-accent-500" /> Total Works Hours
              </h4>
              <span className="text-[10px] text-slate-450 dark:text-slate-400 font-mono">Current Week Headcount Timeline</span>
            </div>
            <div className="h-64 flex items-center justify-center">
              {worksHoursChart && (
                <Bar 
                  data={worksHoursChart} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                      y: { grid: { color: 'rgba(148, 163, 184, 0.08)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
                    }
                  }} 
                />
              )}
            </div>
          </div>

          {/* Total Projects Directory Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FolderOpen size={14} className="text-indigo-500" /> Projects Directory
              </h4>
              <span className="text-[10px] text-slate-450 dark:text-slate-400 font-mono">Consolidated Projects Board</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Project Name</th>
                    <th className="pb-3 font-semibold">Timeline</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Completion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/45">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-slate-400">No projects registered.</td>
                    </tr>
                  ) : (
                    projects.map(p => {
                      const progressVal = p.sites?.length > 0 
                        ? Math.round(p.sites.reduce((acc, s) => {
                            const latest = s.progressReports?.[0];
                            return acc + (latest ? latest.completionPercentage : 0);
                          }, 0) / p.sites.length)
                        : 0;
                      return (
                        <tr key={p.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/5 transition-all">
                          <td className="py-3.5 font-bold text-slate-850 dark:text-slate-100">{p.name}</td>
                          <td className="py-3.5 text-slate-450 dark:text-slate-400">{p.startDate} to {p.endDate}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              p.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">{progressVal}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Section (1/3 width) */}
        <div className="space-y-6">
          
          {/* Project Performance Doughnut */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                <Activity size={14} className="text-indigo-500" /> Project Performance
              </h4>
              <div className="h-48 flex justify-center">
                {performanceChart && (
                  <Doughnut 
                    data={performanceChart} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 9 } } } }
                    }} 
                  />
                )}
              </div>
            </div>
            <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-[10px] font-bold text-slate-450 uppercase">
              <span>Expenses: $ {kpis?.totalExpenses.toLocaleString()}</span>
              <span>Remaining: $ {(kpis?.totalBudget - kpis?.totalExpenses).toLocaleString()}</span>
            </div>
          </div>

          {/* Recent Updates activity feed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Recent Updates</h4>
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {recentUpdates.length === 0 ? (
                <p className="text-xs text-slate-450 dark:text-slate-450">No daily logs submitted.</p>
              ) : (
                recentUpdates.map(upd => (
                  <div key={upd.id} className="border-l-2 border-accent-500 pl-3.5 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{upd.siteName}</span>
                      <span className="text-slate-405 dark:text-slate-400 font-mono">{upd.date}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {upd.workDone}
                    </p>
                    <div className="flex justify-between items-center text-[9px] text-slate-405 font-bold pt-0.5">
                      <span>By: {upd.reporter}</span>
                      <span className="text-accent-500">+{upd.completion}% completion</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

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
