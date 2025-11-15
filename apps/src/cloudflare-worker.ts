/**
 * Cloudflare Worker for Saudi Store AI
 * Handles AI requests, embeddings, and vector search
 */

export interface Env {
  // Cloudflare Bindings
  AI: any;
  VECTORIZE_PRODUCTS: Vectorize;
  VECTORIZE_DOCUMENTS: Vectorize;
  VECTORIZE_SUPPORT: Vectorize;
  DB: D1Database;
  CACHE: KVNamespace;
  SESSIONS: KVNamespace;
  STORAGE: R2Bucket;
  WEBSOCKET: DurableObjectNamespace;
  
  // API Keys (Secrets)
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  GOOGLE_AI_API_KEY: string;
  TOGETHER_AI_API_KEY: string;
  MISTRAL_API_KEY: string;
  COHERE_API_KEY: string;
  HUGGINGFACE_API_KEY: string;
  AZURE_OPENAI_API_KEY: string;
  AZURE_OPENAI_ENDPOINT: string;
  JWT_SECRET: string;
  
  // Environment Variables
  ENVIRONMENT: string;
  APP_NAME: string;
  APP_URL: string;
}

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Routes
      if (url.pathname === '/api/ai/generate') {
        return await handleAIGeneration(request, env);
      }
      
      if (url.pathname === '/api/ai/embed') {
        return await handleEmbedding(request, env);
      }
      
      if (url.pathname === '/api/ai/search') {
        return await handleVectorSearch(request, env);
      }
      
      if (url.pathname === '/api/ai/models') {
        return await handleGetModels(request, env);
      }
      
      if (url.pathname === '/api/ai/health') {
        return jsonResponse({ status: 'ok', timestamp: Date.now() });
      }
      
      return jsonResponse({ error: 'Not Found' }, 404);
    } catch (error: any) {
      console.error('Worker Error:', error);
      return jsonResponse({ error: error.message }, 500);
    }
  },
  
  // Cron handler - Keep AI warm
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      // Ping Cloudflare Workers AI
      await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [{ role: 'user', content: 'ping' }]
      });
      
      console.log('✅ AI keepalive successful');
    } catch (error) {
      console.error('❌ AI keepalive failed:', error);
    }
  }
};

// ============================================
// AI GENERATION
// ============================================

async function handleAIGeneration(request: Request, env: Env): Promise<Response> {
  const { model, prompt, systemPrompt, maxTokens, temperature } = await request.json();
  
  // Check cache first
  const cacheKey = `ai:${model}:${hashString(prompt)}`;
  const cached = await env.CACHE.get(cacheKey);
  if (cached) {
    return jsonResponse({ success: true, response: JSON.parse(cached), cached: true });
  }
  
  let response;
  
  // Cloudflare Workers AI Models
  if (model.startsWith('@cf/')) {
    response = await env.AI.run(model, {
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful assistant' },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens || 1000,
      temperature: temperature || 0.7
    });
    
    response = response.response || response.result;
  }
  // External APIs
  else if (model.startsWith('gpt-')) {
    response = await callOpenAI(prompt, systemPrompt, model, env.OPENAI_API_KEY, maxTokens, temperature);
  }
  else if (model.startsWith('claude-')) {
    response = await callAnthropic(prompt, systemPrompt, model, env.ANTHROPIC_API_KEY, maxTokens, temperature);
  }
  else if (model.startsWith('gemini-')) {
    response = await callGemini(prompt, systemPrompt, model, env.GOOGLE_AI_API_KEY, maxTokens, temperature);
  }
  else {
    return jsonResponse({ error: 'Unsupported model' }, 400);
  }
  
  // Cache response for 1 hour
  await env.CACHE.put(cacheKey, JSON.stringify(response), { expirationTtl: 3600 });
  
  return jsonResponse({ success: true, response, cached: false });
}

// ============================================
// EMBEDDINGS
// ============================================

async function handleEmbedding(request: Request, env: Env): Promise<Response> {
  const { text, model } = await request.json();
  
  const embeddingModel = model || '@cf/baai/bge-base-en-v1.5';
  
  const result = await env.AI.run(embeddingModel, { text });
  
  return jsonResponse({
    success: true,
    embeddings: result.data[0],
    model: embeddingModel
  });
}

