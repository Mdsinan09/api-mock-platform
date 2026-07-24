import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SchemaDetailPage = () => {
  const { id } = useParams();

  const [schema, setSchema] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock testing panel state
  const [testPanel, setTestPanel] = useState({
    open: false,
    loading: false,
    error: '',
    result: null,
    endpoint: null,
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [schemaRes, endpointsRes] = await Promise.all([
          axios.get(`${API_URL}/api/schemas/${id}`),
          axios.get(`${API_URL}/api/schemas/${id}/endpoints`),
        ]);
        setSchema(schemaRes.data);
        setEndpoints(endpointsRes.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load schema details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const mockBaseUrl = `${API_URL}/mock/${id}`;

  const copyMockUrl = () => {
    navigator.clipboard.writeText(mockBaseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testMockEndpoint = async (endpoint) => {
    setTestPanel({
      open: true,
      loading: true,
      error: '',
      result: null,
      endpoint,
    });

    try {
      let mockPath = endpoint.path.startsWith('/') ? endpoint.path : `/${endpoint.path}`;
      mockPath = mockPath.replace(/\{([^}]+)\}/g, (match, paramName) => {
        const parameter = paramName.toLowerCase();

        if (parameter.includes('id')) return String(Math.floor(Math.random() * 9000) + 100);
        if (parameter.includes('name') || parameter.includes('user')) return 'johndoe';
        if (parameter.includes('status')) return 'available';
        if (parameter.includes('order')) return `order-${Math.floor(Math.random() * 1000)}`;
        return 'test-value';
      });

      const response = await axios({
        method: endpoint.method.toLowerCase(),
        url: `${API_URL}/mock/${id}${mockPath}`,
      });

      setTestPanel((prev) => ({
        ...prev,
        loading: false,
        result: {
          status: response.status,
          data: response.data,
        },
      }));
    } catch (err) {
      setTestPanel((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.error || err.message,
      }));
    }
  };

  const closeTestPanel = () => {
    setTestPanel((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mb-4">
          {error}
        </div>
        <Link to="/schemas" className="text-indigo-600 hover:underline">
          ← Back to schemas
        </Link>
      </div>
    );
  }

  if (!schema) return null;

  const methodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-700';
      case 'POST': return 'bg-blue-100 text-blue-700';
      case 'PUT': return 'bg-yellow-100 text-yellow-700';
      case 'PATCH': return 'bg-purple-100 text-purple-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/schemas"
        className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 inline-block"
      >
        ← Back to all schemas
      </Link>

      {/* ── Schema Header ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{schema.name}</h1>
        <p className="text-sm text-gray-500">
          Created: {new Date(schema.createdAt).toLocaleString()} · Updated:{' '}
          {new Date(schema.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* ── Mock Server Card ── */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-indigo-900 mb-1">Mock Server Base URL</h2>
            <p className="text-sm text-indigo-700 mb-2">
              Send requests to this base URL + any endpoint path below
            </p>
            <code className="block bg-white border border-indigo-200 rounded-lg px-4 py-2 text-sm font-mono text-indigo-800 break-all">
              {mockBaseUrl}
            </code>
          </div>
          <button
            onClick={copyMockUrl}
            className="shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy URL
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Response Viewer Panel ── */}
      {testPanel.open && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${methodColor(testPanel.endpoint?.method || 'GET')}`}>
                {testPanel.endpoint?.method}
              </span>
              <code className="text-sm font-mono text-gray-700">{testPanel.endpoint?.path}</code>
              <span className="text-sm text-gray-500">Mock Response</span>
            </div>
            <button
              onClick={closeTestPanel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {testPanel.loading && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                Generating mock data...
              </div>
            )}

            {testPanel.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                <span className="font-semibold">Error:</span> {testPanel.error}
              </div>
            )}

            {testPanel.result && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">
                    HTTP {testPanel.result.status}
                  </span>
                  <span className="text-xs text-gray-500">Mock data generated successfully</span>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {JSON.stringify(testPanel.result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Endpoints List ── */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Endpoints ({endpoints.length})
      </h2>

      {endpoints.length === 0 ? (
        <p className="text-gray-500">No endpoints found in this schema.</p>
      ) : (
        <div className="space-y-4">
          {endpoints.map((ep, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Endpoint Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${methodColor(ep.method)}`}
                  >
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                    {ep.path}
                  </code>
                </div>
                <button
                  onClick={() => testMockEndpoint(ep)}
                  className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Test Mock
                </button>
              </div>

              {/* Endpoint Body */}
              <div className="px-6 py-4">
                {ep.summary && <p className="text-gray-700 mb-3">{ep.summary}</p>}
                {ep.operationId && (
                  <p className="text-xs text-gray-500 mb-3">Operation ID: {ep.operationId}</p>
                )}

                {/* Mock URL for this endpoint */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Mock URL</p>
                  <code className="text-xs font-mono text-indigo-700 break-all">
                    {mockBaseUrl}{ep.path}
                  </code>
                </div>

                <h3 className="text-sm font-semibold text-gray-900 mb-2">Responses</h3>
                <div className="space-y-2">
                  {Object.entries(ep.responses).map(([statusCode, response]) => (
                    <div key={statusCode} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-700">{statusCode}</span>
                        <span className="text-xs text-gray-500">{response.description}</span>
                      </div>
                      {response.schema ? (
                        <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(response.schema, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No schema defined</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemaDetailPage;
