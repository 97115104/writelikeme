const ApiClient = (() => {
    const PROVIDERS = {
        puter: {
            label: 'Puter GPT-OSS',
            defaultModel: 'openai/gpt-oss-120b'
        },
        openrouter: {
            label: 'OpenRouter',
            baseUrl: 'https://openrouter.ai/api/v1',
            defaultModel: 'anthropic/claude-sonnet-4'
        },
        anthropic: {
            label: 'Anthropic',
            baseUrl: 'https://api.anthropic.com/v1',
            defaultModel: 'claude-sonnet-4-5-20250929'
        },
        openai: {
            label: 'OpenAI',
            baseUrl: 'https://api.openai.com/v1',
            defaultModel: 'gpt-4o'
        },
        google: {
            label: 'Google Gemini',
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
            defaultModel: 'gemini-2.0-flash'
        },
        ollama: {
            label: 'Ollama (Local)',
            baseUrl: 'http://localhost:11434',
            defaultModel: 'gpt-oss:20b'
        },
        custom: {
            label: 'Custom Endpoint',
            baseUrl: 'https://api.openai.com/v1',
            defaultModel: 'gpt-4o'
        }
    };

    async function sendRequest({ apiKey, baseUrl, model, systemMessage, userMessage, apiMode, puterModel, ollamaUrl, ollamaModel }) {
        console.log('[ApiClient] sendRequest called with apiMode:', apiMode);
        
        if (apiMode === 'puter') {
            console.log('[ApiClient] Using Puter API with model:', puterModel || PROVIDERS.puter.defaultModel);
            return callPuterApi({ model: puterModel || PROVIDERS.puter.defaultModel, systemMessage, userMessage });
        }
        if (apiMode === 'ollama') {
            const base = (ollamaUrl || PROVIDERS.ollama.baseUrl).replace(/\/+$/, '');
            const modelName = ollamaModel || PROVIDERS.ollama.defaultModel;
            console.log('[ApiClient] Using Ollama API at', base, 'with model:', modelName);
            return callOllamaApi({ base, modelName, systemMessage, userMessage });
        }

        const provider = PROVIDERS[apiMode] || PROVIDERS.custom;
        const base = (baseUrl || provider.baseUrl || '').replace(/\/+$/, '');
        const modelName = model || provider.defaultModel;
        console.log('[ApiClient] Using', apiMode, 'API with model:', modelName);

        if (apiMode === 'anthropic') {
            return callAnthropicApi({ base, apiKey, modelName, systemMessage, userMessage });
        }
        if (apiMode === 'google') {
            return callGoogleApi({ base, apiKey, modelName, systemMessage, userMessage });
        }
        if (apiMode === 'openrouter') {
            return callOpenRouterApi({ base, apiKey, modelName, systemMessage, userMessage });
        }
        return callChatCompletionsApi({ base, apiKey, modelName, systemMessage, userMessage });
    }

    // --- Puter GPT-OSS ---
    async function callPuterApi({ model, systemMessage, userMessage }) {
        console.log('[ApiClient] callPuterApi - Checking Puter SDK...');
        if (typeof puter === 'undefined' || !puter.ai) {
            console.error('[ApiClient] Puter SDK not loaded');
            throw new Error('Puter SDK not loaded. Make sure the page includes the Puter script tag.');
        }
        console.log('[ApiClient] Puter SDK available, making request...');

        let response;
        try {
            response = await puter.ai.chat(
                [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: userMessage }
                ],
                { model }
            );
        } catch (err) {
            const msg = err?.message
                || err?.error?.message
                || err?.error?.code
                || err?.code
                || (typeof err === 'string' ? err : null)
                || JSON.stringify(err);

            const code = err?.error?.code || err?.code || '';
            const status = err?.error?.status || err?.status || 0;

            if (code === 'rate_limit_exceeded' || status === 429
                || msg.includes('rate_limit') || msg.includes('rate limit')
                || msg.includes('quota') || msg.includes('insufficient')) {
                const err2 = new Error('Puter free usage limit reached.');
                err2.puterFallback = true;
                throw err2;
            }

            if (code === 'auth_error' || code === 'unauthorized' || status === 401
                || msg.includes('auth') || msg.includes('login') || msg.includes('sign in')
                || msg.includes('session') || msg.includes('token_expired')) {
                const err2 = new Error(
                    'Puter authentication error. Your session may have expired.\n' +
                    'Try refreshing the page — Puter will prompt you to sign in again.'
                );
                err2.puterFallback = true;
                throw err2;
            }

            if (msg.includes('content_filter') || msg.includes('moderation') || msg.includes('flagged')) {
                throw new Error(
                    'Content was flagged by the model\'s safety filter. ' +
                    'Try rephrasing sensitive content or using a different model.'
                );
            }

            if (msg.includes('context_length') || msg.includes('too long') || msg.includes('max_tokens')) {
                throw new Error(
                    'Input is too long for this model. Try using fewer or shorter samples.'
                );
            }

            if (code === 'model_not_found' || status === 404 || msg.includes('not found') || msg.includes('invalid model')) {
                throw new Error(
                    'The selected Puter model was not found. ' +
                    'Try selecting a different model in API Settings.'
                );
            }

            if (status === 503 || status === 502 || msg.includes('unavailable') || msg.includes('overloaded')) {
                const err2 = new Error('Puter\'s AI service is temporarily unavailable.');
                err2.puterFallback = true;
                throw err2;
            }

            if (msg.includes('timeout') || msg.includes('timed out') || code === 'timeout') {
                throw new Error(
                    'The request timed out. The gpt-oss-120b model can take 30-60 seconds. ' +
                    'Try again, or switch to gpt-oss-20b for faster responses.'
                );
            }

            const err2 = new Error('Puter API error: ' + msg);
            err2.puterFallback = true;
            throw err2;
        }

        console.log('[ApiClient] Puter API response received:', response);
        const content = response?.message?.content;
        if (!content) {
            console.error('[ApiClient] No content in Puter response:', response);
            throw new Error(
                'No content returned from Puter API. The model may have refused the request. ' +
                'Full response: ' + JSON.stringify(response).substring(0, 300)
            );
        }
        console.log('[ApiClient] Puter API content length:', content.length);
        return content;
    }

    // --- Ollama (Local) ---
    async function callOllamaApi({ base, modelName, systemMessage, userMessage }) {
        const url = `${base}/v1/chat/completions`;

        const body = {
            model: modelName,
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            stream: false
        };

        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } catch (err) {
            if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                throw new Error(
                    'Could not connect to Ollama. Common fixes:\n' +
                    '1. Make sure Ollama is running\n' +
                    '2. Restart with CORS enabled: OLLAMA_ORIGINS=* ollama serve\n' +
                    '3. Check the URL is correct (default: http://localhost:11434)'
                );
            }
            throw new Error(`Ollama connection error: ${err.message}`);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const msg = errorData?.error?.message || errorData?.error || response.statusText;
            if (response.status === 404) {
                throw new Error(
                    `Model "${modelName}" not found. Run: ollama pull ${modelName}\n` +
                    'To see installed models: ollama list'
                );
            }
            throw new Error(`Ollama error (${response.status}): ${msg}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('No content returned from Ollama.');
        }
        return content;
    }

    // --- OpenAI Chat Completions ---
    async function callChatCompletionsApi({ base, apiKey, modelName, systemMessage, userMessage }) {
        const url = `${base}/chat/completions`;

        const body = {
            model: modelName,
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_completion_tokens: 4096
        };

        const data = await doFetch(url, { 'Authorization': `Bearer ${apiKey}` }, body);

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('No content returned from the API.');
        }
        return content;
    }

    // --- OpenRouter ---
    async function callOpenRouterApi({ base, apiKey, modelName, systemMessage, userMessage }) {
        const url = `${base}/chat/completions`;

        const body = {
            model: modelName,
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 4096
        };

        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin || 'https://writelikeme.app',
            'X-Title': 'Write Like Me'
        };

        const data = await doFetch(url, headers, body);
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('No content returned from OpenRouter.');
        }
        return content;
    }

    // --- Anthropic Messages API ---
    async function callAnthropicApi({ base, apiKey, modelName, systemMessage, userMessage }) {
        const url = `${base}/messages`;

        const body = {
            model: modelName,
            max_tokens: 4096,
            system: systemMessage,
            messages: [
                { role: 'user', content: userMessage }
            ]
        };

        const headers = {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        };

        const data = await doFetch(url, headers, body);

        const textBlock = data.content?.find(b => b.type === 'text');
        const content = textBlock?.text || null;
        if (!content) {
            throw new Error('No content returned from Anthropic API.');
        }
        return content;
    }

    // --- Google Gemini ---
    async function callGoogleApi({ base, apiKey, modelName, systemMessage, userMessage }) {
        const url = `${base}/models/${modelName}:generateContent?key=${apiKey}`;

        const body = {
            system_instruction: {
                parts: [{ text: systemMessage }]
            },
            contents: [
                {
                    role: 'user',
                    parts: [{ text: userMessage }]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096
            }
        };

        const data = await doFetch(url, {}, body);

        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        if (!content) {
            const blockReason = data.candidates?.[0]?.finishReason;
            if (blockReason === 'SAFETY') {
                throw new Error('Content was blocked by Gemini safety filters. Try rephrasing your request.');
            }
            throw new Error('No content returned from Google Gemini API.');
        }
        return content;
    }

    // --- Shared fetch helper ---
    async function doFetch(url, extraHeaders, body) {
        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...extraHeaders
                },
                body: JSON.stringify(body)
            });
        } catch (err) {
            if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                throw new Error(
                    'Network error — this is likely a CORS issue. ' +
                    'Try switching to Puter GPT-OSS (free, no CORS issues) or OpenRouter (CORS-friendly).'
                );
            }
            throw new Error(`Network error: ${err.message}`);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const msg = errorData?.error?.message || response.statusText;
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your key and try again.');
            }
            if (response.status === 429) {
                throw new Error(
                    'Rate limit exceeded (429). Wait a moment and try again, ' +
                    'or switch to Puter GPT-OSS (free).'
                );
            }
            if (response.status === 404) {
                throw new Error(`Endpoint not found (404). Check your API provider settings.`);
            }
            throw new Error(`API error (${response.status}): ${msg}`);
        }

        return response.json();
    }

    // --- Preflight check ---
    async function preflightCheck({ apiMode, ollamaUrl, ollamaModel, baseUrl, model, apiKey }) {
        console.log('[ApiClient] preflightCheck for apiMode:', apiMode);
        
        if (apiMode === 'ollama') {
            const base = (ollamaUrl || PROVIDERS.ollama.baseUrl).replace(/\/+$/, '');
            const modelName = ollamaModel || PROVIDERS.ollama.defaultModel;
            console.log('[ApiClient] Checking Ollama at', base, 'for model', modelName);

            // Check for mixed content issue (HTTPS page trying to access HTTP localhost)
            const isSecurePage = window.location.protocol === 'https:';
            const isHttpOllama = base.startsWith('http:');
            if (isSecurePage && isHttpOllama) {
                console.error('[ApiClient] Mixed content blocked: HTTPS page cannot access HTTP Ollama');
                return {
                    ok: false,
                    isMixedContent: true,
                    error: 'Browser security prevents HTTPS pages from accessing local Ollama (HTTP).'
                };
            }

            let tagsResponse;
            try {
                tagsResponse = await fetch(`${base}/api/tags`);
            } catch (err) {
                console.error('[ApiClient] Ollama connection failed:', err);
                // Double check if this might be mixed content
                if (isSecurePage) {
                    return {
                        ok: false,
                        isMixedContent: true,
                        error: 'Browser security prevents HTTPS pages from accessing local Ollama (HTTP).'
                    };
                }
                return {
                    ok: false,
                    error: 'Cannot connect to Ollama at ' + base + '.\n' +
                        'Make sure Ollama is running: OLLAMA_ORIGINS=* ollama serve'
                };
            }

            const tagsData = await tagsResponse.json().catch(() => null);
            const installedModels = (tagsData?.models || []).map(m => m.name);
            const installedNames = installedModels.map(n => n.split(':')[0]);

            if (installedModels.length === 0) {
                return {
                    ok: false,
                    error: 'Ollama is running but has no models installed.\n' +
                        'Run: ollama pull ' + modelName
                };
            }

            const modelBase = modelName.split(':')[0];
            const hasModel = installedModels.some(n => n === modelName) ||
                installedNames.some(n => n === modelBase);

            if (!hasModel) {
                const hasGptOss = installedNames.some(n => n.includes('gpt-oss'));
                let suggestion = 'Model "' + modelName + '" is not installed.\n' +
                    'Installed models: ' + installedModels.join(', ') + '\n\n';
                if (hasGptOss) {
                    const gptModel = installedModels.find(n => n.includes('gpt-oss'));
                    suggestion += 'You have ' + gptModel + ' installed — enter that as your model name.';
                } else {
                    suggestion += 'Run: ollama pull ' + modelName;
                }
                return { ok: false, error: suggestion };
            }

            return { ok: true, model: modelName, installedModels };
        }

        if (apiMode === 'custom') {
            const base = (baseUrl || '').replace(/\/+$/, '');
            if (!base) {
                return { ok: false, error: 'Please enter a Base URL in API Settings.' };
            }
            try {
                const resp = await fetch(`${base}/models`, {
                    headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
                });
                if (!resp.ok && resp.status === 401) {
                    return { ok: false, error: 'Invalid API key for custom endpoint.' };
                }
            } catch {
                return {
                    ok: false,
                    error: 'Cannot connect to ' + base + '.\nCheck the URL is correct.'
                };
            }
            return { ok: true };
        }

        return { ok: true };
    }

    // --- URL content fetching ---
    async function fetchUrlContent(url) {
        // Use a CORS proxy for fetching external content
        const corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?'
        ];

        let lastError = null;

        for (const proxy of corsProxies) {
            try {
                const response = await fetch(proxy + encodeURIComponent(url));
                if (response.ok) {
                    const html = await response.text();
                    return extractTextFromHtml(html);
                }
            } catch (err) {
                lastError = err;
            }
        }

        throw new Error('Could not fetch URL content. ' + (lastError?.message || 'The URL may be inaccessible.'));
    }

    function extractTextFromHtml(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Remove script, style, nav, footer, aside elements
        const removeSelectors = ['script', 'style', 'nav', 'footer', 'aside', 'header', 'noscript', 'iframe'];
        removeSelectors.forEach(sel => {
            doc.querySelectorAll(sel).forEach(el => el.remove());
        });

        // Try to find main content
        const contentSelectors = ['article', 'main', '.post-content', '.entry-content', '.content', '.article-body'];
        for (const sel of contentSelectors) {
            const el = doc.querySelector(sel);
            if (el && el.textContent.trim().length > 200) {
                return cleanText(el.textContent);
            }
        }

        // Fallback to body
        const body = doc.body;
        return body ? cleanText(body.textContent) : '';
    }

    function cleanText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
    }

    return { sendRequest, preflightCheck, fetchUrlContent, PROVIDERS };
})();
