import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Copy,
  Download,
  Edit3,
  Layers,
  Loader2,
  Play,
  Search,
  Send,
  Share2,
  Sliders,
  Terminal,
  Trash2,
  Zap
} from 'lucide-react';
import axios from 'axios';
import { toast } from '../utils/toast.js';
import JsonViewer from '../components/JsonViewer.jsx';
import MethodBadge from '../components/MethodBadge.jsx';
import DeleteModal from '../components/DeleteModal.jsx';
import EditSchemaModal from '../components/EditSchemaModal.jsx';
import { downloadJsonFile, exportToPostmanCollection } from '../utils/postmanExport.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SchemaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schema, setSchema] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedBase, setCopiedBase] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [expanded, setExpanded] = useState(new Set());

  // Interactive playground state per endpoint index
  const [playgroundState, setPlaygroundState] = useState({});

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadSchemaData = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${API_URL}/api/schemas/${id}`),
      axios.get(`${API_URL}/api/schemas/${id}/endpoints`),
    ])
      .then(([schemaRes, endpointRes]) => {
        setSchema(schemaRes.data);
        setEndpoints(endpointRes.data);
        // Expand first endpoint by default
        if (endpointRes.data.length > 0) {
          setExpanded(new Set([0]));
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load schema details');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSchemaData();
  }, [id]);

  const toggleExpand = (index) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const expandAll = () => {
    const allIndices = endpoints.map((_, i) => i);
    setExpanded(new Set(allIndices));
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  const copyToClipboard = async (text, message = 'Copied to clipboard!') => {
    await navigator.clipboard.writeText(text);
    toast(message, 'success');
  };

  const copyBaseUrl = async (url) => {
    await navigator.clipboard.writeText(url);
    setCopiedBase(true);
    setTimeout(() => setCopiedBase(false), 2000);
    toast('Mock Server Base URL copied!', 'success');
  };

  const updatePlayground = (index, key, value) => {
    setPlaygroundState((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [key]: value,
      },
    }));
  };

  const getPlaygroundValue = (index, key, defaultValue) => {
    return playgroundState[index]?.[key] ?? defaultValue;
  };

  const runMockRequest = async (endpoint, index) => {
    const state = playgroundState[index] || {};
    const latency = state.latency || 0;
    const bodyInput = state.bodyInput;
    const customHeaders = state.customHeaders || '';
    const pathParams = state.pathParams || {};

    updatePlayground(index, 'loading', true);
    updatePlayground(index, 'error', null);

    // Substitute path params like /pets/{petId}
    let subPath = endpoint.path;
    Object.entries(pathParams).forEach(([paramName, paramVal]) => {
      subPath = subPath.replace(`{${paramName}}`, paramVal || '1');
    });
    // Replace any remaining {param} with default value if user left blank
    subPath = subPath.replace(/\{([^}]+)\}/g, '1');
    if (!subPath.startsWith('/')) subPath = `/${subPath}`;

    const fullTargetUrl = `${API_URL}/mock/${id}${subPath}`;

    // Parse custom headers
    const headersObj = { 'Content-Type': 'application/json' };
    if (customHeaders.trim()) {
      customHeaders.split('\n').forEach((line) => {
        const [k, v] = line.split(':');
        if (k && v) headersObj[k.trim()] = v.trim();
      });
    }

    // Parse request body if any
    let parsedBody = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase()) && bodyInput) {
      try {
        parsedBody = JSON.parse(bodyInput);
      } catch {
        updatePlayground(index, 'loading', false);
        return toast('Invalid JSON in request body input', 'error');
      }
    }

    const startTime = performance.now();

    if (latency > 0) {
      await new Promise((res) => setTimeout(res, latency));
    }

    try {
      const response = await axios({
        method: endpoint.method.toLowerCase(),
        url: fullTargetUrl,
        headers: headersObj,
        data: parsedBody,
      });

      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      updatePlayground(index, 'result', response.data);
      updatePlayground(index, 'responseHeaders', response.headers);
      updatePlayground(index, 'status', response.status);
      updatePlayground(index, 'statusText', response.statusText || 'OK');
      updatePlayground(index, 'executionTime', executionTime);
    } catch (err) {
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);
      updatePlayground(index, 'error', err.response?.data?.error || err.message);
      updatePlayground(index, 'status', err.response?.status || 500);
      updatePlayground(index, 'executionTime', executionTime);
    } finally {
      updatePlayground(index, 'loading', false);
    }
  };

  const generateCurlCommand = (endpoint, index) => {
    const state = playgroundState[index] || {};
    const pathParams = state.pathParams || {};
    let subPath = endpoint.path;
    Object.entries(pathParams).forEach(([k, v]) => {
      subPath = subPath.replace(`{${k}}`, v || '1');
    });
    subPath = subPath.replace(/\{([^}]+)\}/g, '1');
    if (!subPath.startsWith('/')) subPath = `/${subPath}`;

    const url = `${API_URL}/mock/${id}${subPath}`;
    let curl = `curl -X ${endpoint.method.toUpperCase()} "${url}" \\\n  -H "Accept: application/json"`;

    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase())) {
      curl += ` \\\n  -H "Content-Type: application/json"`;
      if (state.bodyInput) {
        curl += ` \\\n  -d '${state.bodyInput.replace(/'/g, "\\'")}'`;
      }
    }

    return curl;
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/api/schemas/${id}`);
      toast('Schema deleted successfully', 'success');
      navigate('/schemas');
    } catch {
      toast('Failed to delete schema', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSave = async (schemaId, updatedData) => {
    try {
      const res = await axios.put(`${API_URL}/api/schemas/${schemaId}`, updatedData);
      setSchema(res.data);
      toast('Schema updated successfully', 'success');
      loadSchemaData();
    } catch {
      toast('Failed to update schema', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Loading Endpoint Specification...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
        <Link
          to="/schemas"
          className="inline-flex items-center gap-2 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!schema) return null;

  const mockBaseUrl = `${API_URL}/mock/${id}`;

  // Filter endpoints by method and search term
  const filteredEndpoints = endpoints.filter((ep) => {
    const matchesMethod = selectedMethod === 'ALL' || ep.method.toUpperCase() === selectedMethod;
    const matchesSearch =
      ep.path.toLowerCase().includes(search.toLowerCase()) ||
      (ep.summary && ep.summary.toLowerCase().includes(search.toLowerCase()));
    return matchesMethod && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-8">
      {/* Top Nav Back Link & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/schemas"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Schemas
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadJsonFile(`${schema.name}.json`, schema.openapi_json)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Download OpenAPI Specification"
          >
            <Download className="h-3.5 w-3.5" />
            Spec JSON
          </button>
          <button
            onClick={() => exportToPostmanCollection(schema, mockBaseUrl)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Export Postman Collection v2.1"
          >
            <Share2 className="h-3.5 w-3.5" />
            Postman Collection
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Edit Schema"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2 text-rose-500 hover:bg-rose-500/15"
            title="Delete Schema"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Mock Engine Live
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              {schema.name}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Created {new Date(schema.createdAt).toLocaleDateString()} • Updated {new Date(schema.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Base URL Box */}
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/5 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                <Terminal className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Mock Server Base URL
              </div>
              <code className="mt-2 block break-all rounded-xl border border-indigo-500/20 bg-white/80 dark:bg-slate-950/80 px-4 py-2.5 font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-inner">
                {mockBaseUrl}
              </code>
            </div>
            <button
              onClick={() => copyBaseUrl(mockBaseUrl)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all active:scale-95"
            >
              {copiedBase ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedBase ? 'Copied!' : 'Copy Base URL'}
            </button>
          </div>
        </div>
      </div>

      {/* Endpoints Section Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-500" />
              API Endpoints ({filteredEndpoints.length} of {endpoints.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              Expand All
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={collapseAll}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Method Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-3 rounded-2xl">
          {/* Method Pills */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMethod(m)}
                className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                  selectedMethod === m
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search endpoint paths..."
              className="glass-input h-9 w-full pl-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Endpoints Accordion List */}
      <div className="space-y-4">
        {filteredEndpoints.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900 text-slate-500">
            No endpoints match your filter criteria.
          </div>
        ) : (
          filteredEndpoints.map((endpoint, index) => {
            const isOpen = expanded.has(index);
            const targetMockUrl = `${mockBaseUrl}${endpoint.path}`;

            // Extract path parameter names like {petId} or {id}
            const pathParamMatches = endpoint.path.match(/\{([^}]+)\}/g) || [];
            const pathParamNames = pathParamMatches.map((m) => m.replace(/[{}]/g, ''));

            const hasRequestBody = ['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase());

            const isRunning = getPlaygroundValue(index, 'loading', false);
            const mockResult = getPlaygroundValue(index, 'result', null);
            const mockError = getPlaygroundValue(index, 'error', null);
            const status = getPlaygroundValue(index, 'status', null);
            const execTime = getPlaygroundValue(index, 'executionTime', null);
            const latencyVal = getPlaygroundValue(index, 'latency', 0);

            return (
              <div
                key={`${endpoint.method}-${endpoint.path}`}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpand(index)}
                  className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <MethodBadge method={endpoint.method} />
                    <code className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                      {endpoint.path}
                    </code>
                    {endpoint.summary && (
                      <span className="hidden md:inline-block max-w-[280px] truncate text-xs text-slate-400">
                        {endpoint.summary}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                      {Object.keys(endpoint.responses || {}).length} Response(s)
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Endpoint Card Body */}
                {isOpen && (
                  <div className="border-t border-slate-100 p-5 sm:p-6 dark:border-slate-800 space-y-6 bg-slate-50/30 dark:bg-slate-950/30">
                    {endpoint.summary && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Summary</h4>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{endpoint.summary}</p>
                      </div>
                    )}

                    {/* Interactive Playground Box */}
                    <div className="rounded-2xl border border-indigo-500/20 bg-white dark:bg-slate-900 p-5 space-y-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-indigo-500" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Interactive Request Tester
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(generateCurlCommand(endpoint, index), 'cURL command copied')}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <Code2 className="h-3.5 w-3.5" />
                          Copy as cURL
                        </button>
                      </div>

                      {/* Target Endpoint Preview URL */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <code className="flex-1 break-all font-mono text-xs text-emerald-400">
                          {endpoint.method.toUpperCase()} {targetMockUrl}
                        </code>
                        <button
                          onClick={() => copyToClipboard(targetMockUrl)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white"
                        >
                          <Copy className="h-3.5 w-3.5" /> Copy URL
                        </button>
                      </div>

                      {/* Dynamic Path Parameters Inputs */}
                      {pathParamNames.length > 0 && (
                        <div className="space-y-3">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Path Parameters
                          </label>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {pathParamNames.map((paramName) => (
                              <div key={paramName} className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-indigo-500">
                                  {`{${paramName}}`}:
                                </span>
                                <input
                                  type="text"
                                  placeholder="e.g. 101"
                                  value={playgroundState[index]?.pathParams?.[paramName] || ''}
                                  onChange={(e) =>
                                    updatePlayground(index, 'pathParams', {
                                      ...(playgroundState[index]?.pathParams || {}),
                                      [paramName]: e.target.value,
                                    })
                                  }
                                  className="glass-input h-8 text-xs flex-1"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Request Body Input (If POST/PUT/PATCH) */}
                      {hasRequestBody && (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Request Body (JSON)
                          </label>
                          <textarea
                            rows={4}
                            placeholder='{"name": "Sample Payload", "status": "active"}'
                            value={getPlaygroundValue(index, 'bodyInput', '')}
                            onChange={(e) => updatePlayground(index, 'bodyInput', e.target.value)}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-100 outline-none focus:border-indigo-500"
                          />
                        </div>
                      )}

                      {/* Latency Simulator & Execute Row */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <Sliders className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="text-xs font-medium text-slate-500 shrink-0">Simulated Latency:</span>
                          <select
                            value={latencyVal}
                            onChange={(e) => updatePlayground(index, 'latency', Number(e.target.value))}
                            className="glass-input h-8 py-0 text-xs font-mono"
                          >
                            <option value={0}>0ms (Instant)</option>
                            <option value={200}>200ms (Fast 4G)</option>
                            <option value={500}>500ms (Average)</option>
                            <option value={1000}>1000ms (Slow Network)</option>
                          </select>
                        </div>

                        <button
                          onClick={() => runMockRequest(endpoint, index)}
                          disabled={isRunning}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-50 active:scale-95"
                        >
                          {isRunning ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Simulating Request...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send Request
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Live Request Execution Output Result */}
                    {(mockResult !== null || mockError !== null) && (
                      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 animate-scale-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`rounded-lg px-2.5 py-1 text-xs font-mono font-extrabold ${
                                status >= 200 && status < 300
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              HTTP {status || 200}
                            </span>
                            {execTime !== null && (
                              <span className="flex items-center gap-1 text-xs font-mono text-indigo-400 font-semibold">
                                <Clock className="h-3.5 w-3.5" />
                                {execTime}ms latency
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Mock Output Response
                          </span>
                        </div>

                        {mockError ? (
                          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{mockError}</span>
                          </div>
                        ) : (
                          <JsonViewer data={mockResult} initiallyExpanded />
                        )}
                      </div>
                    )}

                    {/* Defined Specification Responses */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        OpenAPI Spec Response Models
                      </h4>

                      <div className="space-y-2">
                        {Object.entries(endpoint.responses || {}).map(([statusCode, resp]) => (
                          <div
                            key={statusCode}
                            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold ${
                                    statusCode.startsWith('2')
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                  }`}
                                >
                                  {statusCode}
                                </span>
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                  {resp.description || 'Response model'}
                                </span>
                              </div>
                            </div>

                            {resp.schema ? (
                              <div className="pt-2">
                                <JsonViewer data={resp.schema} initiallyExpanded={false} maxHeight="max-h-60" />
                              </div>
                            ) : (
                              <p className="text-xs italic text-slate-400">No schema defined for status {statusCode}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={schema.name}
        loading={deleting}
      />

      {/* Edit Schema Modal */}
      <EditSchemaModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        schema={schema}
        onSave={handleEditSave}
      />
    </div>
  );
}
