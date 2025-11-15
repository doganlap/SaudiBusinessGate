import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { 
  securityHeadersMiddleware, 
  rateLimitMiddleware, 
  isAPIRoute,
  isPublicRoute 
} from "./lib/middleware/security";
// Temporarily disable license middleware due to Edge runtime compatibility
// import { licenseMiddleware } from "./lib/middleware/license.middleware";

// Main middleware function
export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Apply security headers to all requests
  let response = securityHeadersMiddleware(request);

  // 2. Apply rate limiting to API routes
  if (isAPIRoute(pathname) && !isPublicRoute(pathname)) {
    const rateLimitConfig = {
      limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000')
    };
    
    const rateLimitResponse = rateLimitMiddleware(request, rateLimitConfig);
    
    // If rate limited, return the error response
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }
    
    // Merge rate limit headers with security headers
    rateLimitResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
  }

  // 3. Authentication and license checks will be handled at API route level
  // to avoid Edge runtime compatibility issues with Node.js modules
  
  // Note: Complex authentication and license validation moved to individual 
  // API routes to prevent crypto/pg module conflicts in Edge runtime

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}