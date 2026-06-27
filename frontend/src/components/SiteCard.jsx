import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, User, ArrowRight, Calendar, AlertTriangle } from 'lucide-react';

const SiteCard = ({ site }) => {
  const latestReport = site.progressReports && site.progressReports.length > 0 
    ? site.progressReports[0] 
    : null;
  const progress = latestReport ? latestReport.completionPercentage : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'delayed':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse';
      case 'suspended':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default: // active
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-premium transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700/80 hover:shadow-premium-hover hover:border-slate-300/80"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {site.project?.name || 'Unassigned Project'}
          </span>
          <h4 className="mt-1 font-bold text-slate-800 dark:text-slate-100 text-lg line-clamp-1">{site.name}</h4>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadge(site.status)}`}>
          {site.status}
        </span>
      </div>

      {/* Location info */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <MapPin size={14} className="shrink-0" />
        <span className="line-clamp-1">{site.location}</span>
      </div>

      {/* Assigned Engineer info */}
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <User size={14} className="shrink-0" />
        <span>Engineer: {site.engineer?.name || 'Not Assigned'}</span>
      </div>

      {/* Progress section */}
      <div className="mt-6 flex-1 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">Current Progress</span>
          <span className="text-slate-900 dark:text-slate-50">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${site.status === 'delayed' ? 'bg-rose-500' : 'bg-accent-600'}`}
          />
        </div>
      </div>

      {/* Card Footer Info */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Calendar size={14} />
          <span>Report: {latestReport ? latestReport.reportDate : 'No entries'}</span>
        </div>
        
        <Link
          to={`/sites/${site.id}`}
          className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-accent-600 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-accent-600 dark:hover:text-white transition-all"
        >
          Details <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
};

export default SiteCard;
