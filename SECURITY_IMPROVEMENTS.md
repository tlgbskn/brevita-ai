# Security and Reliability Improvement Suggestions

The following items are prioritized recommendations based on the current Brevita.ai codebase.

## 1) Disable Supabase features when credentials are missing
- **Issue:** `services/supabase.ts` always instantiates a client, even when `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are absent. Downstream calls (e.g., `supabase.auth.getSession()` in `App.tsx`) will attempt network traffic against placeholder endpoints and emit noisy errors, which can mask real failures.
- **Recommendation:** Export an `isSupabaseConfigured` flag and short-circuit auth/history logic when false. Hide the sign-in UI, skip auth listeners, and force `historyService` to use IndexedDB-only mode until valid credentials are supplied.

## 2) Harden client-side secret handling
- **Issue:** The Gemini API key is read directly from `import.meta.env` at runtime in `App.tsx`. Because Vite inlines env vars, the key ships to the client bundle, making it trivially extractable.
- **Recommendation:** Proxy Gemini calls through a serverless endpoint (e.g., Supabase Edge Function or Cloudflare Worker) so the key stays server-side. Gate requests with per-user auth and rate limiting to prevent abuse.

## 3) Add integrity checks for stored briefings
- **Issue:** Responses saved to history are persisted without schema validation in `services/historyService.ts`. Malformed or tampered records could break rendering in `AnalysisView` or during migrations.
- **Recommendation:** Introduce a Zod schema for `BrevitaResponse`, validate before insert/update, and coerce or reject invalid rows. Consider signing records with an HMAC if integrity is important across sync boundaries.

## 4) Surface Supabase errors to the UI with fallbacks
- **Issue:** Cloud failures currently log to the console and silently fall back to local storage in `historyService.getAll`/`delete`/`clear`. Users receive no feedback that cloud sync is unhealthy.
- **Recommendation:** Bubble Supabase errors into a toast/banner with a "working offline" indicator, and queue pending mutations for retry once connectivity returns.

## 5) Strengthen session handling in the UI
- **Issue:** Auth state listeners run even when Supabase is misconfigured, and `handleViewHistory` does not enforce a signed-in state before attempting cloud fetches.
- **Recommendation:** Use the proposed `isSupabaseConfigured` guard to register listeners conditionally, gate history access on `user`, and provide a clear "sign in to sync" CTA instead of silently failing.

## 6) Add privacy-preserving telemetry toggles
- **Issue:** There is no user-facing control to disable analytics/telemetry (if added later). Proactively providing a toggle and consent copy reduces privacy risk and simplifies compliance.
- **Recommendation:** Add a "Privacy" section in settings with explicit opt-in for any future logging, and default to minimal data collection.

## 7) Content Security Policy and iframe safety
- **Issue:** The single-page app currently lacks a documented Content Security Policy. If the app ever embeds third-party content, this increases XSS risk.
- **Recommendation:** Add a CSP via the hosting platform (e.g., `script-src 'self'; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com`). For iframes or embeds, set `sandbox` and `allow` attributes explicitly.
