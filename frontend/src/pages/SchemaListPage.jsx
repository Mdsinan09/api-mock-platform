import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Download,
  Edit3,
  FileJson,
  Grid,
  Layers,
  List,
  Loader2,
  Plus,
  Search,
  Share2,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import { toast } from '../utils/toast.js';
import StatsOverview from '../components/StatsOverview.jsx';
import DeleteModal from '../components/DeleteModal.jsx';
import EditSchemaModal from '../components/EditSchemaModal.jsx';
import { downloadJsonFile, exportToPostmanCollection } from '../utils/postmanExport.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SchemaListPage() {
  const [schemas, setSchemas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const fetchSchemas = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/schemas`)
      .then((res) => setSchemas(res.data))
      .catch(() => toast('Failed to fetch schemas', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSchemas();
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/api/schemas/${deleteTarget.id}`);
      toast(`Schema "${deleteTarget.name}" deleted`, 'success');
      setSchemas((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      toast('Failed to delete schema', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSave = async (id, updatedData) => {
    try {
      const res = await axios.put(`${API_URL}/api/schemas/${id}`, updatedData);
      toast(`Schema "${res.data.name}" updated`, 'success');
      setSchemas((prev) => prev.map((s) => (s.id === id ? res.data : s)));
    } catch {
      toast('Failed to update schema', 'error');
    }
  };

  const filtered = schemas.filter((schema) =>
    schema.name.toLowerCase().includes(search.toLowerCase())
  );

  const getEndpointCount = (schema) => Object.keys(schema.openapi_json?.paths || {}).length;

  const getMethodsList = (schema) => {
    const paths = schema.openapi_json?.paths || {};
    const methods = new Set();
    Object.values(paths).forEach((m) => {
      if (m && typeof m === 'object') {
        Object.keys(m).forEach((k) => methods.add(k.toUpperCase()));
      }
    });
    return Array.from(methods);
  };

  if (loading) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Loading OpenAPI Mock Specs...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center glass-card p-6 sm:p-8 rounded-3xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Schema Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your OpenAPI 3.0 & Swagger mock specs, test endpoints, and export collections.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create New Spec
        </Link>
      </div>

      {/* Analytics Stats Overview */}
      <StatsOverview schemas={schemas} />

      {/* Search & View Toggle Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search specs by title..."
            className="glass-input w-full pl-10"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-400 mr-1">{filtered.length} schema(s)</span>
          <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow dark:bg-slate-800 dark:text-indigo-400'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow dark:bg-slate-800 dark:text-indigo-400'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid / List Content */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Layers className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {search ? 'No matching schemas found' : 'No mock schemas yet'}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {search ? 'Try clearing your search query or uploading a new specification.' : 'Import an OpenAPI or Swagger spec to spin up instant mock endpoints.'}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Upload your first spec or try a sample preset →
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((schema) => {
            const count = getEndpointCount(schema);
            const methods = getMethodsList(schema);
            const mockUrl = `${API_URL}/mock/${schema.id}`;

            return (
              <div
                key={schema.id}
                className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between space-y-6 group relative"
              >
                <div>
                  {/* Top Header Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20">
                      <FileJson className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditTarget(schema)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                        title="Edit Schema"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(schema)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        title="Delete Schema"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <Link to={`/schemas/${schema.id}`} className="block group-hover:text-indigo-500 transition-colors">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                      {schema.name}
                    </h3>
                  </Link>

                  <p className="mt-1 text-xs text-slate-400">
                    Created {new Date(schema.createdAt).toLocaleDateString()}
                  </p>

                  {/* Method tags preview */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {methods.slice(0, 4).map((m) => (
                      <span
                        key={m}
                        className="rounded-md border border-slate-200 dark:border-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400"
                      >
                        {m}
                      </span>
                    ))}
                    {methods.length > 4 && (
                      <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                        +{methods.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {count} {count === 1 ? 'endpoint' : 'endpoints'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => exportToPostmanCollection(schema, mockUrl)}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Export Postman Collection"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Postman
                    </button>
                    <Link
                      to={`/schemas/${schema.id}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      View
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((schema) => {
              const count = getEndpointCount(schema);
              const mockUrl = `${API_URL}/mock/${schema.id}`;

              return (
                <div
                  key={schema.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <FileJson className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/schemas/${schema.id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-indigo-500 truncate block"
                      >
                        {schema.name}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {count} Endpoints • Created {new Date(schema.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => downloadJsonFile(`${schema.name}.json`, schema.openapi_json)}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" /> Spec
                    </button>
                    <button
                      onClick={() => exportToPostmanCollection(schema, mockUrl)}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Postman
                    </button>
                    <button
                      onClick={() => setEditTarget(schema)}
                      className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(schema)}
                      className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/schemas/${schema.id}`}
                      className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={deleteTarget?.name || ''}
        loading={deleting}
      />

      {/* Edit Schema Modal */}
      <EditSchemaModal
        isOpen={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        schema={editTarget}
        onSave={handleEditSave}
      />
    </div>
  );
}