// ============================================
// VECTOR SEARCH
// ============================================

async function handleVectorSearch(request: Request, env: Env): Promise<Response> {
  const { query, index = 'products', topK = 10, filter } = await request.json();
  
  // Generate embedding for query
  const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: query });
  
  // Select index
  let vectorize;
  switch (index) {
    case 'products':
      vectorize = env.VECTORIZE_PRODUCTS;
      break;
    case 'documents':
      vectorize = env.VECTORIZE_DOCUMENTS;
      break;
    case 'support':
      vectorize = env.VECTORIZE_SUPPORT;
      break;
    default:
      return jsonResponse({ error: 'Invalid index' }, 400);
  }
  
  // Search
  const matches = await vectorize.query(embedding.data[0], {
    topK,
    filter,
    returnMetadata: 'all',
    returnValues: false
  });
  
  return jsonResponse({
    success: true,
    matches: matches.matches,
    count: matches.count
  });
}

// ============================================
// GET AVAILABLE MODELS
// ============================================

async function handleGetModels(request: Request, env: Env): Promise<Response> {
  const models = [
    // Cloudflare Workers AI
    {
      id: '@cf/meta/llama-3-8b-instruct',
      name: 'Llama 3 8B',
      provider: 'Cloudflare',
      type: 'text-generation',
      free: true
    },
    {
      id: '@cf/meta/llama-2-7b-chat-int8',
      name: 'Llama 2 7B',
      provider: 'Cloudflare',
      type: 'text-generation',
      free: true
    },
    {
      id: '@cf/mistral/mistral-7b-instruct-v0.1',
      name: 'Mistral 7B',
      provider: 'Cloudflare',
      type: 'text-generation',
      free: true
    },
    {
      id: '@cf/baai/bge-base-en-v1.5',
      name: 'BGE Base',
      provider: 'Cloudflare',
      type: 'embeddings',
      free: true
    }
  ];
  
  // Add external models if API keys are configured
  if (env.OPENAI_API_KEY) {
    models.push(
      { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', type: 'text-generation', free: false },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', type: 'text-generation', free: false },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', type: 'text-generation', free: false }
    );
  }
  
  if (env.ANTHROPIC_API_KEY) {
    models.push(
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic', type: 'text-generation', free: false },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'Anthropic', type: 'text-generation', free: false }
    );
  }
  
  return jsonResponse({ success: true, models, count: models.length });
}

// ============================================
// EXTERNAL API CALLS
// ============================================

async function callOpenAI(
  prompt: string,
  systemPrompt: string,
  model: string,
  apiKey: string,
  maxTokens?: number,
  temperature?: number
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful assistant' },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens || 1000,
      temperature: temperature || 0.7
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(
  prompt: string,
  systemPrompt: string,
  model: string,
  apiKey: string,
  maxTokens?: number,
  temperature?: number
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens || 1024,
      system: systemPrompt || 'You are a helpful assistant',
      messages: [{ role: 'user', content: prompt }],
      temperature: temperature || 0.7
    })
  });
  
  const data = await response.json();
  return data.content[0].text;
}

async function callGemini(
  prompt: string,
  systemPrompt: string,
  model: string,
  apiKey: string,
  maxTokens?: number,
  temperature?: number
): Promise<string> {
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens || 1000,
          temperature: temperature || 0.7
        }
      })
    }
  );
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// ============================================
// UTILITIES
// ============================================

function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// ============================================
// DURABLE OBJECT - WebSocket
// ============================================

export class WebSocketDurableObject {
  state: DurableObjectState;
  sessions: Set<WebSocket>;
  
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.sessions = new Set();
  }
  
  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket', { status: 400 });
    }
    
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    this.sessions.add(server);
    
    server.accept();
    
    server.addEventListener('message', (event) => {
      this.broadcast(event.data);
    });
    
    server.addEventListener('close', () => {
      this.sessions.delete(server);
    });
    
    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
  
  broadcast(message: string) {
    for (const session of this.sessions) {
      try {
        session.send(message);
      } catch (error) {
        this.sessions.delete(session);
      }
    }
  }
}
