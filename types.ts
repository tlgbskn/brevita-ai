export interface MetaData {
  title: string;
  source: string;
  date: string;
  url: string;
  mode: string;
  output_language: string;
  estimated_reading_time_seconds: number;
}

export interface MilitaryModeData {
  is_included: boolean;
  actors: string[];
  interests_and_objectives: string;
  timeline: string;
  risks_and_threats: string;
  operational_implications: string;
  tech_and_AI_relevance: string;
  watchpoints_for_commanders: string[];
  // New fields
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  theater_tags: string[];
  domain_tags: string[];
  commander_brief: string;
}

// Support for Google Search Grounding Metadata
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface BrevitaResponse {
  meta: MetaData;
  summary_30s: string; // Key kept for backward compatibility, but content varies by length
  key_points: string[];
  context_notes: string;
  bias_or_uncertainty: string;
  military_mode: MilitaryModeData;
  pdf_html: string;
  groundingChunks?: GroundingChunk[]; // Added for search sources
}

export enum OutputLanguage {
  EN = 'EN',
  TR = 'TR'
}

export enum AnalysisMode {
  STANDARD = 'STANDARD',
  MILITARY = 'MILITARY'
}

export type SummaryLength = 15 | 30 | 60;

export interface UserInput {
  url: string;
  title: string;
  source: string;
  date: string;
  mode: AnalysisMode;
  outputLanguage: OutputLanguage;
  summaryLength: SummaryLength;
  article: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  data: BrevitaResponse;
}