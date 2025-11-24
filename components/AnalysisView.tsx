import React, { useState } from 'react';
import { BrevitaResponse, OutputLanguage } from '../types';
import { ShieldAlert, Info, List, Clock, Target, Eye, Zap, Activity, Share2, Copy, Check, Twitter, Download, FileText, Map, Globe, Printer, FileCode, ExternalLink } from 'lucide-react';
import { UI_TRANSLATIONS } from '../constants';

interface AnalysisViewProps {
  data: BrevitaResponse;
};

return (
  <div className="bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-xl border border-slate-700">
    <div className="bg-slate-800 px-5 py-3 border-b border-slate-700 flex items-center justify-between">
      <h3 className="font-mono text-sm font-bold tracking-widest text-amber-500 flex items-center gap-2">
        <ShieldAlert size={16} />
        {t.osint_dashboard}
      </h3>
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
    </div>

    <div className="p-5 space-y-6 text-sm">

      {/* Risk Level & Commander Brief */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs uppercase font-mono">{t.threat_level}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getRiskColor(data.risk_level)}`}>
            {data.risk_level || 'UNKNOWN'}
          </span>
        </div>

        <div className="bg-slate-800/80 p-3 rounded border-l-2 border-amber-500">
          <h4 className="text-amber-500 font-mono text-[10px] uppercase mb-1 flex items-center gap-1">
            <Zap size={10} /> {t.commanders_brief}
          </h4>
          <p className="text-slate-200 font-medium leading-snug italic">
            "{data.commander_brief || 'No brief generated.'}"
          </p>
        </div>
      </div>

      {/* Theaters & Domains */}
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {data.theater_tags?.map((tag, i) => (
            <span key={i} className="flex items-center gap-1 bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] border border-slate-700 uppercase">
              <Globe size={10} /> {tag}
            </span>
          ))}
          {data.domain_tags?.map((tag, i) => (
            <span key={i} className="flex items-center gap-1 bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] border border-slate-700 uppercase">
              <Map size={10} /> {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actors */}
      <div>
        <h4 className="text-slate-400 font-mono text-xs uppercase mb-2">{t.key_actors}</h4>
        <div className="flex flex-wrap gap-2">
          {data.actors.map((actor, i) => (
            <span key={i} className="bg-slate-800 text-slate-200 px-2 py-1 rounded text-xs border border-slate-700">
              {actor}
            </span>
          ))}
        </div>
      </div>

      {/* Objectives */}
      <div>
        <h4 className="text-slate-400 font-mono text-xs uppercase mb-2">{t.objectives}</h4>
        <p className="text-slate-300 leading-relaxed font-light border-l-2 border-slate-600 pl-3">
          {data.interests_and_objectives}
        </p>
      </div>

      {/* Risks */}
      <div>
        <h4 className="text-slate-400 font-mono text-xs uppercase mb-2">{t.risks}</h4>
        <p className="text-red-300 leading-relaxed font-light bg-red-900/10 p-2 rounded">
          {data.risks_and_threats}
        </p>
      </div>

      {/* Implications */}
      <div>
        <h4 className="text-slate-400 font-mono text-xs uppercase mb-2">{t.implications}</h4>
        <p className="text-slate-300 font-light">{data.operational_implications}</p>
      </div>

      {/* Tech */}
      {data.tech_and_AI_relevance && (
        <div>
          <h4 className="text-slate-400 font-mono text-xs uppercase mb-2 flex items-center gap-2">
            <Activity size={12} /> {t.tech_cyber}
          </h4>
          <p className="text-cyan-300 font-light text-xs">{data.tech_and_AI_relevance}</p>
        </div>
      )}

      {/* Watchpoints */}
      <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50">
        <h4 className="text-amber-500 font-mono text-xs uppercase mb-2 flex items-center gap-2">
          <Eye size={14} /> {t.watchpoints}
        </h4>
        <ul className="space-y-2">
          {data.watchpoints_for_commanders.map((wp, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300 font-mono text-xs">
              <span className="text-slate-600">[{i + 1}]</span>
              {wp}
            </li>
          ))}
        </ul>
      </div>

    </div>
  </div>
);
};

export default AnalysisView;