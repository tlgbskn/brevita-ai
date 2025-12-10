import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { UserInput, BrevitaResponse } from "../types";
import { validateBrevitaResponse } from "./validation";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY,
});

/**
 * Robust JSON parser for LLM outputs.
 * Handles markdown code blocks and unescaped control characters within strings.
 */
function parseRobustJSON(str: string): any {
  // 1. Remove markdown code blocks if present
  let cleanStr = str.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();

  // 2. Find the outer JSON object boundaries
  const firstOpen = cleanStr.indexOf('{');
  const lastClose = cleanStr.lastIndexOf('}');

  if (firstOpen !== -1 && lastClose !== -1) {
    cleanStr = cleanStr.substring(firstOpen, lastClose + 1);
  }

  try {
    return JSON.parse(cleanStr);
  } catch (initialError: any) {
    // If simple parse fails, try to fix common LLM JSON issues like unescaped newlines in strings
    console.warn("Initial JSON parse failed, attempting strict sanitization...", initialError.message);

    try {
      let fixed = '';
      let inString = false;
      let isEscaped = false;

      for (let i = 0; i < cleanStr.length; i++) {
        const char = cleanStr[i];

        if (inString) {
          if (char === '\\') {
            isEscaped = !isEscaped;
            fixed += char;
          } else if (char === '"' && !isEscaped) {
            inString = false;
            fixed += char;
          } else {
            isEscaped = false;
            // Escape control characters that are invalid in JSON strings
            if (char === '\n') fixed += '\\n';
            else if (char === '\r') fixed += '\\r';
            else if (char === '\t') fixed += '\\t';
            else if (char.charCodeAt(0) < 32) {
              // Skip other control chars
            } else {
              fixed += char;
            }
          }
        } else {
          if (char === '"') {
            inString = true;
          }
          fixed += char;
        }
      }
      return JSON.parse(fixed);
    } catch (sanitizationError) {
      // If it still fails, throw the original or new error
      console.error("Sanitization failed:", sanitizationError);
      console.log("Failed Text:", str);
      throw new Error("The AI response was not in the expected JSON format. Please try again.");
    }
  }
}


/**
 * Retries an async operation with exponential backoff.
 * Useful for handling rate limits (429) or transient server errors (503).
 */
async function callWithRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  initialDelay: number = 2000
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;

      // Check for specific error conditions to retry
      const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED');
      const isTransient = error.message?.includes('503') || error.status === 503 || error.message?.includes('Overloaded');

      if (!isRateLimit && !isTransient) {
        throw error; // Don't retry other errors
      }

      if (attempt >= retries) {
        // Enhance error message on final failure
        if (isRateLimit) {
          throw new Error(`Service is currently busy (Rate Limit Exceeded). Please try again in a minute. (Failed after ${retries} attempts)`);
        }
        throw error;
      }

      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Unexpected retry loop exit");
}

export const generateAnalysis = async (input: UserInput): Promise<BrevitaResponse> => {
  // If no article text is provided, we MUST use the googleSearch tool to find content from the URL.
  const shouldUseSearch = !input.article.trim() && input.url.trim().length > 0;

  let userMessage = '';

  if (shouldUseSearch) {
    userMessage = `
ACTION REQUIRED: The user has provided a URL but NO text. 
You MUST use the Google Search tool to find the specific content of this URL: ${input.url}
Do NOT just search for general info. Search for the specific article content at that link.

METADATA:
URL: ${input.url}
TITLE: ${input.title}
SOURCE: ${input.source}
DATE: ${input.date}
MODE: ${input.mode}
OUTPUT_LANGUAGE: ${input.outputLanguage}
SUMMARY_LENGTH_SECONDS: ${input.summaryLength}
`.trim();
  } else {
    userMessage = `
URL: ${input.url}
TITLE: ${input.title}
SOURCE: ${input.source}
DATE: ${input.date}
MODE: ${input.mode}
OUTPUT_LANGUAGE: ${input.outputLanguage}
SUMMARY_LENGTH_SECONDS: ${input.summaryLength}
ARTICLE:
${input.article}
`.trim();
  }

  const config: any = {
    systemInstruction: SYSTEM_PROMPT,
  };

  if (shouldUseSearch) {
    config.tools = [{ googleSearch: {} }];
    // When using tools, we cannot enforce responseMimeType: 'application/json' strictly
    // in the same way as text-only requests. We rely on the Prompt's instruction.
  } else {
    config.responseMimeType = 'application/json';
  }

  try {
    let text = '';
    let response: any = null;

    // CHECK FOR PROXY URL (SECURITY IMPROVEMENT #2)
    const proxyUrl = import.meta.env.VITE_SUPABASE_FUNCTION_URL;

    if (proxyUrl) {
      // Use Edge Function Proxy with Retry
      console.log("Routing analysis through secure proxy...");

      await callWithRetry(async () => {
        const proxyResponse = await fetch(`${proxyUrl}/analyze-briefing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            messages: [{ role: 'user', parts: [{ text: userMessage }] }],
            config: { systemInstruction: SYSTEM_PROMPT }
          })
        });

        if (!proxyResponse.ok) {
          const errData = await proxyResponse.json().catch(() => ({}));
          // Propagate 429/503 status codes for retry logic
          const error: any = new Error(errData.error || `Proxy Error: ${proxyResponse.status}`);
          error.status = proxyResponse.status;
          throw error;
        }

        const data = await proxyResponse.json();
        text = data.text;
      });

    } else {
      // Direct Client-Side Call (Fallback) with Retry
      // console.warn("Using unsafe client-side API key. Configure VITE_SUPABASE_FUNCTION_URL to secure.");

      await callWithRetry(async () => {
        response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessage }]
            }
          ],
          config: config
        });
        text = response.text || '';
      });
    }

    if (!text) {
      throw new Error("No response generated from Gemini.");
    }


    // 1. Parse JSON robustly
    const parsedData = parseRobustJSON(text);

    // 2. Validate Schema using Zod
    const validatedResponse = validateBrevitaResponse(parsedData);

    // 3. Extract grounding metadata (search sources) if available and merge into response
    // 3. Extract grounding metadata (search sources) if available and merge into response
    if (response?.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      validatedResponse.groundingChunks = response.candidates[0].groundingMetadata.groundingChunks;
    }

    // 4. Fallback for Reading Time (if 0 or missing)
    if (!validatedResponse.meta.estimated_reading_time_seconds) {
      const summaryWords = validatedResponse.summary_30s.split(/\s+/).length;
      const keyPointsWords = validatedResponse.key_points.join(" ").split(/\s+/).length;
      const totalWords = summaryWords + keyPointsWords;
      // Average reading speed ~240 words/minute => 4 words/second
      validatedResponse.meta.estimated_reading_time_seconds = Math.ceil(totalWords / 4);
    }

    return validatedResponse;

  } catch (error: any) {
    console.error("Error generating analysis:", error);
    // Enhance error message if it's a validation error
    if (error.message.includes("Response Validation Failed")) {
      throw new Error(`AI generated invalid structure: ${error.message}`);
    }
    throw error;
  }
};
