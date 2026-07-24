import { Activity, Code, Cpu, Layers } from 'lucide-react';

export default function StatsOverview({ schemas = [] }) {
  const totalSchemas = schemas.length;
  
  let totalEndpoints = 0;
  const methodCounts = { GET: 0, POST: 0, PUT: 0, DELETE: 0, OTHER: 0 };

  schemas.forEach((schema) => {
    const paths = schema.openapi_json?.paths || {};
    Object.values(paths).forEach((methods) => {
      if (methods && typeof methods === 'object') {
        Object.keys(methods).forEach((method) => {
          const upper = method.toUpperCase();
          totalEndpoints++;
          if (methodCounts[upper] !== undefined) {
            methodCounts[upper]++;
          } else {
            methodCounts.OTHER++;
          }
        });
      }
    });
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Total Specs */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-all" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total OpenAPI Specs</p>
          <h3 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">{totalSchemas}</h3>
          <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">Active Mock Servers</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20">
          <Layers className="h-6 w-6" />
        </div>
      </div>

      {/* Total Endpoints */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20 transition-all" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mock Endpoints</p>
          <h3 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">{totalEndpoints}</h3>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ready to execute</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
          <Code className="h-6 w-6" />
        </div>
      </div>

      {/* HTTP Methods Breakdown */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-violet-500/10 blur-xl group-hover:bg-violet-500/20 transition-all" />
        <div className="w-full">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Method Distribution</p>
          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            <span className="text-emerald-600 dark:text-emerald-400">GET: {methodCounts.GET}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-sky-600 dark:text-sky-400">POST: {methodCounts.POST}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-amber-600 dark:text-amber-400">PUT: {methodCounts.PUT}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Zero-config dynamic response</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/20">
          <Cpu className="h-6 w-6" />
        </div>
      </div>

      {/* System Status */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-sky-500/10 blur-xl group-hover:bg-sky-500/20 transition-all" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mock Engine Status</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Online</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">CORS enabled & instant</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20">
          <Activity className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
