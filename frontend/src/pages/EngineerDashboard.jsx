import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HardHat, Calendar, CheckCircle2, ChevronRight, AlertTriangle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EngineerDashboard = () => {
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sitesRes = await axios.get('/api/sites');
        setSites(sitesRes.data);

        // Fetch reports for all assigned sites
        const allReports = [];
        for (const site of sitesRes.data) {
          const repRes = await axios.get(`/api/reports/site/${site.id}`);
          allReports.push(...repRes.data.map(r => ({ ...r, siteName: site.name })));
        }
        
        // Sort reports by date
        allReports.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
        setRecentReports(allReports.slice(0, 5));
      } catch (err) {
        console.error('Error fetching engineer data:', err);
        setError('Failed to load dashboard logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Pending tasks mock logs
  const pendingTasks = [
    { id: 1, text: 'Log Daily Progress Report for active sites', completed: false },
    { id: 2, text: 'Verify Aggregate Sand and Cement inventory stocks', completed: false },
    { id: 3, text: 'Confirm masonry and weld team headcounts', completed: true },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <HardHat className="text-accent-600" /> Engineer Field Console
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Welcome back, {user.name}. Manage daily logs and report updates below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Assigned Sites */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Your Assigned Construction Sites
            </h3>

            {sites.length === 0 ? (
              <p className="text-xs text-slate-400">You are not currently assigned to any active sites.</p>
            ) : (
              <div className="space-y-4">
                {sites.map(site => (
                  <div 
                    key={site.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800/40 dark:bg-slate-900/20 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{site.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{site.location}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        site.status === 'delayed' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {site.status}
                      </span>
                      <Link
                        to={`/sites/${site.id}`}
                        className="flex items-center gap-1 text-xs font-bold text-accent-600 hover:text-accent-700 dark:text-accent-400"
                      >
                        Submit Logs <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent progress reports */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Recent Submissions History
            </h3>

            {recentReports.length === 0 ? (
              <p className="text-xs text-slate-400">No reports logged recently.</p>
            ) : (
              <div className="space-y-4">
                {recentReports.map(rep => (
                  <div key={rep.id} className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {rep.siteName}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar size={12} /> {rep.reportDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{rep.workDone}</p>
                      <div className="flex gap-2.5 pt-1">
                        <span className="text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                          {rep.completionPercentage}% Complete
                        </span>
                        {rep.flaggedDelay && (
                          <span className="text-[9px] font-bold uppercase bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <AlertTriangle size={10} /> Delayed Flagged
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right column: Checklist Tasks */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Pending Field Audits
            </h3>
            
            <ul className="space-y-3.5">
              {pendingTasks.map(task => (
                <li key={task.id} className="flex items-start gap-3 text-xs">
                  <div className={`mt-0.5 shrink-0 ${task.completed ? 'text-emerald-500' : 'text-slate-350'}`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span className={`${task.completed ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                    {task.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick instructions alert */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/20 via-white to-white p-6 shadow-premium dark:border-slate-800/40 dark:from-slate-900/40 dark:to-slate-900/20">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Audit Regulations</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Construction updates are synced instantly to management control rooms. Make sure to attach on-site photos and input exact labor work-hours to enable proper AI risk-modelling!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EngineerDashboard;
