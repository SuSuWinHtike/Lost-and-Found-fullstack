import React from 'react';

const Badge = ({ type, text, size = 'md' }) => {
  const normType = (type || text || '').toLowerCase();
  
  let styles = 'bg-stone-100 text-stone-700 border-stone-200/80';
  let dotColor = 'bg-stone-400';

  if (normType.includes('lost')) {
    styles = 'bg-rose-50 text-rose-600 border-rose-200/70 shadow-xs';
    dotColor = 'bg-rose-500 animate-pulse';
  } else if (normType.includes('found')) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/70 shadow-xs';
    dotColor = 'bg-emerald-500';
  } else if (normType.includes('reunited')) {
    styles = 'bg-purple-50 text-purple-700 border-purple-200/70 shadow-xs';
    dotColor = 'bg-purple-500';
  } else if (normType.includes('pending')) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/70 shadow-xs';
    dotColor = 'bg-amber-500';
  } else if (normType.includes('rejected') || normType.includes('suspended')) {
    styles = 'bg-red-50 text-red-700 border-red-200/70 shadow-xs';
    dotColor = 'bg-red-500';
  } else if (normType.includes('active') || normType.includes('approved')) {
    styles = 'bg-teal-50 text-teal-700 border-teal-200/70 shadow-xs';
    dotColor = 'bg-teal-500';
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3.5 py-1 text-[11px] font-bold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md uppercase tracking-wider font-extrabold ${styles} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {text || type}
    </span>
  );
};

export default Badge;
