import { NextResponse } from 'next/server'

export function middleware(request) {
  const { nextUrl: url, headers } = request
  
  // 1. Obtenemos el User-Agent (identificador del dispositivo)
  const userAgent = headers.get('user-agent') || ''
  
  // 2. Definimos patrones de dispositivos móviles comunes
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  // 3. Si es móvil, redirigimos al subdominio 'm'
  if (isMobile) {
    // Esto construye: https://m.saladillovivo.com.ar + la página que el usuario buscó
    const mobileUrl = new URL(url.pathname, 'https://m.saladillovivo.com.ar')
    return NextResponse.redirect(mobileUrl)
  }

  // 4. Si es PC, permitimos que la aplicación de escritorio cargue normal
  return NextResponse.next()
}

// Configuración para que el middleware no se ejecute en archivos estáticos (fotos, logos, etc.)
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - api (rutas de API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono de la pestaña)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}