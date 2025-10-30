
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const logoUrl = 'https://www.saladillovivo.com.ar/logo.png'; // A known, public, static URL

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
            backgroundColor: '#003399',
            color: 'white',
            fontSize: 60,
          }}
        >
          <img src={logoUrl} width="500" height="500" />
          <div style={{ marginTop: 40 }}>Test Image</div>
        </div>
      ),
      {
        width: 1080,
        height: 1350,
      }
    );
  } catch (e: any) {
    console.error(`Failed to generate static test image: ${e.message}`);
    // Return a plain text error response for debugging
    return new Response(`Failed to generate image. Error: ${e.message}`, { status: 500 });
  }
}
