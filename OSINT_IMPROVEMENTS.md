# OSINT-Focused Improvement Ideas (Follow-up)

A second-pass review after recent upgrades surfaced the next set of OSINT-specific enhancements. These are grouped by capability and designed to plug into the current React/Supabase stack.

## 1) Collections, acquisition, and preservation
- Add configurable source profiles (RSS, Atom, JSONL APIs, CSV drops) with per-source crawl cadence, user agent, and robots.txt awareness to avoid accidental throttling.
- Normalize downloads into a single ingest schema (URL, MIME, raw text, hash, fetched_at, source tag) and persist raw artifacts to Supabase Storage with signed URLs for re-verification.
- Capture screenshots and PDF/HTML snapshots on ingest to preserve visual context and mitigate link rot.
- Introduce a “chain-of-custody” view that exposes the first-seen URL, downstream mirrors, hashes, and timestamps so analysts can attest provenance.

## 2) Entity, link, and pattern intelligence
- Add modular NER pipelines for people/orgs/locations/IOCs with confidence scores, plus enrichment hooks (WHOIS, Shodan, VirusTotal, CTI feeds) cached per indicator.
- Build a lightweight graph overlay (nodes = entities, edges = co-occurrence or shared attributes) with filters by time window, source trust, and tag.
- Ship reusable regex + ML detectors for callsigns, tail numbers, vessel identifiers, crypto wallets, and hash formats; surface them as inline highlights in the briefing UI.

## 3) Geotemporal and alerting workflows
- Standardize timestamps to UTC, add a timeline widget with burst detection, and allow histogram bucketing (hour/day/week) in `DashboardView`.
- Add geo-resolvers for place names and coordinates, render a map layer with density heatmaps, and allow polygon filters for AOI (area of interest) queries.
- Support saved searches with delivery channels (email/webhook) and dedupe rules so repeated hits from the same source are throttled.

## 4) Quality, scoring, and analyst collaboration
- Implement per-source trust scoring combined with content quality checks (readability, duplication, missing metadata) and surface a composite confidence badge in `AnalysisView`.
- Add triage states (New/In Review/Closed), ownership, and threaded comments; expose quick actions in `HistoryView` to re-run analysis after new enrichments.
- Provide redaction tooling for PII removal before export and track audit events (who viewed/exported) in Supabase for compliance.

## 5) Resilience, privacy, and safety
- Introduce rate-limit handling and jittered backoff for third-party enrichers, with a circuit breaker that automatically falls back to cached results.
- Add opt-in client-side encryption for sensitive artifacts prior to storage, with key material stored in the user’s session storage instead of Supabase.
- Expand the startup health check to cover Supabase availability and storage buckets so the UI can route users to offline mode before failures occur.

## 6) Productization and ergonomics
- Offer “quickstart” sample OSINT queries (e.g., maritime incident, disinformation cluster, vulnerability CVE) inside `InputForm` to reduce blank-screen time.
- Allow export of full evidence bundles (raw docs, screenshots, hashes, enriched entities) as a downloadable ZIP for case handoffs.
- Provide keyboard shortcuts for pinning, filtering, and exporting in `HistoryView`, and add global search across titles, tags, and entity fields.

These items are scoped to the existing codebase and should be achievable with incremental UI hooks in `DashboardView`, `HistoryView`, and `AnalysisView`, plus ingest/enrichment services alongside the current Supabase backend.
