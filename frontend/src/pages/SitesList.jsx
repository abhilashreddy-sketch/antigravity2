import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, HardHat, ExternalLink, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const SitesList = () => {
  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await axios.get('/api/sites');
        setSites(res.data);
      } catch (err) {
        console.error('Error fetching sites:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20';
      case 'delayed':
        return 'text-rose-500 bg-rose-500/10 border border-rose-500/20';
      case 'suspended':
        return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
      default:
        return 'text-blue-500 bg-blue-500/10 border border-blue-500/20';
    }
  };

  const filteredSites = sites.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.location.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

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
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          Construction Sites List
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Search and oversee site status parameters and engineers assigned
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search site or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-250 bg-slate-50/50 py-2 pl-9 pr-4 text-xs focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-slate-800 dark:bg-slate-950"
          />
        </div>

        <div className="flex gap-2 items-center w-full sm:w-auto shrink-0 justify-end">
          <Filter size={14} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-250 bg-slate-50/50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-950 font-semibold text-slate-650"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="delayed">Delayed</option>
            <option value="completed">Completed</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Interactive table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
        <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-850/40 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4">Site Name</th>
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Assigned Engineer</th>
              <th className="px-6 py-4">Coordinates</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSites.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-xs text-slate-400">
                  No active construction sites match your filter credentials.
                </td>
              </tr>
            ) : (
              filteredSites.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{s.name}</div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <MapPin size={10} /> {s.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {s.project?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-50 text-[10px] font-bold text-accent-700 dark:bg-accent-950 dark:text-accent-300">
                        {s.engineer?.name ? s.engineer.name.charAt(0) : '?'}
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">{s.engineer?.name || 'Not Assigned'}</div>
                        <div className="text-[10px] text-slate-400">{s.engineer?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400">
                    {s.latitude && s.longitude ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-accent-600 hover:underline dark:text-accent-400"
                      >
                        {parseFloat(s.latitude).toFixed(4)}, {parseFloat(s.longitude).toFixed(4)} <ExternalLink size={12} />
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getStatusStyle(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/sites/${s.id}`}
                      className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-accent-600 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-accent-600 dark:hover:text-white transition-all"
                    >
                      Audit View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default SitesList;
