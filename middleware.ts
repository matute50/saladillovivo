import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { nextUrl: url, headers } = request
  
  // 1. Obtenemos el User-Agent
  const userAgent = headers.get('user-agent') || ''
  
  // 2. Detección de móvil (Regex optimizada para no atrapar PCs)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  
  // 3. Verificamos en qué subdominio estamos actualmente
  const isMSubdomain = url.hostname.startsWith('m.')

  // CASO A: Es un celular en la URL de PC -> Redirigir a móvil
  if (isMobile && !isMSubdomain) {
    const mobileUrl = new URL(url.pathname, 'https://m.saladillovivo.com.ar')
    mobileUrl.search = url.search
    return NextResponse.redirect(mobileUrl, { status: 307 })
  }

  // CASO B: Es una PC en la URL de móvil -> Redirigir a escritorio (Evita errores si alguien comparte un link 'm.')
  if (!isMobile && isMSubdomain) {
    const desktopUrl = new URL(url.pathname, 'https://www.saladillovivo.com.ar')
    desktopUrl.search = url.search
    return NextResponse.redirect(desktopUrl, { status: 307 })
  }

  // CASO C: En cualquier otro caso, dejar pasar (Carga normal)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Matcher ultra-seguro: Solo aplica a páginas, 
     * no toca archivos internos de Next.js ni multimedia.
     */
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)',
  ],
}