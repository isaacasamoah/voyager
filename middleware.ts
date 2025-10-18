import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAllCommunityConfigs } from './lib/communities'

/**
 * Middleware for custom domain routing
 *
 * Supports:
 * - Custom domains (e.g., community.acme.com → /acme-corp)
 * - Subdomains (e.g., careersy.voyager.ai → /careersy)
 * - Path-based routing (e.g., voyager.ai/careersy → /careersy)
 */
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

  // Get all community configurations
  const communities = getAllCommunityConfigs()

  // Check if hostname matches a community domain
  for (const community of communities) {
    if (community.branding?.domains && community.branding.domains.length > 0) {
      // Match against configured domains (strip port for local dev)
      const cleanHostname = hostname.split(':')[0]

      if (community.branding.domains.includes(cleanHostname)) {
        // Custom domain matched! Rewrite to community page

        // If already on community path, continue
        if (url.pathname.startsWith(`/${community.id}`)) {
          return NextResponse.next()
        }

        // If on root, rewrite to community page
        if (url.pathname === '/' || url.pathname === '') {
          return NextResponse.rewrite(
            new URL(`/${community.id}`, request.url)
          )
        }

        // For other paths, prepend community id
        return NextResponse.rewrite(
          new URL(`/${community.id}${url.pathname}`, request.url)
        )
      }
    }
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
