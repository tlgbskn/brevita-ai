import React, { useState } from 'react';
import { HistoryItem, AnalysisMode, OutputLanguage } from '../types';
import { Trash2, Calendar, Clock, ChevronRight, History, ShieldAlert, Search, Filter } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onDelete, onClearAll }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | AnalysisMode>('ALL');
  const [filterLang, setFilterLang] = useState<'ALL' | OutputLanguage>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredHistory = history.filter(item => {
    const matchesSearch = (item.data.meta.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.data.summary_30s || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMode = filterMode === 'ALL'
      ? true
      : filterMode === AnalysisMode.MILITARY
        ? item.data.military_mode?.is_included
        : !item.data.military_mode?.is_included;

    const matchesLang = filterLang === 'ALL'
      ? true
      : item.data.meta.output_language === filterLang;

    const matchesCategory = filterCategory === 'ALL'
      ? true
      : item.data.meta.category === filterCategory;

    return matchesSearch && matchesMode && matchesLang && matchesCategory;
  });

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
          <History size={48} className="text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Briefings Yet</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
          Your generated intelligence briefings will appear here. Start by creating a new analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="text-indigo-600 dark:text-indigo-400" />
          Briefing Archive
        </h2>
        <button
          onClick={onClearAll}
          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium flex items-center gap-1 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors self-start md:self-auto"
        >
          <Trash2 size={16} /> Clear All
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search briefings..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Politics">Politics</option>
            <option value="Military">Military</option>
            <option value="Tech">Tech</option>
            <option value="Economy">Economy</option>
            <option value="Health">Health</option>
            <option value="Science">Science</option>
            <option value="General">General</option>
          </select>

          <select
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
          >
            <option value="ALL">All Modes</option>
            <option value={AnalysisMode.STANDARD}>Standard</option>
            <option value={AnalysisMode.MILITARY}>Military</option>
          </select>

          <select
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value as any)}
          >
            <option value="ALL">All Languages</option>
            <option value={OutputLanguage.EN}>English</option>
            <option value={OutputLanguage.TR}>Turkish</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            No briefings match your search criteria.
          </div>
        ) : (
          filteredHistory.map((item) => {
            const isMilitary = item.data.military_mode?.is_included;
            const date = new Date(item.timestamp).toLocaleDateString();
            const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-5 cursor-pointer transition-all shadow-sm hover:shadow-md relative overflow-hidden"
              >
                {/* Hover indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>

                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        {date} • {time}
                      </span>
                      {isMilitary && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 uppercase tracking-wide">
                          <ShieldAlert size={10} /> Military
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase border border-slate-200 dark:border-slate-700">
                        {item.data.meta.output_language}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate pr-8">
                      {item.data.meta.title || "Untitled Briefing"}
                    </h3>

                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                      {item.data.summary_30s}
                    </p>

                    {item.data.meta.source && (
                      <div className="mt-3 inline-block bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-300 font-medium border border-slate-100 dark:border-slate-700">
                        {item.data.meta.source}
                      </div>
                    )}

                    {/* Category & Tags */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.data.meta.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                          {item.data.meta.category}
                        </span>
                      )}
                      {item.data.meta.tags?.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 pl-2">
                    <button
                      onClick={(e) => onDelete(item.id, e)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete Briefing"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="mt-auto text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryView;