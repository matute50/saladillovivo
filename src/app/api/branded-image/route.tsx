import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
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
            fontFamily: 'sans-serif', // Rely on a generic system font
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
      }
    );
  } catch (e: any) {
    console.error(`Failed to generate simple test image: ${e.message}`);
    return new Response(`Error generating image: ${e.message}`, { status: 500 });
  }
}
