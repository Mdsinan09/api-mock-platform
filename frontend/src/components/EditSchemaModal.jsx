import { useEffect, useState } from 'react';
import { AlertCircle, Edit3, Loader2, Save, X } from 'lucide-react';
import { toast } from '../utils/toast.js';

export default function EditSchemaModal({ isOpen, onClose, schema, onSave }) {
  const [name, setName] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonValid, setJsonValid] = useState(true);

  useEffect(() => {
    if (schema) {
      setName(schema.name || '');
      setJsonText(JSON.stringify(schema.openapi_json || {}, null, 2));
      setJsonValid(true);
    }
  }, [schema]);

  if (!isOpen || !schema) return null;

  const validateJson = (val) => {
    try {
      JSON.parse(val);
      setJsonValid(true);
    } catch {
      setJsonValid(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast('Schema name is required', 'error');

    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonText);
    } catch {
      return toast('Invalid JSON syntax', 'error');
    }

    setLoading(true);
    try {
      await onSave(schema.id, { name: name.trim(), openapi_json: parsedJson });
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to update schema', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Edit3 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Schema</h3>
              <p className="text-xs text-slate-500">Update schema title or OpenAPI specification payload</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Schema Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full"
              placeholder="e.g. Pet Store API"
              required
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                OpenAPI Specification (JSON)
              </label>
              {!jsonValid && (
                <span className="flex items-center gap-1 text-xs text-rose-500 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" /> Invalid JSON
                </span>
              )}
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                validateJson(e.target.value);
              }}
              rows={10}
              className={`w-full rounded-xl border bg-slate-950 p-4 font-mono text-xs text-slate-100 outline-none transition-all focus:ring-2 ${
                !jsonValid ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !jsonValid}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
