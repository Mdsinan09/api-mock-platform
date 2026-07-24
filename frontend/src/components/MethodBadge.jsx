const styles = {
  GET: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-500/30',
    dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
  },
  POST: {
    bg: 'bg-sky-500/10 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-300/60 dark:border-sky-500/30',
    dot: 'bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.8)]'
  },
  PUT: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-500/30',
    dot: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
  },
  PATCH: {
    bg: 'bg-violet-500/10 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-300/60 dark:border-violet-500/30',
    dot: 'bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.8)]'
  },
  DELETE: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300/60 dark:border-rose-500/30',
    dot: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]'
  },
  DEFAULT: {
    bg: 'bg-slate-500/10 dark:bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-300/60 dark:border-slate-500/30',
    dot: 'bg-slate-500'
  }
};

export default function MethodBadge({ method, size = 'md', showDot = true }) {
  const label = method?.toUpperCase() || 'GET';
  const config = styles[label] || styles.DEFAULT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-mono font-bold tracking-wider transition-all duration-200 ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
      } ${config.bg}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />}
      {label}
    </span>
  );
}
