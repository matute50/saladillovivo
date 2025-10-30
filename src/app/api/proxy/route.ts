import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const defaultImageUrl = 'https://saladillovivo.vercel.app/default-og-image.png';

  try {
    const { searchParams } = req.nextUrl;
    const imageUrl = searchParams.get('image');

    if (!imageUrl) {
      // If no image URL is provided, serve the default image
      const defaultImageResponse = await fetch(defaultImageUrl);
      const defaultImageBuffer = await defaultImageResponse.arrayBuffer();
      return new NextResponse(defaultImageBuffer, {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      });
    }

    // Try to fetch the provided external image
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      // If fetching fails, serve the default image
      const defaultImageResponse = await fetch(defaultImageUrl);
      const defaultImageBuffer = await defaultImageResponse.arrayBuffer();
      return new NextResponse(defaultImageBuffer, {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      });
    }

    // If fetching succeeds, serve the fetched image
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });

  } catch (e: any) {
    console.error(`Proxy error: ${e.message}`);
    // If any other error occurs, serve the default image as a last resort
    try {
      const defaultImageResponse = await fetch(defaultImageUrl);
      const defaultImageBuffer = await defaultImageResponse.arrayBuffer();
      return new NextResponse(defaultImageBuffer, {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      });
    } catch (defaultFetchError) {
      console.error(`Failed to fetch even the default image: ${defaultFetchError}`);
      return new Response('Image processing failed completely', { status: 500 });
    }
  }
}
