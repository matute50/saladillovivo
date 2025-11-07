// Ruta: src/app/feed/miniaturas/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; 

// Esta línea fuerza al servidor a generar el feed
// cada vez que se solicita, en lugar de cachearlo.
export const dynamic = 'force-dynamic';

// Función para "escapar" caracteres XML ilegales
function escapeXML(str: string) {
  if (!str) return '';
  return str.replace(/[<>&"']/g, (match) => {
    switch (match) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return match;
    }
  });
}

export async function GET() {
  // 1. Conectar a Supabase y obtener los artículos
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, description, createdAt, miniatura_url') 
    .not('miniatura_url', 'is', null) 
    .order('createdAt', { ascending: false }) 
    .limit(50); 

  if (error) {
    console.error('Error fetching articles for RSS:', error);
    return new NextResponse('Error fetching articles', { status: 500 });
  }

  // 2. Construir el XML del Feed RSS
  const siteUrl = 'https://www.saladillovivo.com.ar';
  
  const rssHeader = `
    <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
      <channel>
        <title>Saladillo Vivo - Artículos con Miniatura</title>
        <link>${siteUrl}</link>
        <description>Feed de noticias que tienen una miniatura generada para redes sociales.</description>
        <language>es-ar</language>
  `.trim();

  // 3. Crear cada <item> del feed
  const items = articles.map(article => {
    const articleUrl = `${siteUrl}/noticia/${article.slug}`; 
    
    return `
      <item>
        <title>${escapeXML(article.title)}</title>
        <link>${articleUrl}</link>
        <guid>${articleUrl}</guid>
        <pubDate>${new Date(article.createdAt).toUTCString()}</pubDate>
        <description>${escapeXML(article.description || '')}</description>
        
        <media:content 
          url="${article.miniatura_url}" 
          medium="image" 
          type="image/jpeg" 
        />
        
      </item>
    `;
  }).join('');

  const rssFooter = `
      </channel>
    </rss>
  `;

  // 4. Unir todo y enviarlo
  const xml = rssHeader + items + rssFooter;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}// FORZAR ACTUALIZACION