
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 0 } // No cache for live check
    } as any);

    if (!response.ok) {
       return NextResponse.json({ isLive: false, status: response.status });
    }

    const contentType = response.headers.get('content-type') || '';
    
    // 1. YouTube Check
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const html = await response.text();
      
      // La prueba de oro en YouTube es el campo "isLive":true dentro del JSON ytInitialPlayerResponse
      // Los VOD (grabaciones) tienen "isLive":false o carecen del campo.
      const hasIsLiveTrue = html.includes('"isLive":true'); 
      const hasIsLiveNow = html.includes('"isLiveNow":true');
      const hasLiveBadge = html.includes('"label":"LIVE"');
      
      // IMPORTANTE: NO usamos isLiveBroadcast porque persiste en las grabaciones!
      const isLive = hasIsLiveTrue || hasIsLiveNow || (hasLiveBadge && !html.includes('"isLive":false'));
      
      console.log('[api/check-stream] YouTube deep check:', { hasIsLiveTrue, hasIsLiveNow, hasLiveBadge, isLive });
      
      return NextResponse.json({ 
        isLive, 
        type: 'youtube',
        isLiveTag: hasIsLiveTrue,
        isLiveNow: hasIsLiveNow,
        isBadge: hasLiveBadge
      }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }

    // 2. HLS Check (.m3u8)
    if (url.includes('.m3u8') || contentType.includes('application/vnd.apple.mpegurl') || contentType.includes('x-mpegURL')) {
      const playlist = await response.text();
      // Un stream en vivo suele carecer de #EXT-X-ENDLIST
      const isLive = !playlist.includes('#EXT-X-ENDLIST');
      return NextResponse.json({ isLive, type: 'hls' }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }

    // Default: Assume live
    return NextResponse.json(
      { isLive: true, type: 'unknown' },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );

  } catch (err: any) {
    return NextResponse.json(
      { isLive: false, error: err.message },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}
