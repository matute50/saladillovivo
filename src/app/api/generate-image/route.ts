
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

// Configura el runtime para que se ejecute en el borde (edge) para máxima velocidad.
export const runtime = 'edge';

// Handler para la petición GET.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Extraer parámetros de la URL.
    const title = searchParams.get('title');
    const imageUrl = searchParams.get('image');
    const logoUrl = 'https://www.saladillovivo.com.ar/logo.png'; // URL del logo

    // Validar que los parámetros necesarios existan.
    if (!title || !imageUrl) {
      return new Response(`Faltan los parámetros "title" o "image"`, {
        status: 400,
      });
    }

    // 2. Generar la imagen usando ImageResponse.
    return new ImageResponse(
      (
        // Contenedor principal con flexbox y el degradado de fondo.
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            fontFamily: '"sans-serif"',
            background: 'linear-gradient(to bottom, #003399, #6699ff)',
            position: 'relative', // Para posicionar el logo de forma absoluta.
          }}
        >
          {/* Contenedor para la imagen de la noticia (70% superior) */}
          <div style={{ display: 'flex', width: '100%', height: '70%' }}>
            <img
              src={imageUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover', // Cubre el área sin deformar la imagen.
              }}
            />
          </div>

          {/* Contenedor para el título (30% inferior) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center', // Centra el título verticalmente.
              alignItems: 'flex-start',
              width: '100%',
              height: '30%',
              backgroundColor: 'rgba(0,0,0,0.6)', // Fondo semitransparente.
              padding: '40px 60px',
              boxSizing: 'border-box',
            }}
          >
            <p
              style={{
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: 1.2,
                maxHeight: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textShadow: '2px 2px 8px rgba(0,0,0,0.7)', // Sombra para profundidad.
              }}
            >
              {title}
            </p>
          </div>

          {/* Logo posicionado en la esquina inferior derecha */}
          <img
            src={logoUrl}
            alt="Logo Saladillo Vivo"
            style={{
              position: 'absolute',
              bottom: '30px',
              right: '40px',
              width: '180px',
              opacity: 0.9,
            }}
          />
        </div>
      ),
      // Opciones de la imagen de salida.
      {
        width: 1080,
        height: 1350,
      }
    );
  } catch (e: any) {
    console.error(e.message);
    return new Response('Error al generar la imagen.', { status: 500 });
  }
}
