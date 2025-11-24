import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { UserInput, BrevitaResponse } from "../types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      config: config
    });


    const text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini.");
    }

    const parsedResponse = parseRobustJSON(text) as BrevitaResponse;

    // Validate critical fields exist to prevent UI crashes
    if (!parsedResponse.meta) {
      throw new Error("Incomplete JSON structure received.");
    }

    // Extract grounding metadata (search sources) if available and merge into response
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      parsedResponse.groundingChunks = groundingChunks;
    }

    return parsedResponse;

  } catch (error) {
    console.error("Error generating analysis:", error);
    throw error;
  }
};
