/**
 * Cloudflare Worker — 대학 추천 JSON 생성 (Groq 무료 API 등)
 *
 * 배포:
 *   cd cloudflare-worker
 *   npx wrangler secret put GROQ_API_KEY
 *   npx wrangler deploy
 *
 * 앱에서 Worker URL을 입력하면 DuckDuckGo보다 먼저 이 Worker를 사용합니다.
 */
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

function corsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
    };
}

function jsonResponse(body, status, origin) {
    return new Response(JSON.stringify(body), {
        status: status || 200,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...corsHeaders(origin)
        }
    });
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') || '*';

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders(origin) });
        }

        if (request.method !== 'POST') {
            return jsonResponse({ error: 'POST only' }, 405, origin);
        }

        const apiKey = env.GROQ_API_KEY;
        if (!apiKey) {
            return jsonResponse({ error: 'GROQ_API_KEY secret not set' }, 500, origin);
        }

        let prompt = '';
        try {
            const body = await request.json();
            prompt = String(body.prompt || body.messages?.[0]?.content || '').trim();
        } catch (e) {
            return jsonResponse({ error: 'Invalid JSON body' }, 400, origin);
        }

        if (!prompt) {
            return jsonResponse({ error: 'prompt required' }, 400, origin);
        }

        const model = env.GROQ_MODEL || DEFAULT_MODEL;

        try {
            const upstream = await fetch(GROQ_URL, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.2,
                    max_tokens: 2800
                })
            });

            const data = await upstream.json();
            if (!upstream.ok) {
                return jsonResponse({
                    error: 'Groq API error',
                    status: upstream.status,
                    detail: data
                }, upstream.status, origin);
            }

            const text = data.choices?.[0]?.message?.content || '';
            return jsonResponse({ text, model, provider: 'groq' }, 200, origin);
        } catch (err) {
            return jsonResponse({ error: String(err.message || err) }, 502, origin);
        }
    }
};
