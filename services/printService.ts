import { BrevitaResponse } from '../types';

export const generatePrintableHtml = (data: BrevitaResponse): string => {
  const { meta, summary_30s, key_points, context_notes, bias_or_uncertainty, military_mode } = data;
  const isMilitary = military_mode?.is_included;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${meta.title} - Brevita Intel Brief</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&family=Merriweather:wght@300;400;700&display=swap');
        
        :root {
          --primary: #1e293b;
          --accent: #4f46e5;
          --danger: #dc2626;
          --text: #334155;
          --bg: #ffffff;
        }

        @media print {
          @page { margin: 2cm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }

        body {
          font-family: 'Merriweather', serif;
          color: var(--text);
          line-height: 1.6;
          max-width: 210mm;
          margin: 0 auto;
          background: var(--bg);
        }

        .header {
          border-bottom: 2px solid var(--primary);
          padding-bottom: 1rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .brand {
          font-family: 'Inter', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: -0.05em;
        }

        .brand span { color: var(--accent); }

        .meta-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #64748b;
          border: 1px solid #e2e8f0;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        h1 {
          font-family: 'Inter', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 0.5rem;
          color: var(--primary);
        }

        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .metadata-item strong {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        h2 {
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.5rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-content {
          margin-bottom: 1.5rem;
          text-align: justify;
        }

        ul {
          padding-left: 1.25rem;
        }

        li {
          margin-bottom: 0.5rem;
        }

        .military-box {
          border: 1px solid #fee2e2;
          background: #fef2f2;
          padding: 1.5rem;
          border-radius: 8px;
          margin-top: 2rem;
          page-break-inside: avoid;
        }

        .military-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #fecaca;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }

        .military-title {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          color: #991b1b;
          text-transform: uppercase;
        }

        .risk-badge {
          background: #991b1b;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .footer {
          margin-top: 4rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          color: #94a3b8;
          text-align: center;
          display: flex;
          justify-content: space-between;
        }

        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 8rem;
          font-weight: 900;
          color: rgba(0, 0, 0, 0.03);
          pointer-events: none;
          z-index: -1;
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <div class="watermark">CONFIDENTIAL</div>

      <div class="header">
        <div class="brand">Brevita<span>.ai</span></div>
        <div class="meta-tag">Generated: ${date}</div>
      </div>

      <h1>${meta.title}</h1>

      <div class="metadata-grid">
        <div class="metadata-item">
          <strong>Source</strong>
          ${meta.source || 'Unknown Source'}
        </div>
        <div class="metadata-item">
          <strong>Date</strong>
          ${meta.date || 'N/A'}
        </div>
        <div class="metadata-item">
          <strong>Reading Time</strong>
          ${meta.estimated_reading_time_seconds} seconds
        </div>
        <div class="metadata-item">
          <strong>Category</strong>
          ${meta.category || 'General'}
        </div>
        ${meta.region ? `
        <div class="metadata-item">
          <strong>Region</strong>
          ${meta.region}
        </div>` : ''}
        ${meta.country ? `
        <div class="metadata-item">
          <strong>Country</strong>
          ${meta.country}
        </div>` : ''}
      </div>
      
      ${(meta.region || meta.country) ? `
      <h2>Geographic Context</h2>
      <div class="section-content">
        <p>
          <strong>Region:</strong> ${meta.region || 'N/A'} <br/>
          <strong>Country:</strong> ${meta.country || 'N/A'}
        </p>
        <div style="background: #f1f5f9; padding: 1rem; border-radius: 4px; border: 1px dashed #cbd5e1; text-align: center; color: #64748b; font-size: 0.8rem; margin-top: 0.5rem;">
           [Map Visualization Placeholder - See Digital Dashboard for Interactive Map]
        </div>
      </div>
      ` : ''}

      <h2>Executive Summary</h2>
      <div class="section-content">
        ${summary_30s.split('\n').map(p => `<p>${p}</p>`).join('')}
      </div>

      <h2>Key Points</h2>
      <div class="section-content">
        <ul>
          ${key_points.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>

      <h2>Context & Background</h2>
      <div class="section-content">
        <p>${context_notes}</p>
      </div>

      <h2>Bias Assessment</h2>
      <div class="section-content">
        <p><em>${bias_or_uncertainty}</em></p>
      </div>

      ${isMilitary ? `
      <div class="military-box">
        <div class="military-header">
          <span class="military-title">⚠️ Military / OSINT Analysis</span>
          <span class="risk-badge">${military_mode.risk_level || 'UNKNOWN'} RISK</span>
        </div>
        
        <div class="section-content">
          <strong>Commander's Brief:</strong>
          <p>${military_mode.commander_brief}</p>
        </div>

        <div class="section-content">
          <strong>Strategic Objectives:</strong>
          <p>${military_mode.interests_and_objectives}</p>
        </div>

        <div class="section-content">
          <strong>Risks & Threats:</strong>
          <p>${military_mode.risks_and_threats}</p>
        </div>

        <div class="section-content">
          <strong>Operational Implications:</strong>
          <p>${military_mode.operational_implications}</p>
        </div>
      </div>
      ` : ''}

      <div class="footer">
        <span>Brevita AI Intelligence Briefing</span>
        <span>Page 1</span>
        <span>CONFIDENTIAL</span>
      </div>
    </body>
    </html>
  `;
};
