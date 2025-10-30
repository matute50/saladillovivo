import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'red', // Simple red background
            color: 'white',
            fontSize: 60,
          }}
        >
          Hello World!
        </div>
      ),
      {
        width: 1080,
        height: 1350,
      }
    );
  } catch (e: any) {
    console.error(`Failed to generate simple test image: ${e.message}`);
    return new Response(`Error generating image: ${e.message}`, { status: 500 });
  }
}
