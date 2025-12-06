import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI } from "https://esm.sh/@google/generative-ai@0.12.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Verify User Auth (Optional but recommended)
        // const authHeader = req.headers.get('Authorization')!;
        // const supabaseClient = createClient(
        //   Deno.env.get('SUPABASE_URL') ?? '',
        //   Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        //   { global: { headers: { Authorization: authHeader } } }
        // )
        // const { data: { user }, error } = await supabaseClient.auth.getUser()
        // if (error || !user) throw new Error("Unauthorized");

        const { messages, config } = await req.json();

        // 2. Initialize Gemini
        const apiKey = Deno.env.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error("Missing GEMINI_API_KEY environment variable");
        }

        const genAI = new GoogleGenAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: config?.systemInstruction
        });

        // 3. Generate Content
        // Reconstruct the chat structure or single prompt content
        // For BREVITA, we typically send a single prompt as 'user' role
        const lastMessage = messages[messages.length - 1]; // Simply taking the last for now or mapped

        // Note: Deep alignment with local structure required if using multi-turn
        // Simple pass-through for Brevita's single-shot use case:
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: lastMessage.parts[0].text }] }],
        });

        const responseText = result.response.text();

        return new Response(JSON.stringify({ text: responseText }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
