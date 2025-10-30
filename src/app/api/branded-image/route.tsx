import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const logoUrl = 'https://www.saladillovivo.com.ar/logo.png'; // Logo URL

  try {
    const { searchParams } = req.nextUrl;
    const title = searchParams.get('title') || 'Noticia de Saladillo Vivo';

    let logoSrc: string = logoUrl; // Fallback a URL si la conversión a base64 falla
    try {
      const logoResponse = await fetch(logoUrl);
      if (logoResponse.ok) {
        const contentType = logoResponse.headers.get('content-type') || 'image/png';
        if (contentType.startsWith('image/')) {
          const buffer = await logoResponse.arrayBuffer();
          logoSrc = `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
        }
      }
    } catch (fetchError) {
      console.error(`Failed to fetch or process logo URL: ${logoUrl}`, fetchError);
    }

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
            fontFamily: 'sans-serif', // Rely on a generic system font
          }}
        >
          <div style={{ marginBottom: 20 }}>Test Image</div>
          <div>{title}</div>
          <img width="85" height="85" src={logoSrc} style={{ marginTop: 20 }} />
        </div>
      ),
      {
        width: 1080,
        height: 1350,
        headers: {
          'Content-Disposition': 'inline; filename="test_image.png"',
        },
      }
    );
  } catch (e: any) {
    console.error(`Failed to generate simple test image: ${e.message}`);
    return new Response(`Error generating image: ${e.message}`, { status: 500 });
  }
}
