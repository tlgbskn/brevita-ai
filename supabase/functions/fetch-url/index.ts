import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { url } = await req.json();

        if (!url) {
            return new Response(JSON.stringify({ error: 'URL is required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log(`Fetching URL: ${url}`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove script, style, and navigation elements to clean up text
        $('script, style, nav, footer, header, aside, .ad, .advertisement').remove();

        // Extract useful metadata
        const title = $('title').text().trim() ||
            $('meta[property="og:title"]').attr('content') ||
            '';

        // Try to find the main content
        // This is a heuristic approach; specific sites might need custom selectors
        let articleText = '';
        const mainContent = $('article, main, .content, #content, .post-content, .article-body');

        if (mainContent.length > 0) {
            articleText = mainContent.first().text().replace(/\s+/g, ' ').trim();
        } else {
            // Fallback: get body text
            articleText = $('body').text().replace(/\s+/g, ' ').trim();
        }

        // Limit text length to avoid token limits (e.g. 15k chars is a safe starting point for summaries)
        const MAX_LENGTH = 15000;
        if (articleText.length > MAX_LENGTH) {
            articleText = articleText.substring(0, MAX_LENGTH) + '... (truncated)';
        }

        const source = new URL(url).hostname.replace('www.', '');

        return new Response(
            JSON.stringify({
                url,
                title,
                source,
                article: articleText
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error fetching URL:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});
