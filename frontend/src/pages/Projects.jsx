import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderOpen, Calendar, DollarSign, Plus, X, Building2, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProjModal, setShowProjModal] = useState(false);
  const [projForm, setProjForm] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'active'
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load project database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', projForm);
      setShowProjModal(false);
      setProjForm({ name: '', description: '', budget: '', startDate: '', endDate: '', status: 'active' });
      fetchProjects();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Projects Workspace
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Coordinate construction portfolios, budget allocation envelopes, and schedules
          </p>
        </div>

        {(user.role === 'admin' || user.role === 'manager') && (
          <button
            onClick={() => setShowProjModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-accent-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-700 shadow-lg shadow-accent-600/15 transition-all"
          >
            <Plus size={16} /> Create Project
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 p-6 text-rose-500 dark:bg-rose-950/15">{error}</div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 ? (
          <div className="md:col-span-2 text-center py-12 text-slate-400 text-sm">
            No projects registered in the workspace. Click "Create Project" to get started.
          </div>
        ) : (
          projects.map(project => {
            const budgetUsed = project.sites?.reduce((acc, site) => {
              return acc + (site.expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0);
            }, 0) || 0;
            const progressVal = project.sites?.length > 0
              ? Math.round(project.sites.reduce((acc, site) => {
                  const latest = site.progressReports?.[0];
                  return acc + (latest ? latest.completionPercentage : 0);
                }, 0) / project.sites.length)
              : 0;

            return (
              <div key={project.id} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40 space-y-4 hover:border-slate-350 dark:hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">{project.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">Status: <span className="uppercase text-accent-500 font-semibold">{project.status}</span></p>
                  </div>
                  <div className="rounded-xl bg-accent-100 p-2.5 text-accent-700 dark:bg-accent-950 dark:text-accent-300">
                    <FolderOpen size={20} />
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[3rem]">
                  {project.description || 'No description logged.'}
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/40 pt-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Allocated Budget</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                      <DollarSign size={14} className="text-slate-400" />
                      {parseFloat(project.budget).toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Timeline Schedule</span>
                    <span className="text-xs font-semibold text-slate-650 dark:text-slate-300 flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      {project.startDate} to {project.endDate}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Average Site Completion</span>
                    <span>{progressVal}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-600 rounded-full" style={{ width: `${progressVal}%` }}></div>
                  </div>
                </div>

                {project.sites && project.sites.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Registered Sites ({project.sites.length})</span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.sites.map(site => (
                        <span key={site.id} className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-950/20 dark:border-slate-800 dark:text-slate-400">
                          <Building2 size={10} /> {site.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Project Creation */}
      {showProjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Create Construction Project</h4>
              <button onClick={() => setShowProjModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
                  rows={2.5}
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

export default Projects;
