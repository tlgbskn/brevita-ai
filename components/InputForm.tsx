import React, { useState, useEffect } from 'react';
import { UserInput, AnalysisMode, OutputLanguage, SummaryLength } from '../types';
import { Settings, Newspaper, Link as LinkIcon, Calendar, Type, Loader2, Sparkles, Clock, Globe, Zap } from 'lucide-react';

interface InputFormProps {
  onSubmit: (input: UserInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserInput>({
    url: '',
    title: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    mode: AnalysisMode.STANDARD,
    outputLanguage: OutputLanguage.EN,
    summaryLength: 30,
    article: ''
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('brevita_pref_mode');
    const savedLang = localStorage.getItem('brevita_pref_lang');

    setFormData(prev => ({
      ...prev,
      mode: (savedMode as AnalysisMode) || AnalysisMode.STANDARD,
      outputLanguage: (savedLang as OutputLanguage) || OutputLanguage.EN
    }));
  }, []);

  const handleChange = (field: keyof UserInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.article.trim() && !formData.url.trim()) return;

    // Save preferences
    localStorage.setItem('brevita_pref_mode', formData.mode);
    localStorage.setItem('brevita_pref_lang', formData.outputLanguage);

    onSubmit(formData);
  };

  const isValid = formData.article.trim().length > 0 || formData.url.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">

      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Newspaper size={18} /> New Briefing
          </h2>
          <div className="text-xs text-slate-400 dark:text-slate-500 font-mono uppercase">
            Gemini 3.0 Pro Active
          </div>
        </div>

        {/* Quickstart Presets */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, mode: AnalysisMode.STANDARD, article: "Check this text for disinformation patterns, verifying claims against known propaganda narratives centered on..." }))}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
          >
            <Sparkles size={12} /> Disinfo Check
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, mode: AnalysisMode.MILITARY, article: "Analyze this report for maritime security incidents, specifically looking for vessel names (IMO), coordinates, and attribution..." }))}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            <Zap size={12} /> Maritime Incident
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, mode: AnalysisMode.STANDARD, article: "Review this technical disclosure for CVE vulnerabilities, unaffected versions, and mitigation steps..." }))}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-red-400 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap"
          >
            <Settings size={12} /> CVE Analysis
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Main Text Area */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Article Text <span className="text-slate-400 font-normal text-xs ml-2">(Optional if URL is provided)</span>
          </label>
          <textarea
            className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
            placeholder="Paste article content here OR provide a URL below for auto-extraction..."
            value={formData.article}
            onChange={(e) => handleChange('article', e.target.value)}
          />
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <LinkIcon className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Source URL (Required if text empty)"
              className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 ${!formData.article && !formData.url ? 'border-red-300 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'
                }`}
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
            />
          </div>
          <div className="relative">
            <Type className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Article Title (Optional)"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>
          <div className="relative">
            <Newspaper className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Source Name (Optional)"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600 dark:text-slate-300"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
          </div>
        </div>

        {/* Configuration Toggles */}
        <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Analysis Mode */}
          <div>
            <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Settings size={12} /> Mode
            </label>
            <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-indigo-100 dark:border-indigo-900/50 shadow-sm inline-flex w-full">
              <button
                type="button"
                onClick={() => handleChange('mode', AnalysisMode.STANDARD)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${formData.mode === AnalysisMode.STANDARD
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => handleChange('mode', AnalysisMode.MILITARY)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${formData.mode === AnalysisMode.MILITARY
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                <Zap size={10} /> Military
              </button>
            </div>
          </div>

          {/* Summary Length */}
          <div>
            <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Clock size={12} /> Summary Length
            </label>
            <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-indigo-100 dark:border-indigo-900/50 shadow-sm inline-flex w-full">
              {[15, 30, 60].map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => handleChange('summaryLength', len as SummaryLength)}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${formData.summaryLength === len
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  {len}s
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Globe size={12} /> Output Language
            </label>
            <div className="flex gap-4 pt-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lang"
                  checked={formData.outputLanguage === OutputLanguage.EN}
                  onChange={() => handleChange('outputLanguage', OutputLanguage.EN)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 dark:bg-slate-700"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">English</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lang"
                  checked={formData.outputLanguage === OutputLanguage.TR}
                  onChange={() => handleChange('outputLanguage', OutputLanguage.TR)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 dark:bg-slate-700"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Turkish</span>
              </label>
            </div>
          </div>

        </div>

      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 text-right">
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="relative overflow-hidden inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 group"
        >
          {/* Subtle sheen animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Initializing...
            </>
          ) : (
            <>
              <Sparkles size={18} className="group-hover:rotate-12 transition-transform" /> Generate Briefing
            </>
          )}
        </button>
      </div>

    </form>
  );
};

export default InputForm;