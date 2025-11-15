// Cloudflare Pages Functions
// This file handles routing for Pages Functions

export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  
  // Handle API routes through Workers
  if (url.pathname.startsWith('/api/')) {
    // Forward to main worker
    const workerUrl = new URL(request.url);
    workerUrl.hostname = 'dogan-ai-platform.dogan-ai.workers.dev';
    
    return fetch(workerUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
  }
  
  // Handle static files normally
  return context.next();
}