
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
      const item: RSS.ItemOptions = {
        title: article.titulo,
        description: article.description,
        url: `${SITE_URL}/noticia/${article.slug}`,
        guid: article.slug,
        date: article.createdAt,
        author: article.autor,
        custom_elements: []
      };

      if (article.miniatura_url) {
        if (!item.custom_elements) {
          item.custom_elements = [];
        }
        item.custom_elements.push({
          'media:content': {
            _attr: {
              url: article.miniatura_url,
              medium: 'image',
              type: 'image/jpeg' // Asumimos jpeg como pide MAKE
            }
          }
        });
      }

      feed.item(item);
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
