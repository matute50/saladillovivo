
import { NextResponse } from 'next/server';
import RSS from 'rss';
import { getArticles } from '@/lib/data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.saladillovivo.com';

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
    const { allNews } = await getArticles();

    allNews.forEach(article => {
      feed.item({
        title: article.titulo,
        description: article.description,
        url: `${SITE_URL}/noticia/${article.slug}`,
        guid: article.slug,
        date: article.createdAt,
        author: article.autor,
        enclosure: article.imageUrl ? { url: article.imageUrl, type: 'image/jpeg' } : undefined,
      });
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
