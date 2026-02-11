import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  // Avoid redirecting if already on mobile domain or if it's a Next.js internal request
  const isNextInternal = request.nextUrl.pathname.startsWith('/_next')
  const isApi = request.nextUrl.pathname.startsWith('/api')

  if (isMobile && !isNextInternal && !isApi) {
    // Only redirect if we can clearly identify we are NOT on the mobile domain already
    // Vercel deployment URLs might not start with 'm.'
    const host = request.headers.get('host') || ''
    if (!host.startsWith('m.')) {
      const mobileUrl = new URL(request.nextUrl.pathname, 'https://m.saladillovivo.com.ar')
      mobileUrl.search = request.nextUrl.search
      return NextResponse.redirect(mobileUrl, { status: 307 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|mp3|woff|woff2|ttf|otf|css|js)$).*)',
  ],
}