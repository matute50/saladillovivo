import dotenv from 'dotenv';
import fs from 'fs';
import RSS from 'rss';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno desde .env
dotenv.config({ path: '.env' });

// Inicializar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Las variables de entorno de Supabase no están definidas.');
  console.error('Asegúrate de que SUPABASE_URL y SUPABASE_KEY estén en tu archivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateRssFeed() {
  try {
    console.log('Iniciando la generación del feed RSS de noticias...');

    // 1. Obtener los últimos artículos de Supabase, ordenados por fecha de actualización
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, slug, description, updatedAt, createdAt')
      .order('createdAt', { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(`Error al obtener artículos de Supabase: ${error.message}`);
    }

    if (!articles || articles.length === 0) {
      console.warn('No se encontraron artículos para generar el feed RSS.');
      return;
    }

    console.log(`Se encontraron ${articles.length} artículos.`);

    // 2. Configurar el feed RSS
    const feed = new RSS({
      title: 'Últimas Noticias - Saladillo Vivo',
      description: 'Mantente al día con las últimas noticias y novedades de Saladillo Vivo.',
      feed_url: `https://www.saladillovivo.com.ar/feed.xml`,
      site_url: 'https://www.saladillovivo.com.ar',
      image_url: process.env.VITE_PUBLIC_LOGO_URL,
      language: 'es',
      pubDate: new Date().toUTCString(),
      ttl: 60, // Tiempo de vida del feed en minutos
    });

    // 3. Añadir cada artículo como un item al feed
    for (const article of articles) {
      if (article.slug && (article.updatedAt || article.createdAt)) {
        feed.item({
          title: article.title,
          description: article.description || '',
          url: `https://www.saladillovivo.com.ar/noticia/${article.slug}`,
          guid: article.id,
          date: new Date(article.updatedAt || article.createdAt).toUTCString(),
          author: 'Saladillo Vivo',
        });
      }
    }

    // 4. Generar el XML
    const xml = feed.xml({ indent: true });

    // 5. Escribir el archivo en la carpeta public
    fs.writeFileSync('./public/feed.xml', xml);

    console.log('¡Feed RSS de noticias generado con éxito en public/feed.xml!');

  } catch (error) {
    console.error('Ocurrió un error durante la generación del feed RSS:');
    console.error(error);
  }
}

generateRssFeed();