import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { nextUrl: url, headers } = request
  
  const userAgent = headers.get('user-agent') || ''
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  // Evitamos la redirección si la petición es interna de Next.js (_next/data)
  // o si ya estamos en el subdominio móvil.
  if (isMobile && !url.hostname.startsWith('m.') && !url.pathname.startsWith('/_next')) {
    const mobileUrl = new URL(url.pathname, 'https://m.saladillovivo.com.ar')
    mobileUrl.search = url.search
    return NextResponse.redirect(mobileUrl, { status: 307 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Matcher actualizado para excluir explícitamente _next/data y archivos estáticos.
     * Esto permite que la versión de PC cargue sus noticias y configuraciones.
     */
    '/((?!api|_next/static|_next/data|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[\\w]+$).*)',
  ],
}