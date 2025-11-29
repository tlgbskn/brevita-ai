<ul className="space-y-3">
  {data.key_points.map((point, idx) => (
    <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2.5" />
      <span>{point}</span>
    </li>
  ))}
</ul>
          </section >

  {/* Grounding/Search Sources */ }
{
  data.groundingChunks && data.groundingChunks.length > 0 && (
    <section className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Globe size={16} /> {t.verified_sources}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {data.groundingChunks.map((chunk, i) => (
          chunk.web ? (
            <a
              key={i}
              href={chunk.web.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group"
            >
              <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{chunk.web.title}</span>
            </a>
          ) : null
        ))}
      </div>
    </section>
  )
}

        </div >

  {/* Right Column: Military Dashboard (Conditional) or Standard Meta */ }
  < div className = "space-y-6" >
  {
    isMilitary?(
            <MilitaryPanel data = { data.military_mode } lang = { lang } />
          ): (
        <div className = "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className = "text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{t.standard_analysis
  }</h3 >
    <p className="text-slate-500 dark:text-slate-400 text-sm">
      {t.standard_analysis_desc}
    </p>
            </div >
          )}
        </div >
      </div >
    </div >
  );
};

const MilitaryPanel = ({ data, lang }: { data: BrevitaResponse['military_mode'], lang: keyof typeof UI_TRANSLATIONS }) => {
  const t = UI_TRANSLATIONS[lang];

  const getRiskColor = (risk: string) => {
    const r = risk?.toUpperCase() || 'LOW';
    if (r.includes('HIGH')) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (r.includes('MEDIUM')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-green-500 bg-green-500/10 border-green-500/20';
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