import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  // const logoUrl = 'https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/e9eb6580b7ad5742826daaa5df2b592d.png';

  try {
    const { searchParams } = req.nextUrl;
    const title = searchParams.get('title') || 'Noticia de Saladillo Vivo';

    // Hardcode a simple red square data URI for testing the logo rendering
    const logoSrc: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0EAwAADGf2roKOxZAAAAAElFTSuQmCC';

    // Removed logo fetching logic
    /*
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
    */

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
            backgroundColor: '#003399', // Fondo sólido
            color: 'white',
            fontSize: 60,
            fontFamily: 'sans-serif', // Fuente genérica
          }}
        >
          <img width="85" height="85" src={logoSrc} style={{ marginBottom: 20 }} />
          <div>{title}</div>
        </div>
      ),
      {
        width: 1080,
        height: 1350,
        headers: {
          'Content-Disposition': 'inline; filename="branded_image.png"',
        },
      }
    );
  } catch (e: any) {
    console.error(`Failed to generate branded image: ${e.message}`);
    return new Response(`Failed to generate branded image. Error: ${e.message}`, { status: 500 });
  }
}
