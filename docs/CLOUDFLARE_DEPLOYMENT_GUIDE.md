# ☁️ دليل النشر على Cloudflare - Cloudflare Deployment Guide

## **المتجر السعودي - Saudi Store**
### **نشر LLM على Cloudflare مع Tunnel مباشر**

---

## **📋 نظرة عامة**

سنقوم بـ:
1. نشر التطبيق على Cloudflare Pages
2. إنشاء Cloudflare Tunnel للاتصال بالخادم المحلي
3. تشغيل LLM Models على Cloudflare Workers AI
4. الحفاظ على AI نشط دائماً

---

## **🎯 البنية المعمارية**

```
Local Server (D:\LLM)
    ↓ Cloudflare Tunnel
Cloudflare Network
    ↓
Cloudflare Pages (Frontend)
Cloudflare Workers (API)
Cloudflare Workers AI (LLM)
Cloudflare Vectorize (Vector DB)
Cloudflare D1 (Database)
```

---

## **⚙️ الإعداد**

### **1. تثبيت Cloudflare CLI (Wrangler)**

```bash
npm install -g wrangler

# تسجيل الدخول
wrangler login
```

---

### **2. إنشاء Cloudflare Tunnel**

```bash
# تثبيت cloudflared
# Windows:
# قم بتحميل من: https://github.com/cloudflare/cloudflared/releases

# تسجيل الدخول
cloudflared tunnel login

# إنشاء tunnel جديد
cloudflared tunnel create saudi-store-tunnel

# سيتم إنشاء:
# - Tunnel ID
# - Credentials file
```

---

### **3. تكوين Tunnel**

**ملف: `cloudflared-config.yml`**

```yaml
tunnel: saudi-store-tunnel
credentials-file: /path/to/credentials.json

ingress:
  # Next.js App
  - hostname: saudi-store.yourdomain.com
    service: http://localhost:3050
  
  # WebSocket Server
  - hostname: ws.saudi-store.yourdomain.com
    service: http://localhost:3051
  
  # LLM Server
  - hostname: llm.saudi-store.yourdomain.com
    service: http://localhost:8000
  
  # PostgreSQL (optional, for admin)
  - hostname: db.saudi-store.yourdomain.com
    service: tcp://localhost:5432
  
  # Catch-all
  - service: http_status:404
```

---

### **4. تشغيل Tunnel**

```bash
# تشغيل Tunnel
cloudflared tunnel --config cloudflared-config.yml run saudi-store-tunnel

# أو كخدمة Windows
cloudflared service install
cloudflared service start
```

---

## **🤖 Cloudflare Workers AI**

### **ملف: `wrangler.toml`**

```toml
name = "saudi-store-ai"
main = "src/worker.ts"
compatibility_date = "2024-01-01"

# Cloudflare Workers AI
[ai]
binding = "AI"

# Cloudflare Vectorize
[[vectorize]]
binding = "VECTORIZE"
index_name = "saudi-store-embeddings"

# Cloudflare D1 Database
[[d1_databases]]
binding = "DB"
database_name = "saudi-store-db"
database_id = "your-database-id"

# KV for caching
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-id"

# Environment Variables
[vars]
ENVIRONMENT = "production"

# Secrets (use: wrangler secret put)
# OPENAI_API_KEY
# ANTHROPIC_API_KEY
# etc.
```

---

### **ملف: `src/worker.ts`**

