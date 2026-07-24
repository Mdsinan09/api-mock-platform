import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SchemaDetailPage = () => {
  const { id } = useParams();
  const [schema, setSchema] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [schemaRes, endpointsRes] = await Promise.all([
          axios.get(`${API_URL}/api/schemas/${id}`),
          axios.get(`${API_URL}/api/schemas/${id}/endpoints`)
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mb-4">{error}</div>
        <Link to="/schemas" className="text-indigo-600 hover:underline">
          ← Back to schemas
        </Link>
      </div>
    );
  }

  if (!schema) {
    return null;
  }

  const methodColor = (method) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-700';
      case 'POST':
        return 'bg-blue-100 text-blue-700';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-700';
      case 'PATCH':
        return 'bg-purple-100 text-purple-700';
      case 'DELETE':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{schema.name}</h1>
        <p className="text-sm text-gray-500">
          Created: {new Date(schema.createdAt).toLocaleString()} · Updated:{' '}
          {new Date(schema.updatedAt).toLocaleString()}
        </p>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Endpoints ({endpoints.length})</h2>

      {endpoints.length === 0 ? (
        <p className="text-gray-500">No endpoints found in this schema.</p>
      ) : (
        <div className="space-y-4">
          {endpoints.map((ep, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${methodColor(ep.method)}`}
                >
                  {ep.method}
                </span>
                <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                  {ep.path}
                </code>
              </div>
              <div className="px-6 py-4">
                {ep.summary && <p className="text-gray-700 mb-3">{ep.summary}</p>}
                {ep.operationId && (
                  <p className="text-xs text-gray-500 mb-3">Operation ID: {ep.operationId}</p>
                )}

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
