
import { NextResponse } from 'next/server';
import RSS from 'rss';
import { getArticlesForRss } from '@/lib/data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.saladillovivo.com.ar';

export async function GET() {
  const feed = new RSS({
    title: 'Saladillo Vivo - Últimas Noticias',
    description: 'El feed de noticias de Saladillo Vivo.',
    feed_url: `${SITE_URL}/rss.xml`,
    site_url: SITE_URL,
    language: 'es',
    pubDate: new Date(),
    ttl: 60,
  });

  try {
    const allNews = await getArticlesForRss();

    allNews.forEach(article => {
      const defaultImageUrl = 'https://saladillovivo.vercel.app/default-og-image.png';
      let finalImageUrl = article.imageUrl || defaultImageUrl;
      let imageMimeType = 'image/jpeg'; // Por defecto

      const extension = finalImageUrl.split('.').pop()?.toLowerCase();

      switch (extension) {
        case 'jpg':
        case 'jpeg':
          imageMimeType = 'image/jpeg';
          break;
        case 'png':
          imageMimeType = 'image/png';
          break;
        case 'gif': // Aunque no se pide explícitamente, es un tipo válido
          imageMimeType = 'image/gif';
          break;
        case 'webp':
        case 'svg':
        default: // Si es desconocida o no tiene extensión
          // Reemplazar la extensión por .jpg
          if (extension && (extension === 'webp' || extension === 'svg')) {
            finalImageUrl = finalImageUrl.replace(`.${extension}`, '.jpg');
          } else if (!extension && finalImageUrl.includes('.')) {
            // Si no hay extensión pero hay un punto, asumimos que es un archivo sin extensión y le añadimos .jpg
            finalImageUrl = `${finalImageUrl}.jpg`;
          } else if (!extension) {
            // Si no hay extensión ni punto, simplemente añadimos .jpg
            finalImageUrl = `${finalImageUrl}.jpg`;
          }
          imageMimeType = 'image/jpeg';
          console.warn(`RSS Feed: Image format for ${article.titulo} (${article.slug}) was not supported. Changed URL to ${finalImageUrl} and type to ${imageMimeType}.`);
          break;
      }

      const socialImageUrl = `https://www.saladillovivo.com.ar/api/branded-image`;

      feed.item({
        title: article.titulo,
        description: article.description,
        url: `https://www.saladillovivo.com.ar/noticia/${article.slug}`,
        guid: article.slug,
        date: article.createdAt,
        author: article.autor,
                      enclosure: { url: socialImageUrl, type: 'image/png' }, // Use socialImageUrl for enclosure
                    });    });

    const xml = feed.xml({ indent: true });

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Failed to generate RSS feed:', error);
    return new NextResponse('Could not generate RSS feed', { status: 500 });
  }
}