```typescript
export interface Env {
  AI: any;
  VECTORIZE: Vectorize;
  DB: D1Database;
  CACHE: KVNamespace;
  
  // API Keys (secrets)
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  GOOGLE_AI_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Routes
    if (url.pathname === '/api/ai/generate') {
      return handleAIGeneration(request, env, corsHeaders);
    }
    
    if (url.pathname === '/api/ai/embed') {
      return handleEmbedding(request, env, corsHeaders);
    }
    
    if (url.pathname === '/api/ai/search') {
      return handleVectorSearch(request, env, corsHeaders);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

// ============================================
// AI GENERATION
// ============================================

async function handleAIGeneration(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const { model, prompt, systemPrompt } = await request.json();
    
    let response;
    
    // Use Cloudflare Workers AI for supported models
    if (model === '@cf/meta/llama-3-8b-instruct') {
      response = await env.AI.run(model, {
        messages: [
          { role: 'system', content: systemPrompt || 'You are a helpful assistant' },
          { role: 'user', content: prompt }
        ]
      });
    }
    // Use external APIs for other models
    else if (model.startsWith('gpt-')) {
      response = await callOpenAI(prompt, systemPrompt, env.OPENAI_API_KEY);
    }
    else if (model.startsWith('claude-')) {
      response = await callAnthropic(prompt, systemPrompt, env.ANTHROPIC_API_KEY);
    }
    
    return new Response(JSON.stringify({
      success: true,
      response
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// EMBEDDINGS
// ============================================

async function handleEmbedding(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const { text } = await request.json();
    
    // Use Cloudflare Workers AI for embeddings
    const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: text
    });
    
    return new Response(JSON.stringify({
      success: true,
      embeddings: embeddings.data[0]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// VECTOR SEARCH
// ============================================

async function handleVectorSearch(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const { query, topK = 10 } = await request.json();
    
    // Generate embedding for query
    const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: query
    });
    
    // Search in Vectorize
    const matches = await env.VECTORIZE.query(embedding.data[0], {
      topK,
      returnMetadata: 'all'
    });
    
    return new Response(JSON.stringify({
      success: true,
      matches
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// EXTERNAL API CALLS
// ============================================

async function callOpenAI(
  prompt: string,
  systemPrompt: string,
  apiKey: string
): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(
  prompt: string,
  systemPrompt: string,
  apiKey: string
): Promise<any> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });
  
  const data = await response.json();
  return data.content[0].text;
}
```

---

## **📦 النشر**

### **1. نشر Workers**

```bash
# نشر Worker
wrangler deploy

# إضافة Secrets
wrangler secret put OPENAI_API_KEY
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put GOOGLE_AI_API_KEY
```

### **2. نشر Pages**

```bash
# بناء التطبيق
npm run build

# نشر على Cloudflare Pages
wrangler pages deploy .next --project-name=saudi-store
```

### **3. إنشاء Vectorize Index**

```bash
wrangler vectorize create saudi-store-embeddings \
  --dimensions=768 \
  --metric=cosine
```

### **4. إنشاء D1 Database**

```bash
wrangler d1 create saudi-store-db
```

---

## **🔄 Keep AI Active**

### **ملف: `src/cron-worker.ts`**

```typescript
export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    // Keep AI warm - run every 5 minutes
    try {
      // Test AI endpoint
      await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [{ role: 'user', content: 'ping' }]
      });
      
      console.log('AI keepalive successful');
    } catch (error) {
      console.error('AI keepalive failed:', error);
    }
  }
};
```

**في `wrangler.toml`:**

```toml
[triggers]
crons = ["*/5 * * * *"]  # كل 5 دقائق
```

---

## **🌐 تحديث Frontend**

### **ملف: `.env.production`**

```env
# Cloudflare Workers AI
NEXT_PUBLIC_AI_API_URL=https://saudi-store-ai.yourusername.workers.dev

# Cloudflare Tunnel URLs
NEXT_PUBLIC_APP_URL=https://saudi-store.yourdomain.com
NEXT_PUBLIC_WS_URL=https://ws.saudi-store.yourdomain.com
NEXT_PUBLIC_LLM_URL=https://llm.saudi-store.yourdomain.com
```

### **تحديث Service:**

