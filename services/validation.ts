import { z } from 'zod';
import { BrevitaResponse } from '../types';

// Define the Military Mode Schema
const MilitaryModeSchema = z.object({
    is_included: z.boolean().default(false),
    risk_level: z.string().optional(),
    actors: z.array(z.string()).optional().default([]),
    theater_tags: z.array(z.string()).optional().default([]),
    domain_tags: z.array(z.string()).optional().default([]),
    commander_brief: z.string().optional(),
    interests_and_objectives: z.string().optional(),
    timeline: z.string().optional(),
    risks_and_threats: z.string().optional(),
    operational_implications: z.string().optional(),
    tech_and_ai_relevance: z.string().optional(),
    watchpoints_for_commanders: z.array(z.string()).optional().default([])
});

// Define the Metadata Schema
const MetaDataSchema = z.object({
    title: z.string().default("Untitled Briefing"),
    source: z.string().optional(),
    date: z.string().optional(),
    url: z.string().optional(),
    mode: z.string().optional(),
    output_language: z.string().optional(),
    estimated_reading_time_seconds: z.number().default(0),
    category: z.string().optional().default("General"),
    tags: z.array(z.string()).default([]),
    region: z.string().optional(),
    country: z.string().optional(),
    reliability_score: z.number().min(0).max(100).optional(),
    credibility_analysis: z.string().optional(),
    entities: z.array(z.object({
        name: z.string(),
        type: z.enum(['person', 'org', 'location', 'event', 'other']),
        sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
        coordinates: z.object({
            lat: z.number(),
            lng: z.number()
        }).optional()
    })).optional().default([])
});

// Define the Main Response Schema
const BrevitaResponseSchema = z.object({
    meta: MetaDataSchema,
    summary_30s: z.string().min(1, "Summary is empty"),
    key_points: z.array(z.string()).default([]),
    context_notes: z.string().default(""),
    bias_or_uncertainty: z.string().default(""),
    military_mode: MilitaryModeSchema.default({
        is_included: false,
        actors: [],
        theater_tags: [],
        domain_tags: [],
        watchpoints_for_commanders: []
    }),
    // Grounding chunks are optional and usually added later, but allowing them here is fine
    groundingChunks: z.array(z.any()).optional()
});

/**
 * Validates the raw JSON response from the AI against the BrevitaResponse schema.
 * Throws a descriptive error if validation fails.
 */
export const validateBrevitaResponse = (data: unknown): BrevitaResponse => {
    try {
        return BrevitaResponseSchema.parse(data) as BrevitaResponse;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
            throw new Error(`Response Validation Failed: ${issues}`);
        }
        throw error;
    }
};
