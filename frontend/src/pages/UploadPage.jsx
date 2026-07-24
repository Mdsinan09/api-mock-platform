import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle,
  Code2,
  FileCode,
  FileJson,
  Check,
  Layers,
  Loader2,
  Sparkles,
  UploadCloud,
  Wand2
} from 'lucide-react';
import axios from 'axios';
import { toast } from '../utils/toast.js';
import { SAMPLE_SCHEMAS } from '../utils/sampleSchemas.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UploadPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'presets'
  const [name, setName] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jsonValid, setJsonValid] = useState(null);
  const [specSummary, setSpecSummary] = useState(null);

  const validateAndParseJson = (value) => {
    if (!value.trim()) {
      setJsonValid(null);
      setSpecSummary(null);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      setJsonValid(true);

      const paths = parsed.paths || {};
      let endpointCount = 0;
      Object.values(paths).forEach((methods) => {
        if (methods && typeof methods === 'object') {
          endpointCount += Object.keys(methods).length;
        }
      });

      setSpecSummary({
        title: parsed.info?.title || 'Untitled API Spec',
        version: parsed.info?.version || '1.0.0',
        openapiVersion: parsed.openapi || parsed.swagger || '3.0.0',
        endpoints: endpointCount,
      });

      if (!name && parsed.info?.title) {
        setName(parsed.info.title);
      }
    } catch {
      setJsonValid(false);
      setSpecSummary(null);
    }
  };

  const handleFile = (file) => {
    if (!file || (!file.name.endsWith('.json') && file.type !== 'application/json')) {
      return toast('Please upload a valid JSON file', 'error');
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const value = target.result;
      setJsonText(value);
      validateAndParseJson(value);
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  }, []);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      toast('JSON formatted successfully', 'success');
    } catch {
      toast('Cannot format invalid JSON', 'error');
    }
  };

  const loadPreset = (preset) => {
    setName(preset.name);
    const formattedSpec = JSON.stringify(preset.spec, null, 2);
    setJsonText(formattedSpec);
    validateAndParseJson(formattedSpec);
    setActiveTab('editor');
    toast(`Loaded preset: ${preset.name}`, 'success');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return toast('Schema name is required', 'error');

    let openapiJson;
    try {
      openapiJson = JSON.parse(jsonText);
    } catch {
      return toast('Invalid JSON. Please fix syntax errors before uploading.', 'error');
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/schemas`, {
        name: name.trim(),
        openapi_json: openapiJson,
      });
      toast(`Schema "${response.data.name}" created successfully!`, 'success');
      navigate('/schemas');
    } catch (error) {
      toast(error.response?.data?.error || 'Failed to upload schema', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-8">
      {/* Hero Header */}
      <div className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Zero-Config Mock Server Generator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create API Mock Server
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
            Import an OpenAPI 3.0 or Swagger 2.0 JSON specification or pick from our high-quality sample API presets.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex shrink-0 items-center rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'editor'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="h-4 w-4" />
            Upload / Custom JSON
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'presets'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wand2 className="h-4 w-4" />
            Sample Presets ({SAMPLE_SCHEMAS.length})
          </button>
        </div>
      </div>

      {/* Preset Gallery Tab */}
      {activeTab === 'presets' && (
        <div className="space-y-4 animate-scale-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-500" />
              Pre-configured OpenAPI Sample Specifications
            </h2>
            <span className="text-xs text-slate-500">1-Click instant test load</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {SAMPLE_SCHEMAS.map((preset) => (
              <div
                key={preset.id}
                className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-4 group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r ${preset.color}`}>
                      {preset.badge}
                    </span>
                    <span className="font-mono text-xs text-slate-400">OpenAPI 3.0</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    {Object.keys(preset.spec.paths || {}).length} Endpoints
                  </span>
                  <button
                    onClick={() => loadPreset(preset)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    Load Spec
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor & Upload Form Tab */}
      {activeTab === 'editor' && (
        <form onSubmit={submit} className="space-y-6 animate-fade-in">
          {/* Schema Name Input */}
          <div className="glass-card rounded-2xl p-6 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Schema Display Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Swagger PetStore API v1"
              className="glass-input w-full text-base font-semibold"
              required
            />
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-300 bg-slate-50/50 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700'
            }`}
          >
            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
            />
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 ring-8 ring-indigo-500/5">
              <UploadCloud className={`h-7 w-7 transition-transform ${isDragging ? 'scale-110' : ''}`} />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {fileName ? (
                <span className="text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5">
                  <FileCode className="h-4 w-4" /> {fileName}
                </span>
              ) : (
                'Drop your OpenAPI JSON file here, or click to browse'
              )}
            </p>
            <p className="mt-1.5 text-xs text-slate-500">Supports OpenAPI 3.0+ and Swagger 2.0 (.json files)</p>
          </div>

          {/* Live Spec Preview Box (If valid) */}
          {specSummary && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 animate-scale-in">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20">
                  <Check className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{specSummary.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400">
                    Version {specSummary.version} • {specSummary.endpoints} endpoints detected
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-mono font-bold">
                Spec Validated
              </span>
            </div>
          )}

          {/* Code Editor Box */}
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Specification Content (JSON)
                </label>
                <span
                  className={`flex items-center gap-1 text-xs font-medium ${
                    jsonValid === true
                      ? 'text-emerald-500'
                      : jsonValid === false
                      ? 'text-rose-500'
                      : 'text-slate-400'
                  }`}
                >
                  {jsonValid === true && <CheckCircle className="h-4 w-4" />}
                  {jsonValid === false && <AlertCircle className="h-4 w-4" />}
                  {jsonValid === true ? 'Valid JSON' : jsonValid === false ? 'Invalid Syntax' : ''}
                </span>
              </div>

              {jsonText && (
                <button
                  type="button"
                  onClick={formatJson}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  Format JSON
                </button>
              )}
            </div>

            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                validateAndParseJson(e.target.value);
              }}
              placeholder='Paste your OpenAPI 3.0 or Swagger 2.0 JSON here... e.g. {"openapi": "3.0.0", "info": {...}, "paths": {...}}'
              rows={14}
              className={`w-full resize-y rounded-xl border bg-slate-950 p-4 font-mono text-xs text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:ring-2 ${
                jsonValid === false
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : jsonValid === true
                  ? 'border-emerald-500/60 focus:ring-emerald-500/20'
                  : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading || !jsonValid || !name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-base font-bold text-white shadow-xl shadow-indigo-600/25 hover:from-indigo-700 hover:to-violet-700 transition-all disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Mock Server...
              </>
            ) : (
              <>
                <FileJson className="h-5 w-5" />
                Deploy Mock Server Schema
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
