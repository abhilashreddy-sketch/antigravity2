import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';

const AIPanel = ({ siteId }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const fetchAnalysis = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`/api/ai/analyze/${siteId}`);
      setAnalysis(res.data);
    } catch (err) {
      console.error('Error fetching AI analysis:', err);
      setError(err.response?.data?.message || 'Failed to complete AI analytical audit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteId) {
      fetchAnalysis();
    }
  }, [siteId]);

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'text-rose-500 bg-rose-500/10 border border-rose-500/20';
      case 'medium':
        return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
      default:
        return 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return <AlertCircle className="text-rose-500 shrink-0" size={18} />;
      case 'medium':
        return <AlertTriangle className="text-amber-500 shrink-0" size={18} />;
      default:
        return <CheckCircle className="text-emerald-500 shrink-0" size={18} />;
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50/20 via-white to-white p-6 shadow-premium dark:border-indigo-950/40 dark:from-indigo-950/10 dark:via-slate-900/60 dark:to-slate-900/60 backdrop-blur-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-lg shadow-indigo-600/20">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">AI Operational Insights</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Risk assessments & automated log analysis</p>
          </div>
        </div>

        <button
          onClick={() => fetchAnalysis(true)}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50 transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analyzing...' : 'Audit Log'}
        </button>
      </div>

      {/* Main Content */}
      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-xs text-slate-500 dark:text-slate-400">GenAI is auditing reports, inventory materials, and labor shifted hours...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-rose-50/50 border border-rose-100 p-4 dark:bg-rose-950/10 dark:border-rose-900/20">
            <p className="text-sm text-rose-500">{error}</p>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            
            {/* Risk and Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Overall Assessment</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{analysis.summary}</p>
              </div>
              
              <div className="flex sm:flex-col items-center sm:items-end shrink-0 gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Delay Risk Level</span>
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getRiskColor(analysis.delayRisk)}`}>
                  {getRiskIcon(analysis.delayRisk)}
                  {analysis.delayRisk}
                </div>
              </div>
            </div>

            {/* Analysis details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
                <h5 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Timeline & Schedules</h5>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-normal">{analysis.timelineAnalysis}</p>
              </div>

              <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
                <h5 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Materials Utilization</h5>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-normal">{analysis.materialUtilization}</p>
              </div>

              <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
                <h5 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Labor Shifts & Attendance</h5>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-normal">{analysis.labourProductivity}</p>
              </div>

              <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
                <h5 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Financial Expense Costs</h5>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-normal">{analysis.expenseAnalysis}</p>
              </div>
            </div>

            {/* Recommendations checklist */}
            <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={14} className="text-indigo-600" /> Actionable Recommendations
              </h5>
              
              <ul className="mt-3.5 space-y-3">
                {analysis.recommendations && analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-50 font-bold text-[10px] text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        ) : (
          <p className="py-6 text-center text-xs text-slate-500">No logs generated yet.</p>
        )}
      </div>

    </div>
  );
};

export default AIPanel;
