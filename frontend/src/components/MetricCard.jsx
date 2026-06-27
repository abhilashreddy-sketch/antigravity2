import React from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, icon: Icon, trend, trendType = 'neutral', color = 'accent' }) => {
  const getColorStyles = (col) => {
    switch (col) {
      case 'success':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20',
          shadow: 'hover:shadow-emerald-500/5',
          border: 'border-emerald-500/20 dark:border-emerald-500/10',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20',
          shadow: 'hover:shadow-amber-500/5',
          border: 'border-amber-500/20 dark:border-amber-500/10',
        };
      case 'danger':
        return {
          iconBg: 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20',
          shadow: 'hover:shadow-rose-500/5',
          border: 'border-rose-500/20 dark:border-rose-500/10',
        };
      default: // accent
        return {
          iconBg: 'bg-accent-500/10 text-accent-500 dark:bg-accent-500/20',
          shadow: 'hover:shadow-accent-500/5',
          border: 'border-accent-500/20 dark:border-accent-500/10',
        };
    }
  };

  const style = getColorStyles(color);

  const getTrendColor = (type) => {
    if (type === 'positive') return 'text-emerald-500';
    if (type === 'negative') return 'text-rose-500';
    return 'text-slate-500 dark:text-slate-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={`rounded-2xl border bg-white p-6 shadow-premium transition-all duration-300 dark:bg-slate-900/60 backdrop-blur-sm ${style.border} ${style.shadow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`rounded-xl p-2.5 ${style.iconBg}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{value}</h3>
        {trend && (
          <p className={`text-xs font-semibold ${getTrendColor(trendType)}`}>
            {trend}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
