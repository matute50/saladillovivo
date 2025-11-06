
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
    custom_namespaces: {
      'media': 'http://search.yahoo.com/mrss/'
    }
  });

  try {
    let allNews = await getArticlesForRss();
    allNews = allNews.filter(article => article.miniatura_url);

    allNews.forEach(article => {
      if (article.miniatura_url) {
        feed.item({
          title: article.titulo, // El título es obligatorio
          description: article.miniatura_url, // Usamos la descripción para pasar la URL
          url: article.miniatura_url, // Opcional, pero buena práctica
          guid: article.id, // Guid único
          date: article.createdAt, // Fecha de creación
        });
      }
    });

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
