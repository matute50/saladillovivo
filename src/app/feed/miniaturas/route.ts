// Ruta: src/app/feed/miniaturas/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; 

export const dynamic = 'force-dynamic';

// Función para "escapar" caracteres XML
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
  // 1. Conectar a Supabase
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, description, createdAt, miniatura_url') 
    .not('miniatura_url', 'is', null) 
    .not('slug', 'is', null)           
    .not('description', 'is', null) 
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
        <title>Saladillo Vivo - Artículos con Miniatura (para Make.com)</title>
        <link>${siteUrl}</link>
        <description>Feed de noticias que tienen una miniatura generada para redes sociales.</description>
        <language>es-ar</language>
  `.trim();

  // 3. Crear cada <item> del feed
  const items = articles.map(article => {
    const articleUrl = `${siteUrl}/noticia/${article.slug}`; 
    
    // --- ARREGLO: Limpiar la URL de la miniatura ---
    // Instagram rechaza URLs con parámetros de consulta (como ?t=...)
    // 'article.miniatura_url' es: https://.../miniatura-127.jpg?t=1762552314026
    // 'cleanMiniaturaUrl' será: https://.../miniatura-127.jpg
    const cleanMiniaturaUrl = article.miniatura_url.split('?')[0];
    // --- FIN DEL ARREGLO ---
    
    return `
      <item>
        <title>${escapeXML(article.title)}</title>
        <link>${articleUrl}</link>
        <guid>${articleUrl}</guid>
        <pubDate>${new Date(article.createdAt).toUTCString()}</pubDate>
        <description>${escapeXML(article.description || '')}</description>
        
        <media:content 
          url="${cleanMiniaturaUrl}"  // <-- Usamos la URL limpia
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
}