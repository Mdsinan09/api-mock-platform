import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SchemaListPage = () => {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/schemas`);
        setSchemas(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load schemas');
      } finally {
        setLoading(false);
      }
    };

    fetchSchemas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">All Schemas</h1>

      {schemas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">No schemas uploaded yet.</p>
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block"
          >
            Upload your first schema →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {schemas.map((schema) => (
            <Link
              key={schema.id}
              to={`/schemas/${schema.id}`}
              className="block bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{schema.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {new Date(schema.createdAt).toLocaleString()}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemaListPage;
