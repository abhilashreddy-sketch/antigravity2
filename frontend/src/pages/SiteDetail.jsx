import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  FileText, 
  Layers, 
  DollarSign, 
  Sparkles,
  Camera,
  Plus,
  TrendingUp,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AIPanel from '../components/AIPanel';
import ReportForm from '../components/ReportForm';

const SiteDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Add Expense form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Materials',
    amount: '',
    description: ''
  });

  const fetchSiteDetails = async () => {
    try {
      const res = await axios.get(`/api/sites/${id}`);
      setSite(res.data);
    } catch (err) {
      console.error('Error fetching site details:', err);
      setError(err.response?.data?.message || 'Failed to load site details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSiteDetails();
    }
  }, [id]);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/sites/${id}/expenses`, expenseForm);
      setShowExpenseForm(false);
      setExpenseForm({
        date: new Date().toISOString().split('T')[0],
        category: 'Materials',
        amount: '',
        description: ''
      });
      fetchSiteDetails(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Error logging expense.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="space-y-4">
        <Link to="/sites" className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:underline">
          <ArrowLeft size={16} /> Back to sites
        </Link>
        <div className="rounded-xl bg-rose-50 p-6 text-rose-500 dark:bg-rose-950/15">{error || 'Site not found.'}</div>
      </div>
    );
  }

  const latestReport = site.progressReports && site.progressReports.length > 0 
    ? site.progressReports[0] 
    : null;
  const progress = latestReport ? latestReport.completionPercentage : 0;

  const tabs = [
    { id: 'overview', name: 'Overview & AI Audit', icon: Sparkles },
    { id: 'reports', name: 'Daily Progress Logs', icon: FileText },
    { id: 'materials', name: 'Materials Inventory', icon: Layers },
    { id: 'expenses', name: 'Expenses & Budget', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      
      {/* Upper header navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link to="/sites" className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:underline mb-2">
            <ArrowLeft size={14} /> Back to sites list
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{site.name}</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
              site.status === 'delayed' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
            }`}>
              {site.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1"><MapPin size={14} /> {site.location}</span>
            <span className="flex items-center gap-1"><User size={14} /> Assigned Engineer: {site.engineer?.name || 'Unassigned'}</span>
            <span className="flex items-center gap-1"><FolderOpen size={14} /> Project: {site.project?.name || 'Unassigned'}</span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Link 
            to="/exports"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            Export Log Center
          </Link>
        </div>
      </div>

      {/* Tabs navigation list */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all shrink-0 uppercase tracking-wider ${
              activeTab === tab.id 
                ? 'border-accent-600 text-accent-600 dark:border-accent-400 dark:text-accent-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={14} /> {tab.name}
          </button>
        ))}
      </div>

      {/* Tab panel display */}
      <div className="mt-4">
        
        {/* Tab 1: Overview and AI assessment */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Site summary card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Operational Status Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion Progress</span>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-extrabold">{progress}%</span>
                      <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-accent-600 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coordinates Link</span>
                    <div>
                      {site.latitude && site.longitude ? (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${site.latitude},${site.longitude}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs font-semibold text-accent-600 hover:underline dark:text-accent-400 inline-flex items-center gap-1"
                        >
                          View Google Map ({parseFloat(site.latitude).toFixed(4)}, {parseFloat(site.longitude).toFixed(4)})
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Coordinates not registered.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* AIPanel */}
              <AIPanel siteId={site.id} />

            </div>

            {/* Engineer report submit form column */}
            <div className="space-y-6">
              {user.role === 'engineer' && site.engineerId === user.id ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    Log Daily Construction Update
                  </h3>
                  <ReportForm 
                    siteId={site.id} 
                    initialMaterials={site.materials} 
                    onSubmitSuccess={() => {
                      fetchSiteDetails();
                      setActiveTab('reports');
                    }} 
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/20 via-white to-white p-6 dark:border-slate-800/45 dark:from-slate-900/40 dark:to-slate-900/20">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Management Auditing</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    You are viewing the site audit console. Site Engineers can log reports directly, while Project Managers and Administrators can coordinate budgets and log costs from this cockpit.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Progress Reports list */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">Daily Progress History Logs</h3>
            {site.progressReports && site.progressReports.length === 0 ? (
              <p className="text-xs text-slate-400">No daily logs submitted for this site yet.</p>
            ) : (
              <div className="space-y-6">
                {site.progressReports.map(rep => (
                  <div 
                    key={rep.id} 
                    className={`rounded-2xl border bg-white p-6 dark:bg-slate-900/40 ${
                      rep.flaggedDelay ? 'border-rose-250 dark:border-rose-950/40' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{rep.reportDate}</span>
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-500">
                          {rep.completionPercentage}% Complete
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Submitted by: {rep.reporter?.name || 'Engineer'}</span>
                        {rep.flaggedDelay && (
                          <span className="rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle size={12} /> Delay Flagged
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Accomplished</span>
                        <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed">{rep.workDone}</p>
                      </div>

                      {rep.remarks && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remarks / Obstacles</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal italic bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40 dark:bg-slate-950/20">
                            "{rep.remarks}"
                          </p>
                        </div>
                      )}

                      {/* Photo attachments */}
                      {rep.photos && rep.photos.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Camera size={12} /> Photo attachments ({rep.photos.length})
                          </span>
                          
                          {/* Carousel list or simple image grid */}
                          <div className="flex flex-wrap gap-3">
                            {rep.photos.map(photo => (
                              <div key={photo.id} className="relative h-28 w-40 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-850">
                                <img 
                                  src={`${axios.defaults.baseURL || ''}/${photo.photoUrl}`} 
                                  alt="Construction site report attachment" 
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    // Fallback to dummy construction image
                                    e.target.src = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Materials table */}
        {activeTab === 'materials' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">Site Materials stock levels</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
              <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-850/40 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Material Name</th>
                    <th className="px-6 py-4">Measurement Unit</th>
                    <th className="px-6 py-4">Total Received</th>
                    <th className="px-6 py-4">Total Consumed</th>
                    <th className="px-6 py-4">Current stock Balance</th>
                    <th className="px-6 py-4">Status Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {site.materials && site.materials.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-xs text-slate-400">
                        No materials logged or tracked at this site.
                      </td>
                    </tr>
                  ) : (
                    site.materials.map(mat => {
                      const bal = parseFloat(mat.balance);
                      const rec = parseFloat(mat.received);
                      const isLow = rec > 0 && (bal / rec) < 0.15;
                      
                      return (
                        <tr key={mat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{mat.name}</td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-500">{mat.unit}</td>
                          <td className="px-6 py-4 font-mono font-medium">{rec.toFixed(1)}</td>
                          <td className="px-6 py-4 font-mono font-medium">{parseFloat(mat.used).toFixed(1)}</td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-850 dark:text-slate-100">{bal.toFixed(1)}</td>
                          <td className="px-6 py-4">
                            {isLow ? (
                              <span className="inline-flex rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                Critical Stock Low
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                Stock Adequate
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Expenses cost logs */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">Financial Expenditures Log</h3>
                <p className="text-xs text-slate-500">Expenses breakdown recorded at site</p>
              </div>

              {(user.role === 'admin' || user.role === 'manager') && (
                <button
                  onClick={() => setShowExpenseForm(!showExpenseForm)}
                  className="flex items-center gap-1.5 rounded-xl bg-accent-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-700 shadow-lg shadow-accent-600/15 transition-all"
                >
                  <Plus size={16} /> Log New Expenditure
                </button>
              )}
            </div>

            {showExpenseForm && (
              <form onSubmit={handleExpenseSubmit} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/20 space-y-4 max-w-lg">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">New Expenditure Entry</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Expense Date</label>
                    <input
                      type="date"
                      required
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                    >
                      <option value="Materials">Materials</option>
                      <option value="Labour">Labour</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Transport">Transport</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Amount (USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="E.g. 1500.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Description Details</label>
                  <input
                    type="text"
                    required
                    placeholder="Aggregate Concrete supply or welder extra shift logs..."
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-lg bg-accent-600 px-4 py-2 text-xs font-bold text-white hover:bg-accent-700"
                >
                  Log Expense
                </button>
              </form>
            )}

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
              <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-850/40 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Expense Date</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Amount Cost</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {site.expenses && site.expenses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-xs text-slate-400">
                        No expenses logged for this construction site.
                      </td>
                    </tr>
                  ) : (
                    site.expenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-350">{exp.date}</td>
                        <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{exp.category}</td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-850 dark:text-slate-100">$ {parseFloat(exp.amount).toFixed(2)}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{exp.description || 'N/A'}</td>
                        <td className="px-6 py-4 text-xs text-slate-400">{exp.logger?.name || 'Management'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default SiteDetail;
