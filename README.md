# Brevita.ai – AI-Powered OSINT & Military Briefing Tool

> **Brevita.ai** is an AI-powered OSINT and military briefing assistant.  
> It turns unstructured news articles and open-source reports into structured, 60-second intelligence briefings with **military-grade analytical sections**.

---

## 🔍 What Brevita Does

Paste a news article (or report) and Brevita will:

- Generate a **concise executive summary** (15/30/60s style)
- Extract **key intelligence points**
- Provide **context** and a **bias/uncertainty check**
- In **Military Mode**, build an **OSINT dashboard** with:
  - Threat level (LOW / MEDIUM / HIGH)
  - Commander’s brief
  - Key actors
  - Risks & threats
  - Operational implications
  - Tech & cyber relevance
  - Watchpoints for commanders

All of this is powered by **Google Gemini (Gemini 2.5 Flash / 3.0 Pro)** via the Gemini API.

---

## ✨ Feature Highlights

### 🧠 AI Briefings

- Paste article text (and optionally the URL, title, and source).
- Brevita calls the Gemini API with a strict JSON schema.
- The UI renders a structured briefing similar to an intel slide:
  - Executive Summary  
  - Context  
  - Bias Check  
  - Key Intelligence Points  

### 🎖 Military / OSINT Mode

When **Military Mode** is enabled, Brevita adds:

- **Threat Level Badge** – LOW / MEDIUM / HIGH  
- **Commander’s Brief** – 2-4 sentences suitable to read aloud to a commander  
- **Theater & Domain Tags** – e.g. *Northern Syria, South Caucasus, Land, Air, Cyber*  
- **Objectives & Interests** – per key actor  
- **Risks & Threats** – escalation, regional stability, humanitarian impacts  
- **Operational Implications** – likely effects on posture, ISR, operations  
- **Commander Watchpoints** – a checklist of what to monitor next  

This turns raw news into something usable for **staff officers, planners, and analysts**.

### 🗂 Local Archive & History

- Every generated briefing can be saved to a **local archive** (via `localStorage`).
- Archive view lets you:
  - Re-open previous briefings
  - Inspect them in full detail
  - Re-export reports later

*(Scenario builder and multi-briefing aggregation are planned in the roadmap.)*

### 🌐 Dual Language Ready (EN / TR)

The app is designed to support **English** and **Turkish** outputs:

- English: professional, neutral OSINT / analytical English  
- Turkish: military & security terminology aligned with TR defence context  

Current version focuses on one language per call; the roadmap includes a **dual-language toggle per briefing**.

### 📝 Export Options

Brevita can generate export-ready text for:

- **Markdown (.md)** – for wikis and note-taking apps  
- **Plain text (.txt)** – for quick sharing or copy-paste  

Planned templates:

- **Default Briefing**
- **NATO-style** (SITUATION / ASSESSMENT / RISKS / RECOMMENDATIONS)
- **TR-Military style** (DURUM / DEĞERLENDİRME / MUHTEMEL GELİŞMELER / İZLENECEK HUSUSLAR)

PDF export (HTML → PDF) is also on the roadmap.

### 🔒 OSINT Ethics & Safety Layer (Design Goal)

Brevita is designed for **open-source (OSINT) information only**:

- Intended use: news, public statements, think-tank reports, open publications.
- Not intended for: classified plans, detailed operational orders, or sensitive internal reports.

The planned ethics layer will:

- Show a visible **OSINT-only disclaimer** in the UI.
- Warn when text appears to contain classification markers  
  (`SECRET`, `TOP SECRET`, `GİZLİ`, `ÇOK GİZLİ`, `HİZMETE ÖZEL`, etc.).
- Encourage **high-level, generic analysis** when content may be sensitive.

> ⚠ **Disclaimer:** This tool does not replace professional intelligence analysis or official decision-making processes. It is a decision-support and educational aid built on LLMs.

---

## 🧱 Tech Stack

- **Frontend:** React + TypeScript
- **Bundler / Dev Server:** Vite
- **Styling:** TailwindCSS (dark UI)
- **AI Backend:** Google Gemini API (Gemini 2.5 Flash / 3.0 Pro)
- **State & Storage:** React state + `localStorage`
- **Build Tools:** TypeScript, Vite config

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/tlgbskn/brevita-ai.git
cd brevita-ai
2. Install dependencies
bash
Copy code
npm install
# or
yarn install
3. Configure environment variables
Create a file named .env.local in the project root:

bash
Copy code
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
You can obtain a key from Google AI Studio.

⚠ Never commit your real API key to GitHub.
.env.local should be ignored by .gitignore.

4. Run the development server
bash
Copy code
npm run dev
# or
yarn dev
Open your browser at http://localhost:5173 (or the port Vite shows).

📁 Project Structure (simplified)
text
Copy code
.
├── components/
│   ├── InputForm.tsx          # URL + article input, mode & language selection
│   ├── AnalysisView.tsx       # Main briefing layout (summary, context, OSINT)
│   ├── HistoryView.tsx        # Archive / history list
│   ├── LoadingState.tsx       # Animated loading / skeleton UI
│   └── ...                    # Other UI components
│
├── services/
│   ├── geminiService.ts       # Gemini API client (JSON schema, prompt, parsing)
│   ├── historyService.ts      # Local storage handling for saved briefings
│   └── db.ts                  # (If present) light client-side storage helpers
│
├── types/
│   └── types.ts               # BrevitaResponse, MetaData, MilitaryMode, etc.
│
├── constants.ts               # SYSTEM_PROMPT and static config
├── App.tsx                    # Root React component
├── main/index.tsx             # Vite entry point
├── vite.config.ts             # Vite configuration
├── package.json
└── README.md
(Some filenames may differ slightly depending on the latest refactors.)

🧪 Scripts
Common npm scripts (see package.json):

bash
Copy code
npm run dev      # start dev server
npm run build    # create production build
npm run preview  # preview production build locally
🗺 Roadmap
Planned / in-progress features:

 Scenario Builder:
Group multiple briefings into a single operational scenario
(e.g., “Northern Syria – Week 47/2025”) and generate combined analysis.

 Dual-language per briefing (EN + TR toggle)

 Template-based export: Default / NATO / TR-Military (PDF, MD, TXT)

 OSINT Ethics layer: UI warnings + keyword checks for classified markers

 URL auto-extraction backend: server/service to fetch and parse articles from URLs

 Chrome/Edge extension: highlight → brief directly from the browser

🤝 Contributing
This project is currently developed primarily as a personal / portfolio project with a defence & OSINT focus.

If you want to:

Suggest features

Report a bug

Discuss military / defence AI workflows

you can open an Issue or a Pull Request on GitHub.

📜 License
This project is licensed under the MIT License – see the LICENSE file for details.

🙏 Acknowledgements
Google Gemini team for the language models and API.

Open-source OSINT community for tools, methods, and inspiration.

Defence and security professionals who continuously explore safe and ethical use of AI in military contexts.
