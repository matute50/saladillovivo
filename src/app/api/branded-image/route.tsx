import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Define la URL de la fuente (por ejemplo, desde Google Fonts)
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap'; // Inter Bold

export async function GET(req: NextRequest) {
  try {
    // Cargar los datos de la fuente
    const fontResponse = await fetch(FONT_URL);
    const fontData = await fontResponse.arrayBuffer();

    const { searchParams } = req.nextUrl;
    const title = searchParams.get('title') || 'Noticia de Saladillo Vivo';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'blue', // Simple blue background
            color: 'yellow',
            fontSize: 60,
            fontFamily: '"Inter"', // Usar la fuente cargada
          }}
        >
          <div style={{ marginBottom: 20 }}>Test Image</div>
          <div>{title}</div>
        </div>
      ),
      {
        width: 1080,
        height: 1350,
        headers: {
          'Content-Disposition': 'inline; filename="test_image.png"',
        },
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );
  } catch (e: any) {
    console.error(`Failed to generate simple test image: ${e.message}`);
    return new Response(`Error generating image: ${e.message}`, { status: 500 });
  }
}
