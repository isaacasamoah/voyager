import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for custom domain routing
 *
 * Supports:
 * - Custom domains (e.g., community.acme.com → /acme-corp)
 * - Subdomains (e.g., careersy.voyager.ai → /careersy)
 * - Path-based routing (e.g., voyager.ai/careersy → /careersy)
 *
 * Note: Domain mappings are hardcoded here because Edge Runtime
 * doesn't support filesystem access (can't read community configs)
 */

// Domain to community ID mappings
// Update this when adding custom domains in community configs
const DOMAIN_MAPPINGS: Record<string, string> = {
  // Add custom domains here as they're configured
  // 'community.acme.com': 'acme-corp',
  // 'careersy.voyager.ai': 'careersy',
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl

  // Skip middleware for:
  // - API routes
  // - Static files
  // - Next.js internals
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // Strip port for local dev
  const cleanHostname = hostname.split(':')[0]

  // Check if hostname matches a custom domain
  const communityId = DOMAIN_MAPPINGS[cleanHostname]

  if (communityId) {
    // Custom domain matched! Rewrite to community page

    // If already on community path, continue
    if (url.pathname.startsWith(`/${communityId}`)) {
      return NextResponse.next()
    }

    // If on root, rewrite to community page
    if (url.pathname === '/' || url.pathname === '') {
      return NextResponse.rewrite(
        new URL(`/${communityId}`, request.url)
      )
    }

    // For other paths, prepend community id
    return NextResponse.rewrite(
      new URL(`/${communityId}${url.pathname}`, request.url)
    )
  }

  // No custom domain match - use path-based routing
  return NextResponse.next()
}

// Configure which routes middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
