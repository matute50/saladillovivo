import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const defaultNewsImageUrl = 'https://saladillovivo.vercel.app/default-og-image.png';
  const logoUrl = 'https://www.saladillovivo.com.ar/logo.png';

  try {
    const { searchParams } = req.nextUrl;
    const title = searchParams.get('title') || 'Noticia de Saladillo Vivo';
    const originalImageUrl = searchParams.get('image');

    let newsImageSrc: string = defaultNewsImageUrl;
    if (originalImageUrl) {
      try {
        const imageResponse = await fetch(originalImageUrl);
        if (imageResponse.ok) {
          const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
          if (contentType.startsWith('image/')) {
            const buffer = await imageResponse.arrayBuffer();
            newsImageSrc = `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
          }
        }
      } catch (fetchError) {
        console.error(`Failed to fetch or process news image URL: ${originalImageUrl}`, fetchError);
      }
    }

    let logoSrc: string = logoUrl; // Fallback to URL if base64 conversion fails
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
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundColor: '#1a1a1a',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <img
            src={newsImageSrc}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 20%, transparent)',
            }}/>
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 51, 153, 0.8)',
              boxShadow: '0 0 15px rgba(102, 153, 255, 0.5)',
            }}
          >
            <img width="85" height="85" src={logoSrc} />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '50px',
              right: '50px',
              display: 'flex',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'white',
              fontSize: 68,
              fontFamily: '"Inter", "Arial", sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              textShadow: '0px 2px 10px rgba(0,0,0,0.8)',
              maxHeight: '40%',
              overflow: 'hidden',
            }}
          >
            {title}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '10px',
              background: 'linear-gradient(to right, #003399, #6699ff)',
            }}/>
        </div>
      ),
      {
        width: 1080,
        height: 1350,
      }
    );
  } catch (e: any) {
    console.error(`Failed to generate branded image: ${e.message}`);
    return new Response(`Failed to generate branded image. Error: ${e.message}`, { status: 500 });
  }
}
