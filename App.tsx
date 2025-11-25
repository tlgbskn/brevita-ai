import React, { useState, useEffect } from 'react';
import { Bot, Github, FileText, ChevronLeft, Moon, Sun, History, Database, CheckCircle, ShieldCheck, LogIn, LogOut } from 'lucide-react';
import InputForm from './components/InputForm';
import AnalysisView from './components/AnalysisView';
import { LoadingState } from './components/LoadingState';
import HistoryView from './components/HistoryView';
import { UserInput, BrevitaResponse, HistoryItem, AnalysisMode, SummaryLength } from './types';
import { generateAnalysis } from './services/geminiService';
import { historyService } from './services/historyService';
import { supabase } from './services/supabase';
import { AuthModal } from './components/AuthModal';
import { User } from '@supabase/supabase-js';

type AppView = 'input' | 'history' | 'result';

const App: React.FC = () => {
  const [result, setResult] = useState<BrevitaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<AppView>('input');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [migrationSuccess, setMigrationSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Track metadata for the loading screen
  const [processingMeta, setProcessingMeta] = useState<{ mode: AnalysisMode, length: SummaryLength }>({
    mode: AnalysisMode.STANDARD,
    length: 30
  });

  // Dark mode state initialization
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Effect to apply dark mode class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initialize backend and load history on mount
  useEffect(() => {
    const initBackend = async () => {
      try {
        const wasMigrated = await historyService.init();
        if (wasMigrated) {
          setMigrationSuccess(true);
          setTimeout(() => setMigrationSuccess(false), 5000);
        }

        const items = await historyService.getAll();
        setHistory(items);
      } catch (e) {
        console.error("Failed to initialize local backend:", e);
      }
    };
    initBackend();
  }, [user]); // Reload history when user changes

  const toggleTheme = () => setIsDark(!isDark);

  const handleAnalysis = async (input: UserInput) => {
    // Capture selection for loading screen
    setProcessingMeta({
      mode: input.mode,
      length: input.summaryLength
    });

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateAnalysis(input);
      setResult(data);

      // Async save to DB
      const savedItem = await historyService.save(data);

      // Update local state optimistically
      setHistory(prev => [savedItem, ...prev]);

      setView('result');
    } catch (err) {
      setError("Failed to generate analysis. Please try again or check your input.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setView('input');
  };

  const handleViewHistory = async () => {
    setError(null);
    // Refresh history from DB to ensure sync
    const items = await historyService.getAll();
    setHistory(items);
    setView('history');
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setResult(item.data);
    setView('result');
  };

  const handleHistoryDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await historyService.delete(id);
      setHistory(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to delete all history? This action cannot be undone.')) {
      await historyService.clear();
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">

      {/* Migration Toast */}
      {migrationSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle size={20} />
            <div>
              <h4 className="font-bold text-sm">Database Upgraded</h4>
              <p className="text-xs text-green-100">Your history has been migrated to local storage.</p>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
              <Bot size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Brevita<span className="text-indigo-600 dark:text-indigo-400">.ai</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden lg:inline-flex items-center gap-1 text-xs font-mono text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded">
              MODEL: GEMINI-3.0-PRO
            </span>

            <button
              onClick={handleViewHistory}
              className={`p-2 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 ${view === 'history' ? 'text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800' : 'text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400'}`}
              aria-label="View History"
              title="Briefing Archive"
            >
              <div className="relative">
                <History size={20} />
                {history.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => user ? supabase.auth.signOut() : setIsAuthModalOpen(true)}
              className="p-2 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title={user ? "Sign Out" : "Sign In"}
            >
              {user ? <LogOut size={20} /> : <LogIn size={20} />}
            </button>

            <a href="#" className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors hidden sm:block">
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {isLoading ? (
          <LoadingState
            targetLength={processingMeta.length}
            mode={processingMeta.mode}
          />
        ) : view === 'history' ? (
          <HistoryView
            history={history}
            onSelect={handleHistorySelect}
            onDelete={handleHistoryDelete}
            onClearAll={handleClearHistory}
          />
        ) : view === 'result' && result ? (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <ChevronLeft size={16} /> New Briefing
              </button>
              <button
                onClick={handleViewHistory}
                className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Back to Archive
              </button>
            </div>
            <AnalysisView data={result} />
          </div>
        ) : (
          // Input View
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
            <div className="text-center space-y-3 mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Turn Noise into <span className="text-indigo-600 dark:text-indigo-400">Intelligence</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                Generate 30-second briefings and deep-dive military analysis from any article instantly.
              </p>
            </div>
            <InputForm onSubmit={handleAnalysis} isLoading={isLoading} />

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-center md:text-left">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-2 mx-auto md:mx-0">
                  <FileText size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">30-Second Reads</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Concise executive summaries optimized for rapid consumption.</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center mb-2 mx-auto md:mx-0">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">OSINT Analysis</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Optional military mode analyzes risks, actors, and strategic threats.</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-2 mx-auto md:mx-0">
                  <Database size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Local Backend</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Secure, browser-native database stores unlimited briefings offline.</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-slate-400 dark:text-slate-500 text-sm gap-4">
          <p>© 2024 Brevita AI. Powered by Google Gemini.</p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
              <Database size={12} className={history.length > 0 ? "text-green-500" : "text-slate-400"} />
              <span>LOCAL DB: {history.length > 0 ? 'ACTIVE' : 'READY'} ({history.length})</span>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default App;