```typescript
// lib/services/cloudflare-ai.service.ts
export class CloudflareAIService {
  private static apiUrl = process.env.NEXT_PUBLIC_AI_API_URL;
  
  static async generate(prompt: string, model: string = '@cf/meta/llama-3-8b-instruct') {
    const response = await fetch(`${this.apiUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model })
    });
    
    return await response.json();
  }
  
  static async embed(text: string) {
    const response = await fetch(`${this.apiUrl}/api/ai/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    return await response.json();
  }
  
  static async search(query: string, topK: number = 10) {
    const response = await fetch(`${this.apiUrl}/api/ai/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, topK })
    });
    
    return await response.json();
  }
}
```

---

## **📊 Cloudflare Workers AI Models**

### **المتاح على Cloudflare:**

```typescript
// Text Generation
'@cf/meta/llama-3-8b-instruct'
'@cf/meta/llama-2-7b-chat-int8'
'@cf/mistral/mistral-7b-instruct-v0.1'

// Embeddings
'@cf/baai/bge-base-en-v1.5'
'@cf/baai/bge-small-en-v1.5'
'@cf/baai/bge-large-en-v1.5'

// Translation
'@cf/meta/m2m100-1.2b'

// Image Generation
'@cf/stabilityai/stable-diffusion-xl-base-1.0'

// Speech Recognition
'@cf/openai/whisper'
```

---

## **🔧 Local Development مع Tunnel**

```bash
# Terminal 1: تشغيل Next.js
npm run dev

# Terminal 2: تشغيل WebSocket
npm run ws

# Terminal 3: تشغيل Cloudflare Tunnel
cloudflared tunnel --config cloudflared-config.yml run

# Terminal 4: تشغيل Wrangler (local dev)
wrangler dev
```

---

## **📈 Monitoring**

### **Cloudflare Dashboard:**
- Workers Analytics
- Pages Analytics
- Tunnel Status
- AI Usage
- Vectorize Queries

### **Logs:**

```bash
# Worker logs
wrangler tail

# Tunnel logs
cloudflared tunnel info saudi-store-tunnel
```

---

## **💰 التكلفة**

### **Cloudflare Free Tier:**
- ✅ Workers: 100,000 requests/day
- ✅ Pages: Unlimited requests
- ✅ Tunnel: مجاني
- ✅ Workers AI: 10,000 neurons/day
- ✅ Vectorize: 5M queries/month
- ✅ D1: 5GB storage

### **Paid Plans:**
- Workers Paid: $5/month + usage
- Workers AI: Pay as you go
- Enterprise: Custom pricing

---

## **✅ قائمة التحقق**

- [ ] تثبيت wrangler
- [ ] تثبيت cloudflared
- [ ] إنشاء Cloudflare Tunnel
- [ ] تكوين cloudflared-config.yml
- [ ] إنشاء wrangler.toml
- [ ] إنشاء Worker
- [ ] إنشاء Vectorize Index
- [ ] إنشاء D1 Database
- [ ] إضافة Secrets
- [ ] نشر Worker
- [ ] نشر Pages
- [ ] تشغيل Tunnel
- [ ] اختبار الاتصال

---

## **🚀 الأوامر السريعة**

```bash
# Setup
npm install -g wrangler
wrangler login
cloudflared tunnel login

# Create Resources
cloudflared tunnel create saudi-store-tunnel
wrangler vectorize create saudi-store-embeddings --dimensions=768
wrangler d1 create saudi-store-db

# Deploy
wrangler deploy
wrangler pages deploy .next --project-name=saudi-store

# Run
cloudflared tunnel run saudi-store-tunnel
wrangler dev
npm run dev
```

---

**🎉 Cloudflare Deployment جاهز!**

**الميزات:**
✅ Cloudflare Tunnel للاتصال المباشر  
✅ Workers AI (16+ models)  
✅ Vectorize للبحث  
✅ D1 Database  
✅ Pages للـ Frontend  
✅ Keep AI Active (Cron)  
✅ Free Tier متاح  
✅ Global CDN  
✅ Auto-scaling  

**🚀 المتجر السعودي - Saudi Store**
