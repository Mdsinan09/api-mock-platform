import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { Layers, Menu, Moon, PlusCircle, Sun, X, Zap } from 'lucide-react';
import UploadPage from './pages/UploadPage.jsx';
import SchemaListPage from './pages/SchemaListPage.jsx';
import SchemaDetailPage from './pages/SchemaDetailPage.jsx';
import ToastContainer from './components/ToastContainer.jsx';

function NavLink({ to, icon: Icon, children, onClick }) {
  const location = useLocation();
  const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/20 shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
      {children}
    </Link>
  );
}

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 flex flex-col">
        <ToastContainer />

        {/* Top Navbar */}
        <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
                <Zap className="h-5 w-5 fill-white/20" />
              </span>
              <div>
                <span className="gradient-text text-xl font-extrabold tracking-tight">API Mock</span>
                <span className="ml-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  v2.0
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden items-center gap-2 md:flex">
              <NavLink to="/schemas" icon={Layers}>
                Dashboard & Schemas
              </NavLink>
              <NavLink to="/" icon={PlusCircle}>
                New Mock Spec
              </NavLink>

              <span className="mx-2 h-5 w-px bg-slate-200 dark:bg-slate-800" />

              <button
                onClick={() => setDark((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100/80 text-slate-600 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 transition-all active:scale-95"
                title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Overlay Menu */}
          {mobileOpen && (
            <div className="space-y-2 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 md:hidden animate-fade-in">
              <NavLink to="/schemas" icon={Layers} onClick={() => setMobileOpen(false)}>
                Dashboard & Schemas
              </NavLink>
              <NavLink to="/" icon={PlusCircle} onClick={() => setMobileOpen(false)}>
                New Mock Spec
              </NavLink>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setDark((prev) => !prev)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                >
                  {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
                  <span>{dark ? 'Light mode' : 'Dark mode'}</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content Area */}
        <main className="mx-auto max-w-7xl flex-1 w-full px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/schemas" element={<SchemaListPage />} />
            <Route path="/schemas/:id" element={<SchemaDetailPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white/50 dark:border-slate-800/80 dark:bg-slate-950/50 py-6 mt-12 transition-colors">
          <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-[10px]">API</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">API Mock Platform</span>
              <span>— Zero-Config OpenAPI Mock Server</span>
            </div>
            <p>Powered by OpenAPI 3.0 & Swagger 2.0 Engine</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
