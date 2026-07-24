import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import UploadPage from './pages/UploadPage.jsx';
import SchemaListPage from './pages/SchemaListPage.jsx';
import SchemaDetailPage from './pages/SchemaDetailPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-8">
                <Link to="/" className="text-xl font-bold text-indigo-600">
                  API Mock Platform
                </Link>
                <div className="hidden sm:flex gap-4">
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Upload Schema
                  </Link>
                  <Link
                    to="/schemas"
                    className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    All Schemas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/schemas" element={<SchemaListPage />} />
            <Route path="/schemas/:id" element={<SchemaDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
