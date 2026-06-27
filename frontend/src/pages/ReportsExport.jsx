import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileDown, Calendar, FileSpreadsheet, HardHat, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReportsExport = () => {
  const { token } = useAuth();
  const [sites, setSites] = useState([]);
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
          Operational Reports Center
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Generate and download operational reports, material stock spreadsheets, and daily attendance logs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main: Sites export list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Select Site to Export Data
            </h3>

            {sites.length === 0 ? (
              <p className="text-xs text-slate-400">No active sites to export.</p>
            ) : (
              <div className="space-y-4">
                {sites.map(site => (
                  <div 
                    key={site.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-150 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 hover:border-slate-350 dark:hover:border-slate-700 transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-slate-850 dark:text-slate-200">{site.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{site.location}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* PDF download link with token query param */}
                      <a
                        href={`http://localhost:5000/api/exports/pdf/${site.id}?token=${token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-950/40 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/20 transition-all"
                      >
                        <FileDown size={14} /> PDF Operations
                      </a>

                      {/* CSV download link with token query param */}
                      <a
                        href={`http://localhost:5000/api/exports/csv/${site.id}?token=${token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-emerald-250 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-100 dark:border-emerald-950/40 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all"
                      >
                        <FileSpreadsheet size={14} /> CSV Logs
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Instructions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/20 via-white to-white p-6 shadow-premium dark:border-slate-800/40 dark:from-slate-900/40 dark:to-slate-900/20">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="text-indigo-600" /> Export Policies
            </h4>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed space-y-2">
              <span>Operational reports are generated dynamically on call. The PDF package embeds full site metadata, progress historical summaries, material stock levels, expense sheets, and AI analysis reports.</span>
              <br /><br />
              <span>Make sure all daily site logs are submitted before generating exports to ensure data integrity.</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsExport;
