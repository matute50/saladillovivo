import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { nextUrl: url, headers } = request
  
  // 1. Obtenemos el User-Agent
  const userAgent = headers.get('user-agent') || ''
  
  // 2. Definimos patrones de dispositivos móviles (Regex optimizada)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  
  // 3. Verificamos el subdominio actual
  const isMSubdomain = url.hostname.startsWith('m.')

  // CASO A: Usuario en móvil entrando al sitio de PC -> Redirigir a móvil
  if (isMobile && !isMSubdomain) {
    const mobileUrl = new URL(url.pathname, 'https://m.saladillovivo.com.ar')
    mobileUrl.search = url.search
    return NextResponse.redirect(mobileUrl, { status: 307 })
  }

  // CASO B: Usuario en PC entrando al sitio móvil -> Redirigir a escritorio
  // Esto corrige errores si alguien comparte un link de la versión 'm' a un usuario de PC
  if (!isMobile && isMSubdomain) {
    const desktopUrl = new URL(url.pathname, 'https://www.saladillovivo.com.ar')
    desktopUrl.search = url.search
    return NextResponse.redirect(desktopUrl, { status: 307 })
  }

  // En cualquier otro caso, continuar normalmente
  return NextResponse.next()
}

// Configuración del Matcher: El "filtro" de seguridad
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto las internas de Next.js y archivos estáticos:
     * - api: Endpoints de tu API
     * - _next/static: Archivos JS y CSS compilados
     * - _next/data: Peticiones de datos (ESTO EVITA LOS FALTANTES EN PC)
     * - _next/image: Imágenes optimizadas por Next.js
     * - favicon.ico, sitemap.xml, robots.txt
     * - Archivos con extensiones comunes (imágenes, fuentes, etc.)
     */
    '/((?!api|_next/static|_next/data|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot)).*)',
  ],
}