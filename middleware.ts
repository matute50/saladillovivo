import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { nextUrl: url, headers } = request
  
  // 1. Obtenemos el User-Agent
  const userAgent = headers.get('user-agent') || ''
  
  // 2. Definimos patrones de dispositivos móviles
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  // 3. Lógica de redirección
  // Solo redirigimos si es móvil Y no estamos ya en el subdominio 'm'
  if (isMobile && !url.hostname.startsWith('m.')) {
    const mobileUrl = new URL(url.pathname, 'https://m.saladillovivo.com.ar')
    
    // Conservamos los parámetros de búsqueda (ej: ?id=123)
    mobileUrl.search = url.search
    
    return NextResponse.redirect(mobileUrl, {
      status: 307 // Redirección temporal (mejor para pruebas que la 301)
    })
  }

  return NextResponse.next()
}

// Configuración del Matcher
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - api (rutas de API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono de la pestaña)
     * - archivos con extensiones comunes (png, jpg, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}