// Ruta: src/app/feed/miniaturas/route.ts

import { NextResponse } from 'next/server';
// Asumo que tienes tu cliente de Supabase en @/lib/supabase/client
import { supabase } from '@/lib/supabase/client'; 

// Función para "escapar" caracteres XML ilegales (muy importante)
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
  // ¡LA CLAVE ESTÁ AQUÍ! -> .not('miniatura_url', 'is', null)
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, description, created_at, miniatura_url') // <-- Ajusta 'slug' y 'description' a tus columnas
    .not('miniatura_url', 'is', null) // <-- Solo artículos que SÍ tienen miniatura
    .order('created_at', { ascending: false })
    .limit(50); // Limita a los 50 más recientes

  if (error) {
    console.error('Error fetching articles for RSS:', error);
    return new NextResponse('Error fetching articles', { status: 500 });
  }

  // 2. Construir el XML del Feed RSS
  const siteUrl = 'https://www.saladillovivo.com.ar';
  
  // Encabezado del RSS.
  // Nota: 'xmlns:media' es el "espacio de nombres" que nos permite usar <media:content>
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
    // Asumo que la URL de tu noticia se construye así. ¡Ajusta si es necesario!
    const articleUrl = `${siteUrl}/noticia/${article.slug}`; 
    
    return `
      <item>
        <title>${escapeXML(article.title)}</title>
        <link>${articleUrl}</link>
        <guid>${articleUrl}</guid>
        <pubDate>${new Date(article.created_at).toUTCString()}</pubDate>
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
}