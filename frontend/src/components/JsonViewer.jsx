import { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Copy, Search } from 'lucide-react';

export default function JsonViewer({ data, initiallyExpanded = true, maxHeight = 'max-h-96' }) {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDataEmpty = data === undefined || data === null;

  return (
    <div className="relative group rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden text-slate-200 shadow-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="font-mono font-semibold text-slate-400">JSON Payload</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2 h-3 w-3 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search keys..."
              className="h-6 w-32 rounded-lg bg-slate-950/80 pl-6 pr-2 font-mono text-[11px] text-slate-300 outline-none border border-slate-800 focus:border-indigo-500 focus:w-44 transition-all"
            />
          </div>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            title="Copy JSON to clipboard"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className={`overflow-auto p-4 font-mono text-xs leading-relaxed ${maxHeight}`}>
        {isDataEmpty ? (
          <span className="text-slate-500 italic">No response data</span>
        ) : (
          <JsonNode data={data} initiallyExpanded={initiallyExpanded} searchTerm={searchTerm.toLowerCase()} />
        )}
      </div>
    </div>
  );
}

function JsonNode({ data, initiallyExpanded, searchTerm }) {
  const [isOpen, setIsOpen] = useState(initiallyExpanded);

  if (data === null) return <span className="text-violet-400 font-semibold">null</span>;
  if (typeof data === 'boolean') return <span className="text-amber-400 font-semibold">{String(data)}</span>;
  if (typeof data === 'number') return <span className="text-sky-400 font-semibold">{data}</span>;
  if (typeof data === 'string') return <span className="text-emerald-300">&quot;{data}&quot;</span>;

  const isArray = Array.isArray(data);
  const entries = isArray ? data.map((value, index) => [index, value]) : Object.entries(data || {});

  if (!entries.length) {
    return <span className="text-slate-500">{isArray ? '[]' : '{}'}</span>;
  }

  const opener = isArray ? '[' : '{';
  const closer = isArray ? ']' : '}';

  return (
    <div className="inline-block w-full">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors focus:outline-none"
      >
        {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-slate-500" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-500" />}
        <span className="text-slate-500 font-semibold">
          {isOpen ? opener : `${isArray ? '[...]' : '{...}'} (${entries.length} ${isArray ? 'items' : 'keys'})`}
        </span>
      </button>

      {isOpen && (
        <div className="ml-4 border-l border-slate-800/80 pl-3 space-y-1">
          {entries.map(([key, value], index) => {
            const matchesSearch = searchTerm && String(key).toLowerCase().includes(searchTerm);
            return (
              <div key={key} className={`py-0.5 rounded px-1 transition-colors ${matchesSearch ? 'bg-indigo-950/60 ring-1 ring-indigo-500/50' : ''}`}>
                {!isArray && (
                  <>
                    <span className="text-indigo-400 font-medium">&quot;{key}&quot;</span>
                    <span className="text-slate-600 px-1">:</span>
                  </>
                )}
                <JsonNode data={value} initiallyExpanded={initiallyExpanded} searchTerm={searchTerm} />
                {index < entries.length - 1 && <span className="text-slate-600">,</span>}
              </div>
            );
          })}
          <div className="text-slate-500 font-semibold">{closer}</div>
        </div>
      )}
    </div>
  );
}
